import express from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router; 