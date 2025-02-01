import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/Post";
import userModel from "../models/Users";

type User = {
  email: string;
  password: string;
  username?: string;
  accessToken?: string;
  _id?: string;
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "testuser",
};

let server: any;
let authToken: string;
let testUserId: string;

beforeAll(async () => {
  server = await initApp();
});

beforeEach(async () => {
  await postModel.deleteMany({});
  await userModel.deleteMany({});

  // Регистрируем и логиним тестового пользователя
  await request(server).post("/auth/register").send(testUser);
  const loginRes = await request(server).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  expect(loginRes.statusCode).toBe(200);
  authToken = loginRes.body.accessToken;
  testUserId = loginRes.body._id;
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});

describe("Posts Tests", () => {
  test("should create a new post", async () => {
    const response = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Post",
        content: "This is test post content",
        author: testUserId,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe("Test Post");
  });

  test("should get a post by ID", async () => {
    // Создаем пост
    const createRes = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Post",
        content: "This is test post content",
        author: testUserId,
      });
    const postId = createRes.body._id;
    const response = await request(server).get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", postId);
  });

  test("should update a post", async () => {
    // Создаем пост
    const createRes = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Post",
        content: "This is test post content",
        author: testUserId,
      });
    const postId = createRes.body._id;
    const response = await request(server)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Updated Post Title",
        content: "Updated post content",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated Post Title");
  });

  test("should delete a post", async () => {
    // Создаем пост
    const createRes = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Post",
        content: "This is test post content",
        author: testUserId,
      });
    const postId = createRes.body._id;
    const deleteRes = await request(server)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.statusCode).toBe(200);
    const getRes = await request(server).get(`/posts/${postId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test("should toggle like on a post", async () => {
    // Создаем пост
    const createRes = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Post",
        content: "This is test post content",
        author: testUserId,
      });
    const postId = createRes.body._id;
    // Первый вызов: лайкаем пост. Передаем userId через query-параметр
    const likeRes1 = await request(server)
      .post(`/posts/${postId}/like?userId=${testUserId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(likeRes1.statusCode).toBe(200);
    expect(likeRes1.body).toHaveProperty("message", "Post liked");
    expect(typeof likeRes1.body.likesCount).toBe("number");

    // Второй вызов: убираем лайк
    const likeRes2 = await request(server)
      .post(`/posts/${postId}/like?userId=${testUserId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(likeRes2.statusCode).toBe(200);
    expect(likeRes2.body).toHaveProperty("message", "Like removed");
  });
});
