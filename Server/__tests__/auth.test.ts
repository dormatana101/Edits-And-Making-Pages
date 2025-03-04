// __tests__/auth.test.ts
import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import userModel, { IUser } from "../models/Users";

type User = IUser & {
  accessToken?: string,
  refreshToken?: string,
  _id?: string
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "testuser",
  profilePicture: "",
  posts: []
};

const baseUrl = "/auth";

let app: any;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany({});
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.disconnect();
  app.close();
});

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).toBe(201);
  });

  test("Auth test register fail when user already exists", async () => {
    await request(app).post(baseUrl + "/register").send(testUser);
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).not.toBe(201);
  });

  test("Auth test register fail with invalid data", async () => {
    const response = await request(app).post(baseUrl + "/register").send({
      email: "invalidEmail",
    });
    expect(response.statusCode).not.toBe(201);

    const response2 = await request(app).post(baseUrl + "/register").send({
      email: "",
      password: "sdfsd",
    });
    expect(response2.statusCode).not.toBe(201);
  });

  test("Auth test login", async () => {
    await request(app).post(baseUrl + "/register").send(testUser);
    const response = await request(app).post(baseUrl + "/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    testUser._id = response.body._id;
  });

  test("Check tokens are not the same on subsequent login", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    const newAccessToken = response.body.accessToken;
    const newRefreshToken = response.body.refreshToken;
    expect(newAccessToken).not.toBe(testUser.accessToken);
    expect(newRefreshToken).not.toBe(testUser.refreshToken);
  });

  test("Auth test login fail with wrong credentials", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app).post(baseUrl + "/login").send({
      email: "nonexistent@user.com",
      password: "wrongpassword",
    });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Test refresh token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test("Double use refresh token should fail", async () => {
    const response = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);
    const newRefreshToken = response.body.refreshToken;

    const response2 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response2.statusCode).not.toBe(200);

    const response3 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: newRefreshToken,
    });
    expect(response3.statusCode).not.toBe(200);
  });

  
  test("Auth test logout", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    const response2 = await request(app).post(baseUrl + "/logout").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Test timeout token", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
        author: "invalid", 
      });
    expect(response2.statusCode).not.toBe(201);

    const response3 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;

    const response4 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
        author: "invalid", 
      });
    expect(response4.statusCode).toBe(201);
  });

  test("Test verifyRefreshToken user fail", async () => {
    const response = await request(app).post(baseUrl + "/refresh").send({});
    expect(response.statusCode).not.toBe(200);
  });

  test("should return error if TOKEN_SECRET is not set", async () => {
    const oldTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).not.toBe(200);
    process.env.TOKEN_SECRET = oldTokenSecret;
  });

  test("Create post should fail if TOKEN_SECRET is not set", async () => {
    const oldTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
        author: "invalid",
      });
    expect(response.statusCode).not.toBe(201);
    process.env.TOKEN_SECRET = oldTokenSecret;
  });

  test("Test verifyRefreshToken with invalid token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: "invalidToken",
    });
    expect(response.statusCode).not.toBe(200);
  });

  jest.setTimeout(10000);
});
