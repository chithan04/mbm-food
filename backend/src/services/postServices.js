const Post = require('../models/Post');

// Lấy tất cả bài viết
exports.getAllPosts = async () => {
    return await Post.find();
};

// Lấy bài viết với giới hạn số lượng
exports.getLimitedPosts = async (limit) => {
    return await Post.find().limit(limit);
};
// Tìm kiếm bài viết theo tên (title) và lấy tất cả các trường
exports.searchPostsByTitle = async (title) => {
    return await Post.find({ title: { $regex: title, $options: 'i' } }); // Lấy tất cả các trường
};

// Lấy bài viết theo id
exports.getPostById = async (id) => {
    return await Post.findById(id);
};

// Lấy bài viết mới nhất (sắp xếp theo ngày tạo)
exports.getNewestPosts = async () => {
    return await Post.find().sort({ create_at: -1 });
};

// Lấy bài viết "kích hoạt" mới nhất
exports.getHotPosts = async () => {
    return await Post.find({ status: 1 }).sort({ create_at: -1 });
};





//api cho client
// Lấy 4 bài viết mới nhất chỉ với 'imageSummary' và 'title'
exports.getNewestFourPostsFooter = async () => {
    return await Post.find()
        .sort({ create_at: -1 })  // Sắp xếp theo ngày tạo
        .limit(4)  // Giới hạn 4 bài viết
        .select('title imageSummary');  // Chỉ lấy các trường title và imageSummary
};

// Lấy 4 bài viết mới nhất title content imageSummary create_at
exports.getNewestFourPosts = async () => {
    return await Post.find()
        .sort({ create_at: -1 })  // Sắp xếp theo ngày tạo
        .limit(4)  // Giới hạn 4 bài viết
        .select('title content imageSummary create_at');  // Chỉ lấy các trường cần thiết
};
// Lấy 4 bài viết hot (chỉ lấy 'title' và 'imageSummary')
exports.getHotPosts4 = async () => {
    return await Post.find({ hot: 1 })  // Lọc bài viết "hot"
        .sort({ create_at: -1 })  // Sắp xếp theo ngày tạo (mới nhất trước)
        .limit(4)  // Giới hạn 4 bài viết
        .select('title imageSummary');  // Chỉ lấy các trường title và imageSummary
};
// Lấy tất cả bài viết chỉ với 'title', 'create_at', 'imageSummary' và 'content'
exports.getAllPostsSummary = async () => {
    return await Post.find()
        .select('title create_at imageSummary content');  // Chỉ lấy các trường title, create_at, imageSummary, và content
};
////....







// Tạo bài viết mới
exports.createPost = async (postData) => {
    const post = new Post({
        title: postData.title,
        content: postData.content,
        summary: postData.summary || '',  // Nếu không có tóm tắt, để trống
        imageSummary: postData.imageSummary,  // URL hình ảnh tóm tắt
        create_at: postData.create_at || Date.now(),
        status: postData.status || 1,  // Mặc định là "kích hoạt"
        author: postData.author,
        view: postData.view || 0,
        hot: postData.hot || 0,
    });

    return await post.save();
};

// Cập nhật bài viết theo id
exports.updatePost = async (id, postData) => {
    return await Post.findByIdAndUpdate(id, {
        title: postData.title,
        content: postData.content,
        summary: postData.summary || '',  // Nếu không có tóm tắt, để trống
        imageSummary: postData.imageSummary,  // Cập nhật URL hình ảnh tóm tắt
        status: postData.status,
        author: postData.author,
        hot: postData.hot,
    }, { new: true });  // Trả về bản ghi đã được cập nhật
};

// Xóa bài viết theo id
exports.deletePost = async (id) => {
    return await Post.findByIdAndDelete(id);
};
