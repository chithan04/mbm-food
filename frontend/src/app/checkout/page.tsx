"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/CheckoutPage.module.css";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface User {
  _id: string;
  email: string;
  address: Address[];
}

const CheckoutPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const API_URL = process.env.NEXT_PUBLIC_URL_IMAGE;
  const [cart, setCart] = useState<
    {
      id_product: string;
      name: string;
      size: string;
      price: number;
      quantity: number;
      image: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(
          `http://localhost:3001/api/user/${userId}`
        );
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCart = () => {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const parsedCart = JSON.parse(cartData).map((item: any) => ({
          id_product: item._id || item.id_product || "",
          name: item.name || "Sản phẩm không có tên",
          size: item.size || "Mặc định",
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || "",
        }));
        setCart(parsedCart);
      }
    };
    fetchCart();
  }, []);

  const handleOrder = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    const orderData = {
      userId: user._id,
      email: user.email,
      address: user.address[0]?.address || "",
      phone: user.address[0]?.phone || "",
      paymentMethod,
      products: cart.map((item) => ({
        id_product: item.id_product || "", 
        name: item.name || "Sản phẩm chưa có tên", 
        quantity: item.quantity,
        price: item.price,
      })),
      order_code: `ORD${Date.now()}`,
      total_amount: cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      note: "Không có ghi chú",
      name: user.address[0]?.name || "",
      receive_address: user.address[0]?.address || "",
    };

    console.log("🛒 Dữ liệu gửi lên API:", JSON.stringify(orderData, null, 2)); 
    console.log("📧 Email người dùng:", user?.email);
    console.log("🏠 Địa chỉ nhận hàng:", user?.address[0]?.address);
    console.log("📦 Dữ liệu orderData trước khi gửi:", orderData);


    if (
      !orderData.userId ||
      !orderData.address ||
      !orderData.phone ||
      orderData.products.length === 0
    ) {
      console.error("⚠️ Thiếu thông tin trước khi gửi API:", orderData);
      toast.error("Vui lòng kiểm tra lại thông tin đặt hàng!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();
      console.log("📩 Phản hồi từ API:", responseData);
      console.log("📦 Dữ liệu đơn hàng gửi đi:", orderData);

      if (!response.ok) {
        throw new Error(responseData.error || "Đặt hàng thất bại!");
      }

      toast.success("Đặt hàng thành công!");
      localStorage.removeItem("cart");
      setCart([]);
    } catch (error) {
      console.error("⚠️ Lỗi khi đặt hàng:", error);
      toast.error(`Lỗi đặt hàng: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkoutForm}>
        <h2>Thông tin nhận hàng</h2>
        <form>
          <label htmlFor="address" className={styles.formLabel}>
            Số địa chỉ
          </label>
          <input
            type="text"
            id="address"
            className={styles.formInput}
            defaultValue={user?.address[0]?.address || ""}
          />

          <label htmlFor="email" className={styles.formLabel}>
            Email
          </label>
          <input
            type="email"
            id="email"
            className={styles.formInput}
            defaultValue={user?.email || ""}
          />

          <label htmlFor="name" className={styles.formLabel}>
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            className={styles.formInput}
            defaultValue={user?.address[0]?.name || ""}
          />

          <label htmlFor="phone" className={styles.formLabel}>
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            className={styles.formInput}
            defaultValue={user?.address[0]?.phone || ""}
          />

          <label htmlFor="city" className={styles.formLabel}>
            Tỉnh thành
          </label>
          <select id="city" className={styles.formSelect}>
            <option>{user?.address[0]?.city || ""}</option>
          </select>

          <label htmlFor="district" className={styles.formLabel}>
            Quận huyện
          </label>
          <select id="district" className={styles.formSelect}>
            <option>{user?.address[0]?.district || ""}</option>
          </select>

          <label htmlFor="ward" className={styles.formLabel}>
            Phường xã
          </label>
          <select id="ward" className={styles.formSelect}>
            <option>{user?.address[0]?.ward || ""}</option>
          </select>

          <div className={styles.paymentOptions}>
            <p className={styles.paymentTitle}>Phương thức thanh toán:</p>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              Thanh toán khi nhận hàng (Tiền mặt)
            </label>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={() => setPaymentMethod("momo")}
              />
              Thanh toán qua Momo
            </label>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={() => setPaymentMethod("vnpay")}
              />
              Thanh toán qua VNPay
            </label>
          </div>
        </form>
      </div>

      <div className={styles.orderSummary}>
        <h2>Đơn hàng ({cart.length} sản phẩm)</h2>

        {cart.map((item, index) => (
          <div key={index} className={styles.orderItem}>
            <Image
              className={styles.img}
              src={`${API_URL}/images/${item.image}`}
              alt={item.name}
              width={50}
              height={50}
            />
            <div>
              <p>{item.name}</p>
              <p>{item.size}</p>
              <p className={styles.price}>{item.price.toLocaleString()}đ</p>
              <p>Số lượng: {item.quantity}</p>
            </div>
          </div>
        ))}

        <input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          className={styles.formInput}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button className={styles.applyBtn}>Áp dụng</button>

        <p>
          Tạm tính:{" "}
          {cart
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toLocaleString()}
          đ
        </p>
        <p>
          <strong>
            Tổng cộng:{" "}
            {cart
              .reduce((total, item) => total + item.price * item.quantity, 0)
              .toLocaleString()}
            đ
          </strong>
        </p>

        <button className={styles.orderBtn} onClick={handleOrder}>
          ĐẶT HÀNG
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
