import { Response } from 'express';
import { Todo } from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const todos = await Todo.find({ user: req.user?._id });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos', error });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { todo } = req.body;
    
    if (!todo || typeof todo !== 'string' || todo.trim().length === 0) {
      return res.status(400).json({ message: 'Todo text is required' });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Creating todo:', { todo, userId: req.user._id });

    const newTodo = new Todo({
      todo: todo.trim(),
      user: req.user._id
    });

    const savedTodo = await newTodo.save();
    console.log('Todo created successfully:', savedTodo);

    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ 
      message: 'Error creating todo',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { todo, isDone } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user?._id },
      { todo, isDone },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo', error });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      user: req.user?._id
    });

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo', error });
  }
}; 