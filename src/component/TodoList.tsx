import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import './TodoList.css';

interface Todo {
  id: number;
  todo: string;
  isDone: boolean;
}

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoList: React.FC<Props> = ({ todos, setTodos }) => {
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const handleEdit = (id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSave = (id: number) => {
    if (editText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, todo: editText } : todo
        )
      );
      setEditId(null);
      setEditText("");
    }
  };

  const handleDelete = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const handleClearAll = (isCompleted: boolean) => {
    setTodos(todos.filter(todo => todo.isDone !== isCompleted));
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: number) => {
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
    <div className="todos__container">
      <div className="todo__list">
        <div className="todo__list--header">
          <h2 className="todo__list--title">Active Tasks</h2>
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
                  key={todo.id.toString()}
                  draggableId={todo.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`todo__single ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="todo__single--drag-handle">
                        <i className="fas fa-grip-vertical"></i>
                      </div>
                      {editId === todo.id ? (
                        <div className="todo__edit">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, todo.id)}
                            className="todo__edit--input"
                            autoFocus
                          />
                          <button 
                            className="todo__edit--save"
                            onClick={() => handleSave(todo.id)}
                            title="Save"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            className="todo__edit--cancel"
                            onClick={() => {
                              setEditId(null);
                              setEditText("");
                            }}
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="todo__single--text">{todo.todo}</span>
                          <div className="todo__single--actions">
                            <button 
                              className="todo__single--complete"
                              onClick={() => handleComplete(todo.id)}
                              title="Mark as completed"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button 
                              className="todo__single--edit"
                              onClick={() => handleEdit(todo.id, todo.todo)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="todo__single--delete"
                              onClick={() => handleDelete(todo.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
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
          <h2 className="todo__list--title">Completed Tasks</h2>
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
                  key={todo.id.toString()}
                  draggableId={todo.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`todo__single completed ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="todo__single--drag-handle">
                        <i className="fas fa-grip-vertical"></i>
                      </div>
                      {editId === todo.id ? (
                        <div className="todo__edit">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, todo.id)}
                            className="todo__edit--input"
                            autoFocus
                          />
                          <button 
                            className="todo__edit--save"
                            onClick={() => handleSave(todo.id)}
                            title="Save"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            className="todo__edit--cancel"
                            onClick={() => {
                              setEditId(null);
                              setEditText("");
                            }}
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="todo__single--text">{todo.todo}</span>
                          <div className="todo__single--actions">
                            <button 
                              className="todo__single--complete"
                              onClick={() => handleComplete(todo.id)}
                              title="Mark as active"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                            <button 
                              className="todo__single--edit"
                              onClick={() => handleEdit(todo.id, todo.todo)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="todo__single--delete"
                              onClick={() => handleDelete(todo.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
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
  );
};

export default TodoList; 