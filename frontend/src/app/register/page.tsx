"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "@/app/components/Register.module.css";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  address?: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    try {
      // Chuyển address thành mảng object (nếu có)
      const formattedData = {
        ...data,
        address: data.address ? [{ address: data.address }] : [],
      };

      const res = await fetch("http://localhost:3001/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Đăng kí thất bại!");

      toast.success("Tạo tài khoản thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ĐĂNG KÝ</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Tên đăng nhập" {...register("username", { required: "Tên đăng nhập là bắt buộc" })} className={styles.input} />
        {errors.username && <p className={styles.error}>{errors.username.message}</p>}

        <input type="email" placeholder="Email" {...register("email", { required: "Email là bắt buộc" })} className={styles.input} />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

        <input type="password" placeholder="Mật khẩu" {...register("password", { required: "Mật khẩu là bắt buộc" })} className={styles.input} />
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}

        <input type="text" placeholder="Địa chỉ (Không bắt buộc)" {...register("address")} className={styles.input} />

        <p className={styles.terms}>
          Bằng cách đăng ký, bạn đồng ý với <a href="#" className={styles.link}>Điều khoản dịch vụ</a>.
        </p>
        <button type="submit" className={styles.button}>Đăng ký</button>
      </form>
      <p>
        Bạn đã có tài khoản? <a href="/login" className={styles.link}>Đăng nhập ngay!</a>
      </p>
    </div>
  );
}
