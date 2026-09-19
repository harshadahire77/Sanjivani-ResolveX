import axios from "axios";

// ==========================================================
// API CONFIGURATION
// ==========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// ==========================================================
// STORAGE KEYS
// ==========================================================

const TOKEN_KEY = "resolvex_token";
const USER_KEY = "resolvex_user";

// ==========================================================
// AUTH STORAGE HELPERS
// ==========================================================

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  try {
    const value = localStorage.getItem(USER_KEY);

    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
};

export const removeStoredUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const clearAuthData = () => {
  removeToken();
  removeStoredUser();
};

// ==========================================================
// AXIOS REQUEST INTERCEPTOR
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================================
// AXIOS RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
    }

    return Promise.reject(error);
  }
);

// ==========================================================
// HEALTH
// ==========================================================

export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const getHealth = checkHealth;
export const checkBackendHealth = checkHealth;

// ==========================================================
// AUTHENTICATION
// ==========================================================

export const signupUser = async (userData) => {
  const response = await api.post(
    "/auth/signup",
    userData
  );

  return response.data;
};

export const registerUser = signupUser;
export const signup = signupUser;
export const register = signupUser;

// ==========================================================
// LOGIN
// ==========================================================

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  const data = response.data;

  const token =
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.jwt ||
    data?.data?.token;

  const user =
    data?.user ||
    data?.data?.user ||
    null;

  if (token) {
    setToken(token);
  }

  if (user) {
    setStoredUser(user);
  }

  return data;
};

export const login = loginUser;

// ==========================================================
// CURRENT USER
// ==========================================================

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  const data = response.data;

  const user =
    data?.user ||
    data?.data?.user ||
    data;

  if (user) {
    setStoredUser(user);
  }

  return data;
};

export const getMe = getCurrentUser;
export const getProfile = getCurrentUser;

// ==========================================================
// LOGOUT
// ==========================================================

export const logoutUser = () => {
  clearAuthData();
};

export const logout = logoutUser;

// ==========================================================
// USER PROFILE
// ==========================================================

export const getUserById = async (userId) => {
  const response = await api.get(
    `/users/${userId}`
  );

  return response.data;
};

export const getUserProfile = getUserById;

export const updateUserProfile = async (
  userId,
  userData
) => {
  const response = await api.put(
    `/users/${userId}`,
    userData
  );

  const data = response.data;

  const updatedUser =
    data?.user ||
    data?.data?.user ||
    data;

  if (updatedUser) {
    setStoredUser(updatedUser);
  }

  return data;
};

export const updateProfile =
  updateUserProfile;

export const updateUser =
  updateUserProfile;

// ==========================================================
// CREATE COMPLAINT
// ==========================================================

export const createComplaint = async (
  complaintData
) => {
  const response = await api.post(
    "/complaints",
    complaintData
  );

  return response.data;
};

// ==========================================================
// ALL COMPLAINTS
// ==========================================================

export const getAllComplaints = async () => {
  const response = await api.get(
    "/complaints"
  );

  return response.data;
};

export const getComplaints =
  getAllComplaints;

// ==========================================================
// COMPLAINT BY ID
// ==========================================================

export const getComplaintById = async (
  complaintId
) => {
  const response = await api.get(
    `/complaints/${complaintId}`
  );

  return response.data;
};

export const getComplaint =
  getComplaintById;

// ==========================================================
// CURRENT USER COMPLAINTS
// ==========================================================

export const getMyComplaints = async () => {
  const response = await api.get(
    "/complaints/my"
  );

  return response.data;
};

// ==========================================================
// COMPLAINTS BY USER ID
// ==========================================================

export const getComplaintsByUserId =
  async (userId) => {
    const response = await api.get(
      `/complaints/user/${userId}`
    );

    return response.data;
  };

// Used by Dashboard.jsx
export const getUserComplaints =
  async (userId = null) => {
    if (
      userId !== null &&
      userId !== undefined &&
      userId !== ""
    ) {
      return getComplaintsByUserId(userId);
    }

    return getMyComplaints();
  };

// ==========================================================
// UPDATE COMPLAINT
// ==========================================================

export const updateComplaint = async (
  complaintId,
  complaintData
) => {
  const response = await api.put(
    `/complaints/${complaintId}`,
    complaintData
  );

  return response.data;
};

// ==========================================================
// DELETE COMPLAINT
// ==========================================================

export const deleteComplaint = async (
  complaintId
) => {
  const response = await api.delete(
    `/complaints/${complaintId}`
  );

  return response.data;
};

