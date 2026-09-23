import { useState, useEffect } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./services/todoApi";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load todos khi mở trang
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm todo mới
  const handleAdd = async (title) => {
    try {
      const newTodo = await createTodo(title);
      setTodos((prev) => [...prev, newTodo]);
      showNotification("Đã thêm công việc!", "success");
    } catch (err) {
      showNotification("Không thể thêm công việc.");
      throw err;
    }
  };

  // Đánh dấu hoàn thành / chưa hoàn thành
  const handleToggle = async (id, completed) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await updateTodo(id, { title: todo.title, completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      showNotification("Không thể cập nhật trạng thái.");
      throw err;
    }
  };

  // Sửa tiêu đề todo
  const handleUpdate = async (id, title) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await updateTodo(id, { title, completed: todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showNotification("Đã cập nhật!", "success");
    } catch (err) {
      showNotification("Không thể sửa công việc.");
      throw err;
    }
  };

  // Xóa todo
  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      showNotification("Đã xóa!", "success");
    } catch (err) {
      showNotification("Không thể xóa công việc.");
      throw err;
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="header-icon">📝</div>
          <h1>Todo App</h1>
          <p className="header-subtitle">Quản lý công việc của bạn</p>
        </header>

        <TodoForm onAdd={handleAdd} />

        {todos.length > 0 && (
          <div className="todo-stats">
            <span>{todos.length} công việc</span>
            <span className="stats-divider">•</span>
            <span className="stats-completed">{completedCount} hoàn thành</span>
          </div>
        )}

        {loading && <div className="todo-loading">⏳ Đang tải...</div>}

        {error && (
          <div className="todo-error">
            <p>{error}</p>
            <button className="todo-btn btn-retry" onClick={loadTodos}>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <footer className="app-footer">
          <p>Docker Mini App — React + Spring Boot + PostgreSQL</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
