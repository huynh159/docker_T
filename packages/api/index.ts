import axios from 'axios';

// Lấy IP từ biến môi trường, hoặc bạn thay trực tiếp bằng IP LAN máy của bạn
// Ví dụ: 192.168.1.15 là IP máy tính của bạn
// Dùng 10.0.2.2 nếu test trên Android Emulator
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ví dụ một hàm gọi API lấy danh sách todos (nếu backend bạn có)
export const getTodos = async () => {
  try {
    const response = await apiClient.get('/todos');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getTodos:", error);
    throw error;
  }
};
