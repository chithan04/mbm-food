"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { addAddress, getUserById } from "@/services/user";
import styles from "@/styles/Address.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Address() {
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        zip: "",
        default: false,
    });

    useEffect(() => {
        async function fetchUser() {
            const userId = localStorage.getItem("userId");
            if (userId) {
                try {
                    const response = await getUserById(userId);
                    if (response && !response.error) {
                        setUser(response);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin người dùng:", error);
                }
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=3")
            .then(res => setCities(res.data))
            .catch(err => console.error("Lỗi tải tỉnh/thành:", err));
    }, []);

    const handleCityChange = (e) => {
        const cityCode = e.target.value;
        const selectedCity = cities.find(city => city.code.toString() === cityCode);
        setDistricts(selectedCity?.districts || []);
        setWards([]);
        setFormData(prev => ({ ...prev, city: selectedCity?.name || "", district: "", ward: "", zip: "" }));
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(d => d.code.toString() === districtCode);
        setWards(selectedDistrict?.wards || []);
        setFormData(prev => ({ ...prev, district: selectedDistrict?.name || "", ward: "", zip: "" }));
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const selectedWard = wards.find(w => w.code.toString() === wardCode);
        setFormData(prev => ({ ...prev, ward: selectedWard?.name || "", zip: selectedWard?.code.toString() || "" }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleAddAddress = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!userId || !token) {
            setMessage("Bạn chưa đăng nhập!");
            return;
        }

        try {
            await addAddress(userId, [formData], token);
            setMessage("Thêm địa chỉ thành công!");
            setShowModal(false);
            setFormData({
                name: "", phone: "", company: "", address: "", city: "", district: "", ward: "", zip: "", default: false
            });
        } catch (error) {
            setMessage("Lỗi: " + error.message);
            console.log([formData])
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.addButton} onClick={() => setShowModal(true)}>
                + Thêm địa chỉ
            </button>
            {user && (
                <div>
                    {user && (
                        <div className="container mt-3">
                            <h5 className="fw-bold">Xin chào, {user.username}</h5>

                            {user.address && user.address.length > 0 ? (
                                <div>
                                    <h6 className="mt-3 mb-3">📌 Danh sách địa chỉ của bạn:</h6>
                                    <div className="row">
                                        {user.address.map((addr) => (
                                            <div key={addr._id} className="col-md-6">
                                                <div className="card shadow-sm mb-3">
                                                    <div className="card-body" style={{
                                        backgroundColor: "#e6f4ea",
                                        border: "1px solid #a3d9a5",
                                        borderRadius: "8px",
                                        
                                    }}>
                                                        <h6 className="card-title fw-bold">{addr.name}</h6>
                                                        <p className="card-text">
                                                            📞 <strong>{addr.phone}</strong> <br />
                                                            📍 {addr.address}, {addr.ward}, {addr.district}, {addr.city} <br />
                                                            🏢 Công ty: {addr.company || "Không có"} <br />
                                                            📮 Zip: {addr.zip}
                                                        </p>
                                                        {addr.default && (
                                                            <span className="badge bg-danger">Mặc định</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted mt-3">Bạn chưa có địa chỉ nào.</p>
                            )}
                        </div>
                    )}

                </div>
            )}

















            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5>THÊM ĐỊA CHỈ MỚI</h5>
                            <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <input type="text" name="name" placeholder="Họ tên" className="form-control" onChange={handleChange} />
                            <input type="text" name="phone" placeholder="Số điện thoại" className="form-control" onChange={handleChange} />
                            <input type="text" name="company" placeholder="Công ty (tùy chọn)" className="form-control" onChange={handleChange} />
                            <input type="text" name="address" placeholder="Địa chỉ" className="form-control" onChange={handleChange} />
                            <div className={styles.selectGroup}>
                                <select name="city" className="form-control" onChange={handleCityChange} value={formData.city}>
                                    <option value="">Chọn tỉnh/thành</option>
                                    {cities.map(city => <option key={city.code} value={city.code}>{city.name}</option>)}
                                </select>
                                <select name="district" className="form-control" onChange={handleDistrictChange} value={formData.district} disabled={!formData.city}>
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map(district => <option key={district.code} value={district.code}>{district.name}</option>)}
                                </select>
                                <select name="ward" className="form-control" onChange={handleWardChange} value={formData.ward} disabled={!formData.district}>
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
                                </select>
                            </div>
                            <input type="text" name="zip" placeholder="Mã Zip" className="form-control" value={formData.zip} readOnly />
                            <div className={styles.checkboxContainer}>
                                <input type="checkbox" name="default" onChange={handleChange} />
                                <label>Đặt là địa chỉ mặc định?</label>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>Hủy</button>
                            <button className={styles.confirmButton} onClick={handleAddAddress}>Thêm địa chỉ</button>
                        </div>
                    </div>
                </div>
            )}
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
