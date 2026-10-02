const API_URL = "/api/todos";

export async function getTodos() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách todo");
  }
  return response.json();
}

export async function createTodo(title) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false }),
  });
  if (!response.ok) {
    throw new Error("Không thể tạo todo mới");
  }
  return response.json();
}

export async function updateTodo(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Không thể cập nhật todo");
  }
  return response.json();
}

export async function deleteTodo(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Không thể xóa todo");
  }
}
