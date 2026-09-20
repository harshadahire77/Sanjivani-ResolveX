import axios from "axios";

// ==========================================================
// RESOLVEX API CONFIGURATION
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

const TOKEN_KEY =
  "resolvex_token";

const USER_KEY =
  "resolvex_user";

// ==========================================================
// NORMALIZE USER
// ==========================================================

const normalizeUser = (data) => {
  const source =
    data?.user ||
    data?.data?.user ||
    data?.data ||
    data ||
    {};

  return {
    ...source,

    id:
      source.id ??
      source.userId ??
      null,

    userId:
      source.userId ??
      source.id ??
      null,

    name:
      source.name ||
      "",

    universityId:
      source.universityId ||
      "",

    email:
      source.email ||
      "",

    phone:
      source.phone ||
      "",

    role:
      String(
        source.role ||
        "STUDENT"
      )
        .trim()
        .toUpperCase(),

    department:
      source.department ||
      "",

    program:
      source.program ||
      "",

    year:
      source.year ??
      "",

    active:
      source.active !== false,

    createdAt:
      source.createdAt ||
      null,

    updatedAt:
      source.updatedAt ||
      null,
  };
};

// ==========================================================
// TOKEN HELPERS
// ==========================================================

export const getToken = () => {
  return localStorage.getItem(
    TOKEN_KEY
  );
};

export const setToken = (
  token
) => {
  if (!token) {
    return;
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );
};

export const removeToken = () => {
  localStorage.removeItem(
    TOKEN_KEY
  );
};

// ==========================================================
// USER STORAGE
// ==========================================================

export const getStoredUser = () => {
  try {
    const stored =
      localStorage.getItem(
        USER_KEY
      );

    if (!stored) {
      return null;
    }

    return normalizeUser(
      JSON.parse(stored)
    );
  } catch (error) {
    console.error(
      "Unable to read stored ResolveX user:",
      error
    );

    return null;
  }
};

export const setStoredUser = (
  user
) => {
  if (!user) {
    return;
  }

  const normalized =
    normalizeUser(
      user
    );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      normalized
    )
  );
};

export const removeStoredUser =
  () => {
    localStorage.removeItem(
      USER_KEY
    );
  };

export const clearAuthData =
  () => {
    removeToken();
    removeStoredUser();
  };

// ==========================================================
// AUTH HELPERS
// ==========================================================

export const isLoggedIn = () => {
  return Boolean(
    getToken()
  );
};

export const isAuthenticated =
  isLoggedIn;

export const getLoggedInUser =
  getStoredUser;

export const getCurrentRole = () => {
  return (
    getStoredUser()?.role ||
    ""
  );
};

export const getCurrentUserId =
  () => {
    const user =
      getStoredUser();

    return (
      user?.id ??
      user?.userId ??
      null
    );
  };

// ==========================================================
// REQUEST INTERCEPTOR
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const token =
      getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error.response?.status ===
      401
    ) {
      clearAuthData();
    }

    return Promise.reject(
      error
    );
  }
);

// ==========================================================
// HEALTH
// ==========================================================

export const checkHealth =
  async () => {
    const response =
      await api.get(
        "/health"
      );

    return response.data;
  };

export const getHealth =
  checkHealth;

// ==========================================================
// AUTHENTICATION
// ==========================================================

// LOGIN

export const loginUser =
  async (
    credentials
  ) => {
    const response =
      await api.post(
        "/auth/login",
        credentials
      );

    const data =
      response.data ||
      {};

    const token =
      data?.token ||
      data?.accessToken ||
      data?.access_token ||
      data?.jwt ||
      data?.data?.token;

    if (!token) {
      throw new Error(
        "Authentication token was not returned by the server."
      );
    }

    const user =
      normalizeUser(
        data
      );

    setToken(
      token
    );

    setStoredUser(
      user
    );

    return {
      ...data,
      user,
    };
  };

// REGISTER

export const registerUser =
  async (
    userData
  ) => {
    const response =
      await api.post(
        "/auth/register",
        userData
      );

    return response.data;
  };

// CURRENT USER

export const getCurrentUser =
  async () => {
    const response =
      await api.get(
        "/auth/me"
      );

    const user =
      normalizeUser(
        response.data
      );

    setStoredUser(
      user
    );

    return user;
  };

// LOGOUT

export const logoutUser =
  () => {
    clearAuthData();
  };

// AUTH ALIASES

export const login =
  loginUser;

export const signupUser =
  registerUser;

export const signup =
  registerUser;

export const register =
  registerUser;

export const logout =
  logoutUser;

export const getMe =
  getCurrentUser;

// ==========================================================
// USER / PROFILE
// ==========================================================

