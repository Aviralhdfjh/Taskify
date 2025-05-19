import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, taskService } from '../services/api';
import '../styles/Dashboard.css';

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks();
      if (isMounted) {
        setTasks(data);
        setError('');
      }
    } catch (err: any) {
      if (isMounted) {
        setError('Failed to fetch tasks');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const task = await taskService.createTask(newTask);
      if (isMounted) {
        setTasks(prevTasks => [...prevTasks, task]);
        setNewTask({ title: '', description: '' });
        setError('');
      }
    } catch (err: any) {
      if (isMounted) {
        setError('Failed to create task');
      }
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await taskService.updateTask(taskId, { completed });
      if (isMounted) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? { ...task, completed } : task
          )
        );
        setError('');
      }
    } catch (err: any) {
      if (isMounted) {
        setError('Failed to update task');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      if (isMounted) {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        setError('');
      }
    } catch (err: any) {
      if (isMounted) {
        setError('Failed to delete task');
      }
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>Taskify</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome to Taskify</h2>
          <p>Organize your tasks efficiently and boost your productivity</p>
        </div>

        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Add a new task..."
            className="task-input"
          />
          <input
            type="text"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add description (optional)"
            className="task-input"
          />
          <button type="submit" className="add-task-button">Add Task</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="tasks-container">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task._id, !task.completed)}
                    className="task-checkbox"
                  />
                  <div className="task-details">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="delete-task-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 