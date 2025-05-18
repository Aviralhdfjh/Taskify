import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import InputField from './inputfield';
import './TodoList.css';

interface Todo {
  _id: string;
  todo: string;
  isDone: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const { token, user } = useAuth();

  useEffect(() => {
    fetchTodos();
    window.addEventListener('todoAdded', fetchTodos);
    return () => window.removeEventListener('todoAdded', fetchTodos);
  }, [token]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleEdit = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSave = async (id: string) => {
    if (editText.trim()) {
      try {
        const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ todo: editText })
        });
        
        if (response.ok) {
          await fetchTodos();
          setEditId(null);
          setEditText("");
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleComplete = async (id: string, isDone: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isDone: !isDone })
      });
      
      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleClearAll = async (isCompleted: boolean) => {
    const todosToDelete = todos.filter(todo => todo.isDone === isCompleted);
    
    try {
      await Promise.all(
        todosToDelete.map(todo =>
          fetch(`http://localhost:5000/api/todos/${todo._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      
      await fetchTodos();
    } catch (error) {
      console.error('Error clearing todos:', error);
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="heading">
          <i className="fas fa-clipboard-list"></i> Welcome, {user?.name || 'User'}
        </h1>
        <InputField />
      </header>

      <div className="todos__container">
        <div className="todo__list">
          <div className="todo__list--header">
            <h2 className="todo__list--title">Active Tasks ({activeTodos.length})</h2>
            {activeTodos.length > 0 && (
              <button
                className="todo__list--clear"
                onClick={() => handleClearAll(false)}
                title="Clear all active tasks"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
          <Droppable droppableId="active">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`todo__list--content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              >
                {activeTodos.map((todo, index) => (
                  <Draggable
                    key={todo._id}
                    draggableId={todo._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo__single ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        {editId === todo._id ? (
                          <div className="todo__edit">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, todo._id)}
                              className="todo__edit--input"
                              autoFocus
                            />
                            <button 
                              className="todo__edit--save"
                              onClick={() => handleSave(todo._id)}
                              title="Save"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="todo__single--text">{todo.todo}</span>
                            <div className="todo__single--actions">
                              <button
                                onClick={() => handleEdit(todo._id, todo.todo)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleComplete(todo._id, todo.isDone)}
                                title="Complete"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(todo._id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="todo__list">
          <div className="todo__list--header">
            <h2 className="todo__list--title">Completed Tasks ({completedTodos.length})</h2>
            {completedTodos.length > 0 && (
              <button
                className="todo__list--clear"
                onClick={() => handleClearAll(true)}
                title="Clear all completed tasks"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
          <Droppable droppableId="completed">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`todo__list--content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              >
                {completedTodos.map((todo, index) => (
                  <Draggable
                    key={todo._id}
                    draggableId={todo._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo__single completed ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        {editId === todo._id ? (
                          <div className="todo__edit">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, todo._id)}
                              className="todo__edit--input"
                              autoFocus
                            />
                            <button 
                              className="todo__edit--save"
                              onClick={() => handleSave(todo._id)}
                              title="Save"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="todo__single--text">{todo.todo}</span>
                            <div className="todo__single--actions">
                              <button
                                onClick={() => handleEdit(todo._id, todo.todo)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleComplete(todo._id, todo.isDone)}
                                title="Uncomplete"
                              >
                                <i className="fas fa-undo"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(todo._id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  );
};

export default TodoList; 