"use client";
import { notFound } from "next/navigation";
import ProductListCate from "@/components/common/ProductListCate";
import style from "@/styles/Categories.module.css";
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";

interface CategoryPageProps {
  params: {
    categories: string;
  };
}

const categoryMap: Record<string, string> = {
  pizza: "67b0a4fbb5a39baf9de368ff",
  "khai-vi": "67b0a54db5a39baf9de36902",
  "my-y": "67b0a582b5a39baf9de36904",
  salad: "67b0a5d2b5a39baf9de36907",
  "thuc-uong": "67b0a75ab5a39baf9de3690a",
};
const categoryNameMap: Record<string, string> = {
  pizza: "Pizza",
  "khai-vi": "Khai vị",
  "my-y": "Mỳ Ý",
  salad: "Salad",
  "thuc-uong": "Thức uống",
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryId = categoryMap[params.categories];
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("default");
  const [activeSortOption, setActiveSortOption] = useState<string>("default");
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setIsSubMenuOpen((prev) => !prev);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
    setActiveSortOption(option);
  };


  // Hàm lấy danh sách kích thước sản phẩm theo danh mục
  const fetchSizes = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/products/categories/${categoryId}`
      );
      const result = await response.json();
      const products: Product[] = Array.isArray(result.data) ? result.data : [];

      // Lọc danh sách kích thước duy nhất
      const extractedSizes = products
        .flatMap((product) => product.variants?.map((v) => v.option) || [])
        .filter((size, index, self) => self.indexOf(size) === index && size);

      setSizes(extractedSizes);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu kích thước:", error);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  if (!categoryId) return notFound();

  return (
    <div className={style.container}>
      <div className={style.title_page}>
        {categoryNameMap[params.categories] || "Danh mục"}
      </div>
      <div className={style.row}>
        <aside className={style.dqdt_sidebar}>
          <div className={style.aside_content_menu}>
            <div className={style.title_head_col}>Danh mục sản phẩm</div>
            <nav className={style.nav_category}>
              <ul className={style.navbar_pills}>
                <li className={style.nav_item}>
                  <a href="/" className={style.navlink}>Trang chủ</a>
                </li>
                <li className={style.nav_item}>
                  <a href="/about" className={style.navlink}>Giới thiệu</a>
                </li>
                <li className={style.nav_item}>
                <a href="/product" className={style.navlink}>Sản phẩm</a>
                  <i className={style.down_icon} onClick={toggleSubMenu}></i>
                  <ul className={`${style.menu_down} ${isSubMenuOpen ? style.open : ""}`}>
                    <li className={style.nav_item}><a href="/pizza" className={style.navlink}>Pizza</a></li>
                    <li className={style.nav_item}><a href="/khai-vi" className={style.navlink}>Khai vị</a></li>
                    <li className={style.nav_item}><a href="/my-y" className={style.navlink}>Mỳ ý</a></li>
                    <li className={style.nav_item}><a href="/salad" className={style.navlink}>Salad</a></li>
                    <li className={style.nav_item}><a href="/thuc-uong" className={style.navlink}>Thức uống</a></li>
                  </ul>
                </li>
                <li className={style.nav_item}>
                  <a href="/news" className={style.navlink}>Tin tức</a>
                </li>
                <li className={style.nav_item}>
                  <a href="/contact" className={style.navlink}>Liên hệ</a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Bộ lọc sản phẩm */}
          <div className={style.filter_content}>
            <div className={style.title_head_col}>Bộ lọc sản phẩm</div>
            <div className={style.filter_container}>

              {/* Bộ lọc giá */}
              <aside className={style.filter_price}>
                <div className={style.title_head}>Chọn mức giá</div>
                <div className={style.filter_group}>
                  <ul>
                    {[
                      { min: 0, max: 100000, label: "Dưới 100.000đ" },
                      { min: 100000, max: 200000, label: "100.000đ - 200.000đ" },
                      { min: 200000, max: 300000, label: "200.000đ - 300.000đ" },
                      { min: 300000, max: 500000, label: "300.000đ - 500.000đ" },
                      { min: 500000, max: 1000000, label: "500.000đ - 1.000.000đ" },
                      { min: 1000000, max: null, label: "Trên 1.000.000đ" },
                    ].map(({ min, max, label }) => (
                      <li key={label} className={style.filter_item}>
                        <label>
                          <input
                            type="checkbox"
                            name="price"
                            checked={minPrice === min && maxPrice === max}
                            className={style.input}
                            onChange={() => {
                              setMinPrice(min);
                              setMaxPrice(max);
                            }}
                          />
                          {label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Bộ lọc kích thước */}
              <aside className={style.filter_tag}>
                <div className={style.title_head}>Kích thước</div>
                <div className={style.filter_group}>
                  {sizes.length > 0 ? (
                    <ul>
                      {sizes.map((size) => (
                        <li key={size} className={style.filter_item}>
                          <label>
                            <input
                              type="checkbox"
                              name="size"
                              checked={selectedSize === size}
                              onChange={() => setSelectedSize(size)}
                              className={style.input}
                            />
                            {size}
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Không có kích thước nào.</p>
                  )}
                </div>
              </aside>

            </div>
          </div>
        </aside>

        {/* Menu sắp xếp dạng danh sách */}
        <div className={style.block_collection}>
          <div className={style.category_products}>
          <div className={style.sort_cate}>
            <h3>Xếp theo:</h3>
            <ul>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "default" ? style.active : ""} onClick={() => handleSort("default")}>Mặc định</button>
              </li>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "name-asc" ? style.active : ""} onClick={() => handleSort("name-asc")}>Tên A-Z</button>
              </li>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "name-desc" ? style.active : ""} onClick={() => handleSort("name-desc")}>Tên Z-A</button>
              </li>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "newest" ? style.active : ""} onClick={() => handleSort("newest")}>Hàng mới</button>
              </li>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "price-asc" ? style.active : ""} onClick={() => handleSort("price-asc")}>Giá thấp đến cao</button>
              </li>
              <li className={style.btn_quick_sort}>
                <button className={activeSortOption === "price-desc" ? style.active : ""} onClick={() => handleSort("price-desc")}>Giá cao đến thấp</button>
              </li>
            </ul>
          </div>

            <section className={style.product_view}>
              <ProductListCate
                idcate={categoryId}
                showAll={true}
                minPrice={minPrice ?? undefined}
                maxPrice={maxPrice ?? undefined}
                selectedSize={selectedSize}
                sortOption={sortOption as "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest"}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