// ==========================================================
// ASSIGN COMPLAINT
// ==========================================================

export const assignComplaint = async (
  complaintId,
  assignedUserId
) => {
  const response = await api.put(
    `/complaints/${complaintId}/assign`,
    {
      assignedUserId,
    }
  );

  return response.data;
};

export const unassignComplaint = async (
  complaintId
) => {
  const response = await api.put(
    `/complaints/${complaintId}/assign`,
    {
      assignedUserId: null,
    }
  );

  return response.data;
};

// ==========================================================
// ASSIGNED COMPLAINTS
// ==========================================================

export const getAssignedComplaints =
  async () => {
    const response = await api.get(
      "/complaints/assigned/me"
    );

    return response.data;
  };

export const getMyAssignedComplaints =
  getAssignedComplaints;

export const getStaffAssignedComplaints =
  getAssignedComplaints;

export const getAssignedToMe =
  getAssignedComplaints;

// ==========================================================
// UPDATE COMPLAINT STATUS
// ==========================================================

export const updateComplaintStatus =
  async (
    complaintId,
    status
  ) => {
    const response = await api.put(
      `/complaints/${complaintId}/status`,
      {
        status,
      }
    );

    return response.data;
  };

// ==========================================================
// RESOLVE COMPLAINT
// ==========================================================

export const resolveComplaint = async (
  complaintId,
  resolutionNote
) => {
  const response = await api.put(
    `/complaints/${complaintId}/resolve`,
    {
      resolutionNote,
    }
  );

  return response.data;
};

// ==========================================================
// NOTIFICATIONS
// ==========================================================

export const getUserNotifications =
  async (userId) => {
    const response = await api.get(
      `/notifications/user/${userId}`
    );

    return response.data;
  };

export const getUnreadNotifications =
  async (userId) => {
    const response = await api.get(
      `/notifications/user/${userId}/unread`
    );

    return response.data;
  };

export const getUnreadNotificationCount =
  async (userId) => {
    const response = await api.get(
      `/notifications/user/${userId}/unread-count`
    );

    return response.data;
  };

export const markNotificationAsRead =
  async (notificationId) => {
    const response = await api.put(
      `/notifications/${notificationId}/read`
    );

    return response.data;
  };

export const markAllNotificationsAsRead =
  async (userId) => {
    const response = await api.put(
      `/notifications/user/${userId}/read-all`
    );

    return response.data;
  };

export const deleteNotification =
  async (notificationId) => {
    const response = await api.delete(
      `/notifications/${notificationId}`
    );

    return response.data;
  };

export const clearUserNotifications =
  async (userId) => {
    const response = await api.delete(
      `/notifications/user/${userId}`
    );

    return response.data;
  };

// ==========================================================
// NOTIFICATION ALIASES
// ==========================================================

export const getNotifications =
  getUserNotifications;

export const getNotificationsByUserId =
  getUserNotifications;

export const getAllNotifications =
  getUserNotifications;

export const getUnreadCount =
  getUnreadNotificationCount;

export const getNotificationUnreadCount =
  getUnreadNotificationCount;

export const markAsRead =
  markNotificationAsRead;

export const markNotificationRead =
  markNotificationAsRead;

export const markAllAsRead =
  markAllNotificationsAsRead;

export const clearNotifications =
  clearUserNotifications;

export const deleteAllNotifications =
  clearUserNotifications;

// ==========================================================
// CATEGORIES
// ==========================================================

export const getCategories = async () => {
  const response = await api.get(
    "/categories"
  );

  return response.data;
};

export const getAdminCategories =
  getCategories;

export const getAllCategories =
  getCategories;

export const getComplaintCategories =
  getCategories;

export const fetchCategories =
  getCategories;

// ==========================================================
// ACTIVE CATEGORIES
// ==========================================================

export const getActiveCategories =
  async () => {
    const response = await api.get(
      "/categories/active"
    );

    return response.data;
  };

export const fetchActiveCategories =
  getActiveCategories;

// ==========================================================
// CATEGORY BY ID
// ==========================================================

export const getCategoryById = async (
  categoryId
) => {
  const response = await api.get(
    `/categories/${categoryId}`
  );

  return response.data;
};

// ==========================================================
// CREATE CATEGORY
// ==========================================================

export const createCategory = async (
  categoryData
) => {
  const response = await api.post(
    "/categories",
    categoryData
  );

  return response.data;
};

// ==========================================================
// UPDATE CATEGORY
// ==========================================================

