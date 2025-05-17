import React, { useState } from 'react'
import './App.css'
import InputField from './component/inputfield'
import TodoList from './component/TodoList'
import { DragDropContext } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';

interface Todo {
  id: number;
  todo: string;
  isDone: boolean;
}

const App: React.FC = () => {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (todo) {
      const newTodo: Todo = {
        id: Date.now(),
        todo: todo,
        isDone: false
      };
      setTodos([...todos, newTodo]);
      setTodo("");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

   
    const newTodos = [...todos];

    const sourceIndex = newTodos.findIndex(
      todo => todo.id.toString() === result.draggableId
    );

    if (sourceIndex === -1) return;

    const movedItem = newTodos[sourceIndex];
    if (!movedItem) return;
    
    newTodos.splice(sourceIndex, 1);

    const updatedItem: Todo = {
      id: movedItem.id,
      todo: movedItem.todo,
      isDone: destination.droppableId === 'completed'
    };

    const destinationIndex = newTodos.findIndex(
      todo => todo.isDone === (destination.droppableId === 'completed')
    );

    if (destinationIndex === -1) {
      newTodos.push(updatedItem);
    } else {
      newTodos.splice(destination.index, 0, updatedItem);
    }

    setTodos(newTodos);
  };

  return (
    <div className="App">
      <h1 className="heading">
        <i className="fas fa-clipboard-list"></i> Taskify
      </h1>
      <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
      <DragDropContext onDragEnd={onDragEnd}>
        <TodoList 
          todos={todos} 
          setTodos={setTodos}
        />
      </DragDropContext>
    </div>
  );
};

export default App;
