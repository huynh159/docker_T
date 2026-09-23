import { useState } from "react";

function TodoForm({ onAdd }) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onAdd(trimmed);
      setInputValue("");
    } catch {
      /* error handled by parent */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Nhập công việc..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isSubmitting}
      />
      <button type="submit" className="todo-btn btn-add" disabled={isSubmitting || !inputValue.trim()}>
        {isSubmitting ? "..." : "Thêm"}
      </button>
    </form>
  );
}

export default TodoForm;
