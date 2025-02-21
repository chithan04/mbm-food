"use client";

import React, { useEffect, useState } from "react";
import newsService from "../../services/NewsService";
import styles from "../../styles/newsList.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import AddNews from "../../components/addPostNews";
import EditNews from "../../components/editPostNews";

export default function NewsTable() {
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        const data = await newsService.getAllNews();
        setNews(data);
    };

    const handleDelete = async (id: string) => {
        await newsService.deleteNews(id);
        loadNews();
    };

    const handleSearch = async () => {
        if (search.trim() === "") {
            loadNews();
        } else {
            try {
                const data = await newsService.searchNewsByTitle(search);
                setNews(data);
            } catch (error) {
                console.error("Lỗi tìm kiếm bài viết:", error);
                alert("Không thể tìm kiếm bài viết!");
            }
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
    };

    const handleEdit = (id: string) => {
        setEditId(id);
        setIsEditing(true);
    };

    return (
        <div className={styles.tableContainer}>
            <h4>News Management</h4>
            <div className={styles.titleTable}>
                <p>Admin/</p>
                <p className={styles.titles}>News List</p>
            </div>
            <div className={styles.headerActions}>
                <button className={styles.addButton} onClick={handleAdd}>
                    <FontAwesomeIcon icon={faPlus} /> Thêm bài viết
                </button>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tiêu đề..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Ngày đăng</th>
                        <th>Hình ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {news.map((post, index) => (
                        <tr key={post._id}>
                            <td>{index + 1}</td>
                            <td>{post.title}</td>
                            <td>{post.author}</td>
                            <td>{new Date(post.create_at).toLocaleDateString()}</td>
                            <td>
                                <div className={styles.imageSummary} dangerouslySetInnerHTML={{ __html: post.imageSummary }} />
                            </td>
                            <td>
                                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(post._id)}>
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Thêm Bài Viết */}
            {isAdding && (
                <div className={styles.overlays}>
                    <div className={styles.modals}>
                        <button className={styles.closeButton} onClick={() => setIsAdding(false)}>✖</button>
                        <AddNews onClose={() => setIsAdding(false)} onSuccess={loadNews} />
                    </div>
                </div>
            )}

            {/* Modal Chỉnh Sửa Bài Viết */}
            {isEditing && (
                <div className={styles.overlays}>
                    <div className={styles.modals}>
                        <button className={styles.closeButton} onClick={() => setIsEditing(false)}>✖</button>
                        <EditNews id={editId} onClose={() => setIsEditing(false)} onSuccess={loadNews} />
                    </div>
                </div>
            )}
        </div>
    );
}