export const getUserById =
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/users/${userId}`
      );

    return normalizeUser(
      response.data
    );
  };

export const updateUserProfile =
  async (
    userId,
    userData
  ) => {
    const response =
      await api.put(
        `/users/${userId}`,
        userData
      );

    const user =
      normalizeUser(
        response.data?.user ||
        response.data
      );

    setStoredUser(
      user
    );

    return user;
  };

export const getUserProfile =
  getUserById;

export const updateProfile =
  updateUserProfile;

export const updateUser =
  updateUserProfile;

// ==========================================================
// COMPLAINTS
// ==========================================================

// CREATE

export const createComplaint =
  async (
    complaintData
  ) => {
    const response =
      await api.post(
        "/complaints",
        complaintData
      );

    return response.data;
  };

// GET ALL

export const getAllComplaints =
  async () => {
    const response =
      await api.get(
        "/complaints"
      );

    return response.data;
  };

// GET ONE

export const getComplaintById =
  async (
    complaintId
  ) => {
    const response =
      await api.get(
        `/complaints/${complaintId}`
      );

    return response.data;
  };

// MY COMPLAINTS

export const getMyComplaints =
  async () => {
    const response =
      await api.get(
        "/complaints/my"
      );

    return response.data;
  };

// USER COMPLAINTS

export const getComplaintsByUserId =
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/complaints/user/${userId}`
      );

    return response.data;
  };

// Dashboard compatibility

export const getUserComplaints =
  getComplaintsByUserId;

// UPDATE

export const updateComplaint =
  async (
    complaintId,
    complaintData
  ) => {
    const response =
      await api.put(
        `/complaints/${complaintId}`,
        complaintData
      );

    return response.data;
  };

// DELETE

export const deleteComplaint =
  async (
    complaintId
  ) => {
    const response =
      await api.delete(
        `/complaints/${complaintId}`
      );

    return response.data;
  };

// ==========================================================
// ASSIGNABLE USERS
// ==========================================================

export const getAssignableUsers =
  async () => {
    const response =
      await api.get(
        "/complaints/assignable-users"
      );

    return response.data;
  };

// ==========================================================
// ASSIGN COMPLAINT
// ==========================================================

export const assignComplaint =
  async (
    complaintId,
    assignedUserId
  ) => {
    const response =
      await api.put(
        `/complaints/${complaintId}/assign`,
        {
          assignedUserId,
        }
      );

    return response.data;
  };

export const unassignComplaint =
  async (
    complaintId
  ) => {
    const response =
      await api.put(
        `/complaints/${complaintId}/assign`,
        {
          assignedUserId:
            null,
        }
      );

    return response.data;
  };

// ==========================================================
// ASSIGNED COMPLAINTS
// ==========================================================

export const getAssignedComplaints =
  async () => {
    const response =
      await api.get(
        "/complaints/assigned/me"
      );

    return response.data;
  };

export const getMyAssignedComplaints =
  getAssignedComplaints;

export const getStaffComplaints =
  getAssignedComplaints;

// ==========================================================
// COMPLAINT STATUS
// ==========================================================

export const updateComplaintStatus =
  async (
    complaintId,
    status
  ) => {
    const response =
      await api.put(
        `/complaints/${complaintId}/status`,
        {
          status,
        }
      );

    return response.data;
  };

export const resolveComplaint =
  async (
    complaintId,
    resolutionNote
  ) => {
    const response =
      await api.put(
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
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/notifications/user/${userId}`
      );

    return response.data;
  };

export const getUnreadNotifications =
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/notifications/user/${userId}/unread`
      );

    return response.data;
  };

