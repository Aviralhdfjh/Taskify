import React, { useState } from 'react'
import './App.css'
import InputField from './component/inputfield'
import TodoList from './component/TodoList'

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

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceList = source.droppableId === 'active' ? 'active' : 'completed';
    const destList = destination.droppableId === 'active' ? 'active' : 'completed';

    const sourceItems = todos.filter(todo => 
      sourceList === 'active' ? !todo.isDone : todo.isDone
    );
    const destItems = todos.filter(todo => 
      destList === 'active' ? !todo.isDone : todo.isDone
    );

    const [movedItem] = sourceItems.splice(source.index, 1);
    const updatedItem = { ...movedItem, isDone: destList === 'completed' };

    if (sourceList === destList) {
      sourceItems.splice(destination.index, 0, movedItem);
    } else {
      destItems.splice(destination.index, 0, updatedItem);
    }

    const newTodos = todos.filter(todo => 
      (sourceList === 'active' ? !todo.isDone : todo.isDone) &&
      (destList === 'active' ? !todo.isDone : todo.isDone)
    );

    setTodos([...newTodos, ...sourceItems, ...destItems]);
  };

  return (
    <div className="App">
      <h1 className="heading">
        <i className="fas fa-clipboard-list"></i> Taskify
      </h1>
      <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
      <TodoList 
        todos={todos} 
        setTodos={setTodos} 
        onDragEnd={onDragEnd}
      />
    </div>
  );
};

export default App;
