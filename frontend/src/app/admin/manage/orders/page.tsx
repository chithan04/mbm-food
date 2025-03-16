"use client";

import { useEffect, useState } from "react";
import orderService from "../../services/OrderServices";
import styles from "../../styles/order.module.css";

interface Order {
  _id: string;
  order_code: string;
  id_user: { _id: string };
  createdAt: string;
  status: "pending" | "shipped" | "delivered" | "canceled";
  details: { _id: string; id_product: { name: string }; quantity: number; price: number }[];
  total_amount: number;
}

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

const STATUS_COLORS: Record<string, string> = {
  pending: "btn-primary",
  shipped: "btn-warning",
  delivered: "btn-success",
  canceled: "btn-danger",
};

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số đơn hàng mỗi trang

  // Lọc theo ngày
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // ✅ Lọc đơn hàng theo khoảng thời gian
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
    return (
      (!startDate || orderDate >= startDate) &&
      (!endDate || orderDate <= endDate)
    );
  });

  // ✅ Cắt danh sách theo phân trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p>Loading...</p>;
  if (!orders.length) return <p>Không có đơn hàng nào!</p>;

  return (
    <div className={styles.tableContainer}>
      <h4 className="fw-bold fs-3 mb-3">Danh sách đơn hàng</h4>

      {/* Bộ lọc ngày tháng */}
      <div className="d-flex gap-3 mb-3">
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setCurrentPage(1)}>Lọc</button>
      </div>

      {/* Bảng đơn hàng */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order._id} className={styles.row}>
              <td>
                <a href={`http://localhost:3002/admin/manage/customerList/${order.id_user._id}`}>
                  #{order.order_code}
                </a>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <div className={`${styles.statusText} ${styles[`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </td>
              <td>
                {order.details.slice(0, 2).map((item) => (
                  <div key={item._id}>
                    {item.id_product.name} - {item.quantity} x {item.price.toLocaleString("vi-VN")} VND
                  </div>
                ))}
                {order.details.length > 2 && !expandedOrders[order._id] && (
                  <button className={styles.expandBtn} onClick={() => toggleExpand(order._id)}>
                    ...
                  </button>
                )}
                {expandedOrders[order._id] && (
                  <>
                    {order.details.slice(2).map((item) => (
                      <div key={item._id}>
                        {item.id_product.name} - {item.quantity} x {item.price.toLocaleString("vi-VN")} VND
                      </div>
                    ))}
                    <button className={styles.collapseBtn} onClick={() => toggleExpand(order._id)}>
                      Thu gọn
                    </button>
                  </>
                )}
              </td>
              <td>{order.total_amount.toLocaleString("vi-VN")} VND</td>
              <td>
                {["pending", "shipped", "delivered", "canceled"].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm me-2 ${STATUS_COLORS[status]} ${styles.statusBtn}`}
                    onClick={() => handleStatusChange(order._id, status)}
                    disabled={!STATUS_FLOW[order.status].includes(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang client-side */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary me-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>
          <span className="align-self-center">Trang {currentPage} / {totalPages}</span>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
