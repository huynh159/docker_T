import { useState } from "react";

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } catch {
      /* error handled by parent */
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === todo.title) {
      setIsEditing(false);
      setEditTitle(todo.title);
      return;
    }
    setIsLoading(true);
    try {
      await onUpdate(todo.id, trimmed);
      setIsEditing(false);
    } catch {
      /* error handled by parent */
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } catch {
      /* error handled by parent */
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") handleCancelEdit();
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""} ${isLoading ? "loading" : ""}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isLoading || isEditing}
      />

      {isEditing ? (
        <input
          type="text"
          className="todo-edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isLoading}
        />
      ) : (
        <span className="todo-title" onDoubleClick={() => setIsEditing(true)}>
          {todo.title}
        </span>
      )}

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="todo-btn btn-save" onClick={handleSaveEdit} disabled={isLoading}>
              Lưu
            </button>
            <button className="todo-btn btn-cancel" onClick={handleCancelEdit} disabled={isLoading}>
              Hủy
            </button>
          </>
        ) : (
          <>
            <button className="todo-btn btn-edit" onClick={() => setIsEditing(true)} disabled={isLoading}>
              Sửa
            </button>
            <button className="todo-btn btn-delete" onClick={handleDelete} disabled={isLoading}>
              Xóa
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;
