import express from 'express';
import { getBlogs, getBlogsAdmin, getBlog, createBlog, updateBlog, deleteBlog } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { blogValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.get('/', getBlogs);
router.get('/admin', protect, adminOnly, getBlogsAdmin);
router.get('/:slug', getBlog);
router.post('/', protect, adminOnly, blogValidation, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);
export default router;
