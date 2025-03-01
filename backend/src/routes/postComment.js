const express = require('express');
const router = express.Router();
const PostCommentController = require('../controllers/postCommentController');
const authMiddleware = require('../middleware/cmtAuthen'); // Middleware lấy userId từ localStorage hoặc token

// Tạo bình luận
router.post('/', authMiddleware, PostCommentController.createComment);

// Lấy tất cả bình luận
router.get('/', PostCommentController.getAllComments);

// Lấy bình luận theo userId
router.get('/user/:userId', PostCommentController.getCommentsByUser);

// Xóa bình luận (chỉ cho phép xóa nếu là chủ sở hữu)
router.delete('/:commentId', authMiddleware, PostCommentController.deleteComment);

module.exports = router;
