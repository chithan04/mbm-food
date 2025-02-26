"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { addFavorite, getFavorites, removeFavorite } from "../../services/Favorite";
import styles from "../../styles/Favorite.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Heart } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  idcate: string;
  variants: { option: string; price: number; sale_price: number; image: string }[];
  hot: number;
  view: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  description: string;
}

const FavoritePage = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        alert("Chưa có token, vui lòng đăng nhập");
        return;
      }

      try {
        const data = await getFavorites(token);
        console.log("Dữ liệu API trả về:", data);

        if (Array.isArray(data)) {
          const formattedFavorites = data.map((fav) => fav.id_product).filter(Boolean);
          setFavorites(formattedFavorites);
        } else {
          console.error("Dữ liệu API không hợp lệ:", data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      }
    };

    fetchFavorites();
  }, [token]);

  const toggleFavorite = async (productId: string) => {
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    const isFavorite = favorites.some((fav) => fav._id === productId);
    const result = isFavorite
      ? await removeFavorite(productId, token)
      : await addFavorite(productId, token);

    if (!result.error) {
      setFavorites((prev) =>
        isFavorite
          ? prev.filter((p) => p._id !== productId)
          : [...prev, result.newFavorite]
      );
      alert(isFavorite ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
    }
  };

  return (
    <div className={`container mt-4 ${styles.favoriteContainer}`}>
      <h2 className="mb-4">Danh sách yêu thích</h2>

      {favorites.length === 0 ? (
        <p className="text-center">Chưa có sản phẩm yêu thích.</p>
      ) : (
        <div className="row">
          {favorites.map((product) => (
            <div key={product._id} className="col-md-3 col-sm-6 mb-4">
              <div className={`card border-1 shadow-sm ${styles.productCard}`}>
                {/* Icon trái tim */}
                <button><i
                  className={`${styles.favoriteIcon} position-absolute top-0 end-0 p-2`}
                  onClick={() => toggleFavorite(product._id)}
                >
                  <Heart size={20} color="#E51735" fill="#E51735" />

                </i></button>

                {/* Hình ảnh sản phẩm */}
                {product.variants[0]?.image && (
                  <div className={`${styles.productImageWrapper}`}>
                    <Image
                      src={product.variants[0].image.startsWith("http") ? product.variants[0].image : `/images/${product.variants[0].image}`}
                      alt={product.name}
                      width={300}
                      height={300}
                      className={`${styles.productImage}`}
                      priority
                    />
                  </div>
                )}

                <div className="card-body flex-grow-1 d-flex flex-column">
                  {/* Tên sản phẩm */}
                  <h5 className={`${styles.productTitle} mb-1`}>{product.name}</h5>

                  {/* Mô tả sản phẩm */}
                  <p className={`${styles.productDescription}`}>
                    {product.description} <span className={styles.readMore}>...Xem thêm</span>
                  </p>

                </div>

                {/* Phần chứa giá và nút Thêm (flex row) */}
                <div className={`card-footer bg-white border-0 d-flex justify-content-between align-items-center ${styles.productFooter}`}>
                  <div>
                    <p className="text-muted mb-1">Giá chỉ từ</p>
                    <p className="text-danger fw-bold">
                      {product.variants[0]?.price?.toLocaleString()}₫
                    </p>
                  </div>
                  <button className="btn btn-success btn-sm">Thêm</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
