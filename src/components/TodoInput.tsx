import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { todoService } from '../services/todoService';
import './TodoInput.css';

/**
 * TodoInput Component
 * 
 * A form component that allows users to add new todos to their list.
 * Features:
 * - Input validation
 * - Error handling
 * - Authentication check
 * - Real-time feedback
 */
const TodoInput: React.FC = () => {
  const [todo, setTodo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  /**
   * Handles the form submission for creating a new todo
   * @param e - The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Not authenticated. Please log in again.");
      return;
    }

    const trimmedTodo = todo.trim();
    if (!trimmedTodo) {
      setError("Please enter a task");
      return;
    }

    try {
      await todoService.createTodo(trimmedTodo);
      setTodo("");
      // Notify other components that a new todo was added
      window.dispatchEvent(new CustomEvent('todoAdded'));
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to create todo');
    }
  };

  return (
    <form className="input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="Enter a task"
        className="input-box"
        aria-label="New task input"
      />
      <button 
        className="input-submit" 
        type="submit" 
        disabled={!todo.trim()}
        aria-label="Add task"
      >
        Add
      </button>
      {error && <div className="error-message" role="alert">{error}</div>}
    </form>
  );
};

export default TodoInput; 