const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Tiêu đề bài viết
    content: { type: String, required: true },  // Nội dung bài viết (bao gồm cả HTML và hình ảnh)
    summary: { type: String, required: false },  // Tóm tắt bài viết (Chứa title và hình ảnh đầu tiên)
    imageSummary: { type: String, required: false },  // Hình ảnh đầu tiên trong bài viết (URL)
    create_at: { type: Date, default: Date.now },  // Ngày tạo bài viết
    status: { 
        type: Number, 
        default: 1,  // Mặc định là "kích hoạt"
        enum: [1, 2]  // Chỉ nhận giá trị 1 (kích hoạt) hoặc 2 (không kích hoạt)
    },
    author: { type: String, required: true },  // Tác giả bài viết
    view: { type: Number, default: 0 },  // Số lượt xem bài viết
    hot: { type: Number, default: 0, enum: [0, 1] },  // Trạng thái bài viết hot
}, { collation: { locale: 'vi', strength: 2 } });

module.exports = mongoose.model('Post', postSchema);
