const authService = require('../services/userServices');

// Đăng ký tài khoản
const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Đăng nhập trả về token và userId
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password); // 🟢 Lấy `user` thay vì `userId`
        res.status(200).json({ token, userId: user._id, role: user.role }); // ✅ Trả về cả `role`
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Đăng xuất (Client cần xóa token)
const logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Đăng xuất thành công, vui lòng xóa token trên client' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng xuất', error: error.message });
    }
};

// Cập nhật mật khẩu
const updatePassword = async (req, res) => {
    try {
        const { userId } = req.user; // Lấy userId từ token
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
        }

        const result = await authService.updatePassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addAddress = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập" });
        }
        const userId = req.user.userId;

        if (!Array.isArray(req.body.address) || req.body.address.length === 0) {
            return res.status(400).json({ message: "Danh sách địa chỉ không hợp lệ" });
        }

        const user = await authService.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // ✅ Fix lỗi: Nếu address không phải array, khởi tạo thành []
        if (!Array.isArray(user.address)) {
            user.address = [];
        }

        const newAddress = req.body.address.map(addr => ({
            name: addr.name,
            phone: addr.phone,
            company: addr.company || "",
            address: addr.address,
            city: addr.city,
            district: addr.district,
            ward: addr.ward,
            zip: addr.zip,
            default: addr.default || false
        }));

        if (newAddress.some(addr => addr.default)) {
            user.address.forEach(addr => (addr.default = false));
        }

        user.address.push(...newAddress);
        await user.save();

        res.status(200).json({ message: "Thêm địa chỉ thành công", address: user.address });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        const updatedAddress = req.body;

        const addresses = await authService.updateAddress(userId, addressId, updatedAddress);

        res.status(200).json({ message: "Cập nhật địa chỉ thành công", address: addresses });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: error.message });
    }
};







// Lấy tất cả người dùng (hỗ trợ phân trang)
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const result = await authService.getAllUsers(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
    }
};

// Xóa người dùng theo ID
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await authService.deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật người dùng theo ID
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await authService.updateUser(id, updateData);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Tìm người dùng theo tên
const findUserByName = async (req, res) => {
    try {
        const { username } = req.query;
        const user = await authService.findUserByName(username);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const findUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await authService.findUserById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { 
    getAllUsers, 
    deleteUser, 
    updateUser, 
    findUserByName, 
    findUserById, 
    register, 
    login, 
    logout, 
    updatePassword, 
    addAddress,
    updateAddress 
};

