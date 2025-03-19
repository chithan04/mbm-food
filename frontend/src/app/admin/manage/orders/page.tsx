"use client";

import { useEffect, useState } from "react";
import orderService from "../../services/OrderServices";
import styles from "../../styles/order.module.css";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

interface Order {
  _id: string;
  order_code: string;
  id_user: { _id: string };
  createdAt: Date;
  order_status: "Pending" | "Shipped" | "Delivered" | "Canceled";
  payment_status: "Pending" | "Completed";
  id_payment_method: { _id: string };
  details: { _id: string; id_product: { name: string }; quantity: number; price: number }[];
  total_amount: number;
}

const STATUS_FLOW: Record<Order["order_status"], Order["order_status"][]> = {
  Pending: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Canceled: [],
};

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Order["order_status"]>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, searchDate, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      const updatedOrders = data.map((order: Order) => {
        // Nếu payment_status là "Completed" và id_payment_method khác "67d8351376759d2abe579970"
        if (order.payment_status === "Completed" && order.id_payment_method._id !== "67d8351376759d2abe579970") {
          updateOrderStatus(order._id, "Delivered"); // Gọi API để cập nhật trạng thái
          return { ...order, order_status: "Delivered" };
        }
        return order;
      });

      setOrders(updatedOrders);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString("en-CA"); // Chuyển về YYYY-MM-DD
        console.log("orderDate:", orderDate, "searchDate:", searchDate);
        return orderDate === searchDate;
      });
    }




    if (statusFilter) {
      filtered = filtered.filter((order) => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["order_status"]) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      if (!response) {
        alert("Lỗi khi cập nhật trạng thái đơn hàng!");
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, order_status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleStatusChange = async (orderId: string, currentStatus: Order["order_status"]) => {
    const nextStatus = STATUS_FLOW[currentStatus]?.[0];
    if (!nextStatus) return;

    Swal.fire({
      title: "Xác nhận chuyển trạng thái",
      text: `Bạn có muốn chuyển đơn hàng sang trạng thái "${nextStatus}" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, tiếp tục!",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3085d6",  // Màu xanh dương
      cancelButtonColor: "#d33",  // Màu đỏ giúp dễ nhìn thấy hơn
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(orderId, nextStatus);
        Swal.fire("Thành công!", `Trạng thái đơn hàng đã chuyển sang "${nextStatus}".`, "success");
      }
    });
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <p>Loading...</p>;
  if (!filteredOrders.length) {
    return (
      <div className={`text-center ${styles.emptyState}`}>
        <p>Không có đơn hàng nào!</p>
        <button onClick={() => setSearchDate("")}>
          <FaArrowLeft className="" /> 
        </button>
      </div>
    );
  }


  return (
    <div className={styles.tableContainer}>
      <h4 className="fw-bold fs-3 mb-3">Danh sách đơn hàng</h4>

      {/* Ô tìm kiếm và lọc trạng thái */}
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Tìm kiếm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="form-control me-2"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Order["order_status"])}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Items</th>
            <th>Amount</th>
            <th className="text-center">Status</th>
            <th className="text-center">Payment Status</th>
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
                {order.details.slice(0, 2).map((item) => (
                  <div key={item._id}>
                    {item.id_product.name} - {item.quantity} x {item.price.toLocaleString("vi-VN")} VND
                  </div>
                ))}
              </td>
              <td>{order.total_amount.toLocaleString("vi-VN")} VND</td>
              <td className="text-center">
                <button
                  className={`${styles.statusBtn} ${styles[order.order_status]}`}
                  onClick={() => handleStatusChange(order._id, order.order_status)}
                >
                  {order.order_status}
                </button>
              </td>
              <td className="text-center p-3">
                <span className={`${styles.paymentStatus} ${styles[order.payment_status]}`}>
                  {order.payment_status}
                </span>
                <br />
                <span className={order.id_payment_method._id === "67d8351376759d2abe579970" ? styles.cash : styles.momo}>
                  {order.id_payment_method._id === "67d8351376759d2abe579970" ? "💵 Cash" : "📱 Momo"}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary me-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>
          <span className="align-self-center">
            Trang {currentPage} / {totalPages}
          </span>
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
