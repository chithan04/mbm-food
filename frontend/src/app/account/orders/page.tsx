"use client";
import { useEffect, useState } from "react";
import orderService from "../../admin/services/OrderServices";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

export default function AddressTable() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setLoading(false);
            return;
        }
        fetchOrders(userId);
    }, []);

    const fetchOrders = async (userId: string) => {
        try {
            const data = await orderService.getOrdersByUserId(userId);
            const ordersWithDetails = data.orders.map((order: any) => ({
                ...order,
                details: data.orderDetails.filter((detail: any) => detail.id_order === order._id) || [],
            }));
            setOrders(ordersWithDetails);
        } catch (err) {
            console.error("Lỗi khi lấy đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        const result = await Swal.fire({
            title: "Bạn có chắc chắn muốn hủy đơn hàng này?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, hủy đơn!",
            cancelButtonText: "Không",
        });

        if (!result.isConfirmed) return;

        try {
            await orderService.updateOrderStatus(orderId, { order_status: "Canceled" });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, order_status: "Canceled" } : order
                )
            );
            Swal.fire("Đã hủy!", "Đơn hàng của bạn đã được hủy.", "success");
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            Swal.fire("Lỗi!", "Có lỗi xảy ra, vui lòng thử lại.", "error");
        }
    };

    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const orderA = a[key];
        const orderB = b[key];

        if (orderA < orderB) return direction === "asc" ? -1 : 1;
        if (orderA > orderB) return direction === "asc" ? 1 : -1;
        return 0;
    });

    const requestSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    if (loading) return <p>Loading...</p>;
    if (!orders.length) return <p>Không tìm thấy đơn hàng nào!</p>;

    return (
        <div className="container mt-4">
            <h5 className="mb-3">📦 ĐƠN HÀNG CỦA BẠN</h5>
            <table className="table table-striped table-bordered text-center ">
                <thead className="table-dark">
                    <tr>
                        <th onClick={() => requestSort("order_code")} style={{ cursor: "pointer" }}>Mã đơn hàng 🔽</th>
                        <th>Ngày đặt hàng</th>
                        <th>Khách hàng</th>
                        <th onClick={() => requestSort("order_status")} style={{ cursor: "pointer" }}>Trạng thái 🔽</th>
                        <th onClick={() => requestSort("total_amount")} style={{ cursor: "pointer" }}>Tổng tiền 🔽</th>
                        <th>Chi tiết đơn hàng</th>
                        <th>Hủy đơn(only Pedding)</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map((order) => (
                        <tr key={order._id}>
                            <td>{order.order_code || "N/A"}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                            <td>
                                {order.name} <br />
                                📧 {order.id_user?.email} <br />
                                📞 {order.phone}
                            </td>
                            <td>
                                <span className={`badge ${order.order_status === "Pending" ? "bg-warning" : order.order_status === "Shipped" ? "bg-primary" : order.order_status === "Delivered" ? "bg-success" : "bg-danger"}`}>
                                    {order.order_status}
                                </span>
                            </td>
                            <td>{order.total_amount?.toLocaleString("vi-VN")} VND</td>
                            <td>
                                {order.details.slice(0, 2).map((item: any, index: any) => (
                                    <div key={index} className="text-start">
                                        <strong>{item.id_product?.name || "Sản phẩm không xác định"}</strong>
                                        <br />
                                        Số lượng: {item.quantity} - Giá: {item.price?.toLocaleString("vi-VN")} VND
                                    </div>
                                ))}
                                {order.details.length > 2 && <button className="btn btn-sm btn-info mt-2">Xem thêm</button>}
                            </td>
                            <td>
                                {order.order_status === "Pending" && (
                                    <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order._id)}>
                                        Hủy đơn
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
