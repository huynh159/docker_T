import { useState, useEffect } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./services/todoApi";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import Login from "./components/Login";
import ChatBox from "./components/ChatBox";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("both"); // "both", "todos", "chat"

  // Kiểm tra xem đã đăng nhập chưa (có token trong localStorage không)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      loadTodos();
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    loadTodos();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setTodos([]);
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError("Không thể tải danh sách công việc. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (title) => {
    try {
      const newTodo = await createTodo(title);
      setTodos((prev) => [...prev, newTodo]);
      showNotification("Đã thêm công việc thành công!", "success");
    } catch (err) {
      showNotification("Không thể thêm công việc.");
      throw err;
    }
  };

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

  const handleUpdate = async (id, title) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await updateTodo(id, { title, completed: todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showNotification("Đã cập nhật công việc!", "success");
    } catch (err) {
      showNotification("Không thể sửa công việc.");
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      showNotification("Đã xóa công việc!", "success");
    } catch (err) {
      showNotification("Không thể xóa công việc.");
      throw err;
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  // Nếu chưa đăng nhập, hiển thị Giao diện Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">⚡</span>
          <span className="navbar-title">TodoAI Studio</span>
          <span className="navbar-pill">v2.0 Fullstack</span>
        </div>

        {/* View mode buttons for mobile/tablet */}
        <div className="view-mode-tabs">
          <button
            className={`tab-btn ${activeTab === "both" ? "active" : ""}`}
            onClick={() => setActiveTab("both")}
            type="button"
          >
            🔲 Cả hai
          </button>
          <button
            className={`tab-btn ${activeTab === "todos" ? "active" : ""}`}
            onClick={() => setActiveTab("todos")}
            type="button"
          >
            📝 Todo ({todos.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
            type="button"
          >
            🤖 AI Chat
          </button>
        </div>

        <div className="navbar-user">
          <div className="user-badge">
            <span className="user-avatar-circle">A</span>
            <span className="user-name">admin</span>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Thoát</span>
          </button>
        </div>
      </nav>

      {/* Main Dashboard Grid */}
      <main className="dashboard-container">
        <div className={`dashboard-grid tab-${activeTab}`}>
          {/* Left Column: Todo Management */}
          {(activeTab === "both" || activeTab === "todos") && (
            <section className="dashboard-panel todo-panel">
              <div className="panel-header">
                <div>
                  <h2>Danh sách công việc</h2>
                  <p className="panel-subtitle">Quản lý và theo dõi các mục tiêu hàng ngày</p>
                </div>
                {todos.length > 0 && (
                  <div className="panel-stats-chip">
                    <span className="stats-accent">{completedCount}</span>/{todos.length} xong
                  </div>
                )}
              </div>

              <TodoForm onAdd={handleAdd} />

              {todos.length > 0 && (
                <div className="todo-stats">
                  <span>{todos.length} công việc</span>
                  <span className="stats-divider">•</span>
                  <span className="stats-completed">{completedCount} hoàn thành</span>
                </div>
              )}

              {loading && <div className="todo-loading">⏳ Đang tải dữ liệu...</div>}

              {error && (
                <div className="todo-error">
                  <p>{error}</p>
                  <button className="todo-btn btn-retry" onClick={loadTodos}>
                    Thử lại
                  </button>
                </div>
              )}

              {!loading && !error && (
                <div className="todo-list-scroll">
                  <TodoList
                    todos={todos}
                    onToggle={handleToggle}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </section>
          )}

          {/* Right Column: AI Assistant Chat */}
          {(activeTab === "both" || activeTab === "chat") && (
            <section className="dashboard-panel chat-panel">
              <ChatBox onAddTodoFromAi={handleAdd} />
            </section>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Docker Mini App — React + Spring Boot 3 + Google Gemini AI + PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
