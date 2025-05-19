import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { todoService, type Todo } from '../services/todoService';
import TodoInput from './TodoInput';
import './TodoList.css';

/**
 * TodoList Component
 * 
 * Displays and manages a list of todos with the following features:
 * - Fetch and display todos
 * - Mark todos as complete/incomplete
 * - Delete todos
 * - Real-time updates
 * - Error handling
 * - Loading states
 */
const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  /**
   * Fetches todos from the server
   */
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.fetchTodos();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the completion status of a todo
   * @param id - The ID of the todo to toggle
   */
  const toggleTodo = async (id: string) => {
    try {
      setError(null);
      const updatedTodo = await todoService.updateTodo(id, { isDone: !todos.find(todo => todo._id === id)?.isDone });
      setTodos(todos.map(todo => 
        todo._id === id ? { ...todo, isDone: updatedTodo.isDone } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to update todo');
    }
  };

  /**
   * Deletes a todo
   * @param id - The ID of the todo to delete
   */
  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete todo');
    }
  };

  // Initial fetch and event listener setup
  useEffect(() => {
    if (token) {
      fetchTodos();
    }

    const handleTodoAdded = () => {
      fetchTodos();
    };

    window.addEventListener('todoAdded', handleTodoAdded);
    return () => window.removeEventListener('todoAdded', handleTodoAdded);
  }, [token]);

  const handleEdit = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSave = async (id: string) => {
    if (editText.trim()) {
      try {
        await todoService.updateTodo(id, { todo: editText.trim() });
        await fetchTodos();
        setEditId(null);
        setEditText("");
        setError(null);
      } catch (error) {
        console.error('Error updating todo:', error);
        setError('Failed to update todo. Please try again.');
      }
    }
  };

  const handleClearAll = async (isCompleted: boolean) => {
    const todosToDelete = todos.filter(todo => todo.isDone === isCompleted);
    
    try {
      await todoService.deleteMultipleTodos(todosToDelete.map(todo => todo._id));
      await fetchTodos();
      setError(null);
    } catch (error) {
      console.error('Error clearing todos:', error);
      setError('Failed to clear todos. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      setEditId(null);
      setEditText("");
    }
  };

  const activeTodos = todos.filter(todo => !todo.isDone);
  const completedTodos = todos.filter(todo => todo.isDone);

  const TodoItem = ({ todo, index }: { todo: Todo; index: number }) => (
    <Draggable draggableId={todo._id} index={index}>
      {(provided) => (
        <div
          className={`todo-item ${todo.isDone ? 'done' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {editId === todo._id ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, todo._id)}
              className="edit-input"
              autoFocus
            />
          ) : (
            <span className="todo-text">{todo.todo}</span>
          )}
          <div className="todo-actions">
            <button
              className="icon-button"
              onClick={() => toggleTodo(todo._id)}
            >
              <FaCheck className={todo.isDone ? 'done' : ''} />
            </button>
            {!todo.isDone && (
              <button
                className="icon-button"
                onClick={() => handleEdit(todo._id, todo.todo)}
              >
                <FaEdit />
              </button>
            )}
            <button
              className="icon-button delete"
              onClick={() => deleteTodo(todo._id)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );

  if (!token) {
    return <div className="todo-list-error">Please log in to view your todos</div>;
  }

  if (loading) {
    return <div className="todo-list-loading">Loading todos...</div>;
  }

  if (error) {
    return <div className="todo-list-error">{error}</div>;
  }

  return (
    <div className="container">
      <TodoInput />
      {error && <div className="error-message">{error}</div>}
      <div className="todos-container">
        <Droppable droppableId="active">
          {(provided) => (
            <div
              className="todos-section"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2>Active Tasks</h2>
              {activeTodos.map((todo, index) => (
                <TodoItem key={todo._id} todo={todo} index={index} />
              ))}
              {provided.placeholder}
              {activeTodos.length > 0 && (
                <button
                  className="clear-button"
                  onClick={() => handleClearAll(false)}
                >
                  Clear All Active
                </button>
              )}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="completed">
          {(provided) => (
            <div
              className="todos-section completed"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2>Completed Tasks</h2>
              {completedTodos.map((todo, index) => (
                <TodoItem key={todo._id} todo={todo} index={index} />
              ))}
              {provided.placeholder}
              {completedTodos.length > 0 && (
                <button
                  className="clear-button"
                  onClick={() => handleClearAll(true)}
                >
                  Clear All Completed
                </button>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default TodoList; 