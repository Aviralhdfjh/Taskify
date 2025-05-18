import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './component/TodoList';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import { authService } from './services/api';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

const AppContent: React.FC = () => {
  const { token } = useAuth();

  const onDragEnd = async (result: DropResult) => {
    if (!token) return;

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    try {
      const response = await fetch(`http://localhost:5000/api/todos/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isDone: destination.droppableId === 'completed'
        })
      });

      if (response.ok) {
        // Trigger a re-fetch
        window.dispatchEvent(new CustomEvent('todoAdded'));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <TodoList />
            </PrivateRoute>
          }
        />
      </Routes>
    </DragDropContext>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
