const API_URL = "/api/chat";

/**
 * Gửi tin nhắn đến AI chatbot
 * @param {string} message - Tin nhắn của người dùng
 * @param {number|null} conversationId - ID phiên hội thoại (null nếu tạo mới)
 * @returns {Promise<{conversationId: number, reply: string}>}
 */
export async function sendChatMessage(message, conversationId = null) {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversationId: conversationId || null,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Lỗi ${response.status}: Không thể gửi tin nhắn`;
    throw new Error(errorMsg);
  }

  return data;
}
