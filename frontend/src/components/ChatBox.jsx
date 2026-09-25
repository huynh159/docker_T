import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chatApi";
import "./ChatBox.css";

const QUICK_PROMPTS = [
  {
    icon: "🎯",
    title: "Lập kế hoạch hôm nay",
    prompt: "Gợi ý cho tôi danh sách 5 việc quan trọng cần ưu tiên làm việc hôm nay để đạt hiệu suất cao.",
  },
  {
    icon: "⚡",
    title: "Ma trận Eisenhower",
    prompt: "Giải thích nhanh cách chia công việc Todo theo ma trận Eisenhower (Khẩn cấp vs Quan trọng).",
  },
  {
    icon: "💡",
    title: "Ý tưởng Todo",
    prompt: "Tôi đang làm đồ án web Fullstack Spring Boot và React, hãy gợi ý cho tôi các Todo cần làm tiếp theo.",
  },
];

export default function ChatBox({ onAddTodoFromAi }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      content:
        "Xin chào! Tôi là Gemini AI Assistant 🚀. Tôi có thể giúp bạn lên kế hoạch, phân tích công việc hoặc giải đáp bất kỳ câu hỏi nào. Hãy thử trò chuyện với tôi nhé!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessageId = "user-" + Date.now();
    const userMessage = {
      id: userMessageId,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const data = await sendChatMessage(messageContent, conversationId);
      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }

      const aiReply = data?.reply || "Tôi không nhận được phản hồi từ AI.";
      const aiMessage = {
        id: "ai-" + Date.now(),
        role: "ai",
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: "err-" + Date.now(),
        role: "ai",
        isError: true,
        content: `⚠️ ${err.message || "Đã xảy ra lỗi khi kết nối với Gemini AI. Vui lòng kiểm tra lại cấu hình."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "ai",
        content: "Phiên trò chuyện mới đã sẵn sàng! Bạn muốn hỏi hoặc làm gì tiếp theo?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="chatbox-card">
      {/* Header */}
      <div className="chatbox-header">
        <div className="chatbox-title-group">
          <div className="chatbox-avatar">
            <span className="sparkle-icon">✨</span>
            <span className="online-indicator"></span>
          </div>
          <div>
            <div className="chatbox-title">
              Gemini AI Chat
              <span className="chatbox-badge">2.5 Flash</span>
            </div>
            <div className="chatbox-status">
              {isLoading ? "Gemini đang suy nghĩ..." : "Sẵn sàng hỗ trợ bạn"}
            </div>
          </div>
        </div>

        <button
          className="chatbox-btn-action"
          onClick={handleNewChat}
          title="Tạo hội thoại mới"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Mới
        </button>
      </div>

      {/* Messages Feed */}
      <div className="chatbox-messages">
        {messages.length === 1 && (
          <div className="chatbox-welcome">
            <div className="welcome-glow-icon">🤖</div>
            <h3>Trò chuyện thông minh cùng AI</h3>
            <p>Chọn câu hỏi mẫu dưới đây để bắt đầu ngay:</p>
            <div className="quick-prompts-grid">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  className="quick-prompt-card"
                  onClick={() => handleSend(item.prompt)}
                  type="button"
                >
                  <span className="quick-prompt-icon">{item.icon}</span>
                  <div className="quick-prompt-text">
                    <strong>{item.title}</strong>
                    <span>{item.prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-row ${msg.role === "user" ? "user-row" : "ai-row"}`}
          >
            {msg.role === "ai" && (
              <div className="message-avatar ai-avatar">
                <span>✨</span>
              </div>
            )}

            <div
              className={`message-bubble ${
                msg.role === "user" ? "user-bubble" : "ai-bubble"
              } ${msg.isError ? "error-bubble" : ""}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-footer">
                <span className="message-time">{msg.timestamp}</span>
                {msg.role === "ai" && !msg.isError && (
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Sao chép nội dung"
                    type="button"
                  >
                    {copiedId === msg.id ? "✓ Đã chép" : "Sao chép"}
                  </button>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="message-avatar user-avatar">
                <span>👤</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-message-row ai-row">
            <div className="message-avatar ai-avatar">
              <span>✨</span>
            </div>
            <div className="message-bubble ai-bubble typing-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-label">Gemini đang viết...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbox-input-wrapper">
        <form
          className="chatbox-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <textarea
            ref={textareaRef}
            className="chatbox-textarea"
            rows="1"
            placeholder="Hỏi Gemini điều gì đó... (Enter để gửi)"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chatbox-send-btn"
            disabled={!input.trim() || isLoading}
            title="Gửi tin nhắn"
          >
            {isLoading ? (
              <div className="spinner-mini"></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
        <div className="chatbox-hint">
          <span>Shift + Enter để xuống dòng</span>
          {conversationId && (
            <span className="conversation-tag">Phiên #{conversationId}</span>
          )}
        </div>
      </div>
    </div>
  );
}
