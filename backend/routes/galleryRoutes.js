import express from 'express';
import { getGallery, uploadGalleryImage, deleteGalleryImage } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getGallery);

// POST with error handling
router.post('/', protect, adminOnly, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, uploadGalleryImage);

router.delete('/:id', protect, adminOnly, deleteGalleryImage);

export default router;
