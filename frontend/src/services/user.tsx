const API_URL = "http://localhost:3001/api/user";

const fetchAPI = async (url: string, options: RequestInit) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi API:", error);
        return { error: true, message: error instanceof Error ? error.message : "Lỗi không xác định" };
    }
};

export const registerUser = async (userData: object) => {
    return fetchAPI(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
};

export const loginUser = async (email: string, password: string) => {
    return fetchAPI(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
};

export const logoutUser = async () => {
    return fetchAPI(`${API_URL}/logout`, { method: "POST" });
};

export const getAllUsers = async (page: number = 1, limit: number = 5) => {
    return fetchAPI(`${API_URL}?page=${page}&limit=${limit}`, {});
};



export const findUserByName = async (username: string) => {
    return fetchAPI(`${API_URL}/search?username=${username}`, {});
};

export const updateUser = async (userId: string, updateData: object, token: string) => {
    return fetchAPI(`${API_URL}/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
    });
};

export const updatePassword = async (userId: string, newPassword: string, token: string) => {
    return fetchAPI(`${API_URL}/update-password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newPassword }),
    });
};

export const deleteUser = async (userId: string, token: string) => {
    return fetchAPI(`${API_URL}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const addAddress = async (userId: string, address: string, token: string) => {
    return fetchAPI(`${API_URL}/add-address`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, address }),
    });
};
export const getUserById = async (userId: string) => {
    return fetchAPI(`${API_URL}/${userId}`, {});
};