import request from "supertest";
import app from "../server"; // אם השרת שלך נמצא כאן
import NodeCache from "node-cache";
import fetch from "node-fetch";

// Mock של fetch
jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");

describe("chatWithGPT API Tests", () => {
  const OPENAI_API_KEY = "your-api-key"; // אם יש לך API KEY אמיתי או אתחול במוק
  const cache = new NodeCache();

  beforeEach(() => {
    cache.flushAll(); // לנקות את ה-cache לפני כל בדיקה
  });

  it("should return an error if no message is provided", async () => {
    const response = await request(app)
      .post("/api/chat") // עדכן את הנתיב בהתאם לנתיב שלך
      .send({});

    expect(response.statusCode).toBe(400); // וודא שהסטטוס הוא 400
    expect(response.body.error).toBe("Message is required");
  });

  it("should return a cached response if the message is in cache", async () => {
    const message = "Hello GPT!";
    const cachedResponse = "Cached response";

    // Mock של cache.get כדי להחזיר את התשובה שהוזנה
    cache.set(message, cachedResponse);

    const response = await request(app)
      .post("/api/chat")
      .send({ message });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(cachedResponse);
    expect(cache.get).toHaveBeenCalledWith(message);
  });

  it("should call OpenAI API when message is not in cache", async () => {
    const message = "Hello GPT!";
    const gptResponse = {
      choices: [
        {
          message: { content: "Hi, how can I help you?" },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    // Mock של fetch כך שיחזיר תשובה לדימוי של OpenAI API
    (fetch as unknown as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify(gptResponse), { status: 200 }));

    const response = await request(app)
      .post("/api/chat")
      .send({ message });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Hi, how can I help you?");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should handle OpenAI API error gracefully", async () => {
    const message = "Hello GPT!";

    // Mock של fetch שיחזיר שגיאה מ-OpenAI
    (fetch as unknown as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 }));

    const response = await request(app)
      .post("/api/chat")
      .send({ message });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Invalid request");
  });

  it("should return 500 if there is an error in the server or OpenAI API", async () => {
    const message = "Hello GPT!";

    // Mock של fetch שיחזיר שגיאה כלשהי
    (fetch as unknown as jest.Mock).mockRejectedValueOnce(new Error("Internal Server Error"));

    const response = await request(app)
      .post("/api/chat")
      .send({ message });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });
});
