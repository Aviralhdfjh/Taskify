import { api } from './api';

export interface Todo {
  _id: string;
  todo: string;
  isDone: boolean;
  user: string;
}

export const todoService = {
  async fetchTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<Todo[]>('/todos');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  async createTodo(todo: string): Promise<Todo> {
    try {
      const response = await api.post<Todo>('/todos', { todo });
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    try {
      const response = await api.put<Todo>(`/todos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async deleteTodo(id: string): Promise<void> {
    try {
      await api.delete(`/todos/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  async deleteMultipleTodos(ids: string[]): Promise<void> {
    try {
      await Promise.all(ids.map(id => this.deleteTodo(id)));
    } catch (error) {
      console.error('Error deleting multiple todos:', error);
      throw error;
    }
  }
}; 