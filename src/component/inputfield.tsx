import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './inputfield.css';

const InputField: React.FC = () => {
  const [todo, setTodo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

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
      console.log('Sending request to create todo:', { todo: trimmedTodo });
      const response = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ todo: trimmedTodo })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create todo');
      }

      const data = await response.json();
      console.log('Todo created successfully:', data);
      
      setTodo("");
      window.dispatchEvent(new CustomEvent('todoAdded'));
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to create todo');
    }
  };

  return (
    <form className="input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a task"
        className="input__box"
        value={todo}
        onChange={(e) => {
          setTodo(e.target.value);
          setError(null);
        }}
      />
      <button 
        type="submit" 
        className="input__submit"
        disabled={!todo.trim()}
      >
        Add
      </button>
      {error && <div className="input__error">{error}</div>}
    </form>
  );
};

export default InputField;



