import mongoose from 'mongoose';

export interface ITodo extends mongoose.Document {
  todo: string;
  isDone: boolean;
  user: mongoose.Types.ObjectId;
}

const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,
    trim: true
  },
  isDone: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Todo = mongoose.model<ITodo>('Todo', todoSchema); 