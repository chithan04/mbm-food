"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router'; // Thêm useRouter để điều hướng
import userService from "../services/UserService";
import styles from "../styles/Table.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Table() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({ username: "", email: "", address: "", role: "" });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await userService.getAllUsers();
        setUsers(data);
    };

    const handleDelete = async (id) => {
        await userService.deleteUser(id);
        loadUsers();
    };

    const handleSearch = async () => {
        if (search.trim() === "") {
            loadUsers();
        } else {
            const user = await userService.findUserByName(search);
            setUsers(user ? [user] : []);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user._id);
        setEditData({ username: user.username, email: user.email, address: user.address, role: user.role });
    };

    const handleUpdate = async () => {
        await userService.updateUser(editingUser, editData);
        setEditingUser(null);
        loadUsers();
    };

    return (
        <div className={styles.tableContainer}>
            <h4>Users Management</h4>
            <div className={styles.titleTable}>
                <p>Admin/</p>
                <p className={styles.titles}>User List</p>
            </div>

            <div className={styles.headerActions}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th></th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Role</th>
                        <th>Join On</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                            </td>

                            <td>
                                <div className={styles.avatarContainer}>
                                    <img className={styles.avatar} src={user.avatar || "https://via.placeholder.com/40"} alt="Avatar" />
                                    <Link href={`custumerList/${user._id}`}>
                                        <span className={styles.name}>{user.username}</span>
                                    </Link>
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.address}</td>
                            <td><span className={styles.role}>{user.role}</span></td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(user)}>
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Form chỉnh sửa - Ẩn hiện với nền mờ */}
            {editingUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h4>Edit User</h4>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        />
                        <label>Email:</label>
                        <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                        <label>Address:</label>
                        <input
                            type="text"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        />
                        <label>Role:</label>
                        <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className={styles.modalButtons}>
                            <button onClick={handleUpdate}>Update</button>
                            <button onClick={() => setEditingUser(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