export const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response = await api.put(
    `/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

// ==========================================================
// TOGGLE CATEGORY STATUS
// ==========================================================

export const toggleCategoryStatus =
  async (categoryId) => {
    const response = await api.put(
      `/categories/${categoryId}/toggle`
    );

    return response.data;
  };

export const toggleCategory =
  toggleCategoryStatus;

// ==========================================================
// ACTIVATE CATEGORY
// ==========================================================

export const activateCategory =
  async (categoryId) => {
    try {
      const response = await api.put(
        `/categories/${categoryId}/activate`
      );

      return response.data;
    } catch (error) {
      if (
        error?.response?.status === 404 ||
        error?.response?.status === 405
      ) {
        return toggleCategoryStatus(categoryId);
      }

      throw error;
    }
  };

// ==========================================================
// DEACTIVATE CATEGORY
// ==========================================================

export const deactivateCategory =
  async (categoryId) => {
    try {
      const response = await api.put(
        `/categories/${categoryId}/deactivate`
      );

      return response.data;
    } catch (error) {
      if (
        error?.response?.status === 404 ||
        error?.response?.status === 405
      ) {
        return toggleCategoryStatus(categoryId);
      }

      throw error;
    }
  };

// ==========================================================
// DELETE CATEGORY
// ==========================================================

export const deleteCategory = async (
  categoryId
) => {
  const response = await api.delete(
    `/categories/${categoryId}`
  );

  return response.data;
};

// ==========================================================
// ADMIN DASHBOARD
// ==========================================================

export const getAdminStats = async () => {
  const response = await api.get(
    "/admin/stats"
  );

  return response.data;
};

export const getDashboardStats =
  getAdminStats;

export const getAdminDashboardStats =
  getAdminStats;

// ==========================================================
// ADMIN ANALYTICS
// ==========================================================

export const getAdminAnalytics =
  async () => {
    const response = await api.get(
      "/admin/analytics"
    );

    return response.data;
  };

export const getAnalytics =
  getAdminAnalytics;

export const getReportsAnalytics =
  getAdminAnalytics;

export const getReportAnalytics =
  getAdminAnalytics;

// ==========================================================
// ADMIN USERS
// ==========================================================

export const getAdminUsers = async () => {
  const response = await api.get(
    "/admin/users"
  );

  return response.data;
};

export const getUsers =
  getAdminUsers;

export const getAllUsers =
  getAdminUsers;

export const fetchUsers =
  getAdminUsers;

// ==========================================================
// ASSIGNABLE STAFF / FACULTY
// ==========================================================

export const getAssignableUsers =
  async () => {
    const data = await getAdminUsers();

    const users = Array.isArray(data)
      ? data
      : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
          ? data.data
          : [];

    return users.filter((user) => {
      const role = String(
        user?.role || ""
      ).toUpperCase();

      const active =
        user?.active !== false;

      return (
        active &&
        (
          role === "STAFF" ||
          role === "FACULTY"
        )
      );
    });
  };

export const getUsersForAssignment =
  getAssignableUsers;

export const fetchAssignableUsers =
  getAssignableUsers;

// ==========================================================
// ADMIN USER BY ID
// ==========================================================

export const getAdminUserById =
  async (userId) => {
    const response = await api.get(
      `/admin/users/${userId}`
    );

    return response.data;
  };

// ==========================================================
// CREATE STAFF / FACULTY USER
// ==========================================================

export const createManagedUser =
  async (userData) => {
    const response = await api.post(
      "/admin/users",
      userData
    );

    return response.data;
  };

export const createUser =
  createManagedUser;

export const addUser =
  createManagedUser;

// ==========================================================
// ACTIVATE USER
// ==========================================================

export const activateUser = async (
  userId
) => {
  const response = await api.put(
    `/admin/users/${userId}/activate`
  );

  return response.data;
};

export const enableUser =
  activateUser;

// ==========================================================
// DEACTIVATE USER
// ==========================================================

export const deactivateUser = async (
  userId
) => {
  const response = await api.put(
    `/admin/users/${userId}/deactivate`
  );

  return response.data;
};

export const disableUser =
  deactivateUser;

// ==========================================================
// ERROR MESSAGE HELPER
// ==========================================================

export const getApiErrorMessage = (
  error,
  fallback =
    "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  return (
    data?.message ||
    data?.error ||
    error?.message ||
    fallback
  );
};

// ==========================================================
// DEFAULT EXPORT
// ==========================================================

export default api;