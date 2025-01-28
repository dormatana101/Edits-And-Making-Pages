import React, { useState, useEffect, useRef } from "react";
import "../css/ChatGPTPage.css";
import SERVER_URL from "../config"; 


interface ChatMessage {
  sender: "user" | "gpt";
  content: string;
}

const ChatGPTPage: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", content: input }]);
    const userMessage = input;
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/chatgpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          message: userMessage,
          store: false, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        if (errorData.error && errorData.error.message) {
          setError(errorData.error.message);
        } else {
          setError("An error occurred while communicating with ChatGPT.");
        }
        setMessages((prev) => [
          ...prev,
          { sender: "gpt", content: "Sorry, an error occurred." },
        ]);
        return;
      }

      const data = await response.json();
      const gptMessage = data.message;

      setMessages((prev) => [...prev, { sender: "gpt", content: gptMessage }]);
    } catch (error: unknown) {
      console.error("Error communicating with ChatGPT:", error);
      setError("Sorry, an error occurred while communicating with ChatGPT.");
      setMessages((prev) => [
        ...prev,
        { sender: "gpt", content: "Sorry, an error occurred." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatgpt-container">
      <h2>Chat with ChatGPT</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="chatgpt-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatgpt-message ${
              msg.sender === "user" ? "user-message" : "gpt-message"
            }`}
          >
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chatgpt-message gpt-message">
            <div className="message-content">ChatGPT is responding...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatgpt-input-area">
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatGPTPage;