export const getUnreadNotificationCount =
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/notifications/user/${userId}/unread-count`
      );

    return response.data;
  };

export const markNotificationAsRead =
  async (
    notificationId
  ) => {
    const response =
      await api.put(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  };

export const markAllNotificationsAsRead =
  async (
    userId
  ) => {
    const response =
      await api.put(
        `/notifications/user/${userId}/read-all`
      );

    return response.data;
  };

export const deleteNotification =
  async (
    notificationId
  ) => {
    const response =
      await api.delete(
        `/notifications/${notificationId}`
      );

    return response.data;
  };

export const clearUserNotifications =
  async (
    userId
  ) => {
    const response =
      await api.delete(
        `/notifications/user/${userId}`
      );

    return response.data;
  };

// NOTIFICATION ALIASES

export const getNotifications =
  getUserNotifications;

export const getNotificationsByUserId =
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

// GET ALL

export const getCategories =
  async () => {
    const response =
      await api.get(
        "/categories"
      );

    return response.data;
  };

// GET ACTIVE

export const getActiveCategories =
  async () => {
    const response =
      await api.get(
        "/categories/active"
      );

    return response.data;
  };

// GET ONE

export const getCategoryById =
  async (
    categoryId
  ) => {
    const response =
      await api.get(
        `/categories/${categoryId}`
      );

    return response.data;
  };

// CREATE

export const createCategory =
  async (
    categoryData
  ) => {
    const response =
      await api.post(
        "/categories",
        categoryData
      );

    return response.data;
  };

// UPDATE

export const updateCategory =
  async (
    categoryId,
    categoryData
  ) => {
    const response =
      await api.put(
        `/categories/${categoryId}`,
        categoryData
      );

    return response.data;
  };

// ==========================================================
// ACTIVATE CATEGORY
// ==========================================================
//
// CategoryManagement.jsx imports this function.
// We update only the active field.
//

export const activateCategory =
  async (
    categoryId
  ) => {
    const response =
      await api.put(
        `/categories/${categoryId}`,
        {
          active: true,
        }
      );

    return response.data;
  };

// ==========================================================
// DEACTIVATE CATEGORY
// ==========================================================
//
// This was the missing export causing your latest build error.
//

export const deactivateCategory =
  async (
    categoryId
  ) => {
    const response =
      await api.put(
        `/categories/${categoryId}`,
        {
          active: false,
        }
      );

    return response.data;
  };

// TOGGLE CATEGORY

export const toggleCategoryStatus =
  async (
    categoryId
  ) => {
    const response =
      await api.put(
        `/categories/${categoryId}/toggle`
      );

    return response.data;
  };

// DELETE CATEGORY

export const deleteCategory =
  async (
    categoryId
  ) => {
    const response =
      await api.delete(
        `/categories/${categoryId}`
      );

    return response.data;
  };

// CATEGORY ALIASES

export const fetchCategories =
  getCategories;

export const fetchActiveCategories =
  getActiveCategories;

export const getAdminCategories =
  getCategories;

export const getComplaintCategories =
  getCategories;

export const toggleCategory =
  toggleCategoryStatus;

// ==========================================================
// ADMIN DASHBOARD
// ==========================================================

export const getAdminStats =
  async () => {
    const response =
      await api.get(
        "/admin/stats"
      );

    return response.data;
  };

export const getAdminAnalytics =
  async () => {
    const response =
      await api.get(
        "/admin/analytics"
      );

    return response.data;
  };

export const getDashboardStats =
  getAdminStats;

export const getAnalytics =
  getAdminAnalytics;

export const getReportsAnalytics =
  getAdminAnalytics;

// ==========================================================
// ADMIN USER MANAGEMENT
// ==========================================================

export const getAdminUsers =
  async () => {
    const response =
      await api.get(
        "/admin/users"
      );

    return response.data;
  };

export const getAdminUserById =
  async (
    userId
  ) => {
    const response =
      await api.get(
        `/admin/users/${userId}`
      );

    return response.data;
  };

export const createManagedUser =
  async (
    userData
  ) => {
    const response =
      await api.post(
        "/admin/users",
        userData
      );

    return response.data;
  };

export const activateUser =
  async (
    userId
  ) => {
    const response =
      await api.put(
        `/admin/users/${userId}/activate`
      );

    return response.data;
  };

export const deactivateUser =
  async (
    userId
  ) => {
    const response =
      await api.put(
        `/admin/users/${userId}/deactivate`
      );

    return response.data;
  };

// USER MANAGEMENT ALIASES

export const getAllUsers =
  getAdminUsers;

export const getUsers =
  getAdminUsers;

export const createUser =
  createManagedUser;

export const enableUser =
  activateUser;

export const disableUser =
  deactivateUser;

// ==========================================================
// ROLE HELPERS
// ==========================================================

export const isAdmin = () => {
  return (
    getCurrentRole() ===
    "ADMIN"
  );
};

export const isStaff = () => {
  const role =
    getCurrentRole();

  return (
    role === "STAFF" ||
    role === "FACULTY"
  );
};

export const isStudent = () => {
  return (
    getCurrentRole() ===
    "STUDENT"
  );
};

// ==========================================================
// ERROR MESSAGE HELPER
// ==========================================================

export const getApiErrorMessage =
  (
    error,
    fallback =
      "Something went wrong. Please try again."
  ) => {
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error;

    if (backendMessage) {
      return backendMessage;
    }

    if (
      error?.response?.status ===
      400
    ) {
      return "Please check the entered information.";
    }

    if (
      error?.response?.status ===
      401
    ) {
      return "Invalid email or password.";
    }

    if (
      error?.response?.status ===
      403
    ) {
      return "You are not authorized to perform this action.";
    }

    if (
      error?.response?.status ===
      404
    ) {
      return "Requested resource was not found.";
    }

    if (
      error?.response?.status ===
      409
    ) {
      return "This record already exists.";
    }

    if (
      error?.response?.status >=
      500
    ) {
      return "ResolveX server encountered an error. Please try again.";
    }

    if (
      error?.code ===
      "ERR_NETWORK"
    ) {
      return "Unable to connect to the ResolveX server.";
    }

    return (
      error?.message ||
      fallback
    );
  };

// ==========================================================
// DEFAULT EXPORT
// ==========================================================

export default api;