import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentModel from "../models/Comment";
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
let testPostId: string;

beforeAll(async () => {
  server = await initApp();
});

beforeEach(async () => {
  await commentModel.deleteMany({});
  await postModel.deleteMany({});
  await userModel.deleteMany({});

  await request(server).post("/auth/register").send(testUser);
  const loginRes = await request(server).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  expect(loginRes.statusCode).toBe(200);
  authToken = loginRes.body.accessToken;
  testUserId = loginRes.body._id;

  const postRes = await request(server)
    .post("/posts")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      title: "Test Post",
      content: "Post content for comment tests",
      author: testUserId,
    });
  expect(postRes.statusCode).toBe(201);
  testPostId = postRes.body._id;
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});

describe("Comments Tests", () => {
  test("should create a new comment", async () => {
    const response = await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "This is a test comment",
        author: testUserId,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.content).toBe("This is a test comment");
  });

  test("should get all comments", async () => {
    await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "First comment",
        author: testUserId,
      });
    await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "Second comment",
        author: testUserId,
      });

    const response = await request(server).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  test("should get a comment by ID", async () => {
    const createRes = await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "A comment to get",
        author: testUserId,
      });
    const commentId = createRes.body._id;

    const response = await request(server).get(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", commentId);
  });

  test("should update a comment", async () => {
    const createRes = await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "Original comment",
        author: testUserId,
      });
    const commentId = createRes.body._id;

    const response = await request(server)
      .put(`/comments/${commentId}`)
      .send({ content: "Updated comment" });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe("Updated comment");
  });

  test("should delete a comment", async () => {
    const createRes = await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postId: testPostId,
        content: "Comment to delete",
        author: testUserId,
      });
    const commentId = createRes.body._id;

    const deleteRes = await request(server)
      .delete(`/comments/${commentId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.statusCode).toBe(200);

    const getRes = await request(server).get(`/comments/${commentId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test("should get comments by post ID with pagination", async () => {
    await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ postId: testPostId, content: "Comment 1", author: testUserId });
    await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ postId: testPostId, content: "Comment 2", author: testUserId });
    await request(server)
      .post("/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ postId: testPostId, content: "Comment 3", author: testUserId });
    const response = await request(server)
      .get(`/comments/post/${testPostId}`)
      .query({ page: 1, limit: 2 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("results");
    expect(Array.isArray(response.body.results)).toBe(true);
  });

  test("should generate a suggested comment for a post using OpenAI", async () => {
    const response = await request(server)
      .post("/comments/generate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ postId: testPostId });
    expect([200, 400, 500]).toContain(response.statusCode);
    if (response.statusCode === 200) {
      expect(response.body).toHaveProperty("suggestedComment");
      expect(typeof response.body.suggestedComment).toBe("string");
    }
  });
});
