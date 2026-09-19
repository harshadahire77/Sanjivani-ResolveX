import axios from "axios";

// ==========================================================
// AXIOS INSTANCE
// ==========================================================

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================================
// LOCAL STORAGE KEYS
// ==========================================================

const TOKEN_KEY = "resolvex_token";
const USER_KEY = "resolvex_user";

// ==========================================================
// TOKEN FUNCTIONS
// ==========================================================

export const saveToken = (token) => {
  if (!token) {
    return;
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );
};

export const getToken = () => {
  return localStorage.getItem(
    TOKEN_KEY
  );
};

export const removeToken = () => {
  localStorage.removeItem(
    TOKEN_KEY
  );
};

// ==========================================================
// USER FUNCTIONS
// ==========================================================

export const saveCurrentUser = (
  userData
) => {
  if (!userData) {
    return;
  }

  // Do not save JWT related fields
  const {
    token,
    tokenType,
    message,
    ...safeUser
  } = userData;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      safeUser
    )
  );
};

export const getCurrentUser = () => {
  try {
    const storedUser =
      localStorage.getItem(
        USER_KEY
      );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser
    );
  } catch (error) {
    console.error(
      "Unable to read ResolveX user:",
      error
    );

    return null;
  }
};

export const getCurrentUserRole = () => {
  const user =
    getCurrentUser();

  return (
    user?.role
      ?.trim()
      ?.toUpperCase() || ""
  );
};

// ==========================================================
// AUTH STATE
// ==========================================================

export const isLoggedIn = () => {
  return Boolean(
    getToken()
  );
};

export const logoutUser = () => {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
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
  (error) =>
    Promise.reject(error)
);

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Do not automatically logout on login/register errors
    const requestUrl =
      error?.config?.url || "";

    const isAuthRequest =
      requestUrl.includes(
        "/auth/login"
      ) ||
      requestUrl.includes(
        "/auth/register"
      );

    if (
      error?.response
        ?.status === 401 &&
      !isAuthRequest
    ) {
      logoutUser();
    }

    return Promise.reject(
      error
    );
  }
);

// ==========================================================
// ERROR MESSAGE
// ==========================================================

export const getApiErrorMessage = (
  error
) => {
  if (!error) {
    return "Something went wrong.";
  }

  const data =
    error?.response?.data;

  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data;
  }

  if (
    data?.message
  ) {
    return data.message;
  }

  if (
    data?.error
  ) {
    return data.error;
  }

  if (
    error?.code ===
    "ECONNABORTED"
  ) {
    return "Request timed out. Please try again.";
  }

  if (
    error?.code ===
      "ERR_NETWORK" ||
    !error?.response
  ) {
    return "Cannot connect to ResolveX backend. Make sure Spring Boot is running on port 8081.";
  }

  if (
    error?.response
      ?.status === 401
  ) {
    return "Unauthorized request. Please login again.";
  }

  if (
    error?.response
      ?.status === 403
  ) {
    return "Invalid email or password.";
  }

  if (
    error?.response
      ?.status === 404
  ) {
    return "Requested resource was not found.";
  }

  if (
    error?.response
      ?.status >= 500
  ) {
    return "Server error. Please try again.";
  }

  return (
    error.message ||
    "Something went wrong."
  );
};

// ==========================================================
// HEALTH
// ==========================================================

export const checkBackendHealth =
  async () => {
    const response =
      await api.get(
        "/health"
      );

    return response.data;
  };

// ==========================================================
// AUTH
// ==========================================================

// ----------------------------------------------------------
// REGISTER
// ----------------------------------------------------------

export const registerUser =
  async (userData) => {
    const response =
      await api.post(
        "/auth/register",
        userData
      );

    return response.data;
  };

// Backward compatible alias
export const signupUser =
  registerUser;

// ----------------------------------------------------------
// LOGIN
// IMPORTANT FIX:
// Sends JSON object:
// {
//   email: "...",
//   password: "..."
// }
// ----------------------------------------------------------

export const loginUser = async (
  emailOrData,
  passwordValue
) => {
  let payload;

  // Supports:
  // loginUser({ email, password })
  if (
    typeof emailOrData ===
      "object" &&
    emailOrData !== null
  ) {
    payload = {
      email:
        String(
          emailOrData.email ||
            ""
        )
          .trim()
          .toLowerCase(),

      password:
        String(
          emailOrData.password ||
            ""
        ),
    };
  }

  // Also supports:
  // loginUser(email, password)
  else {
    payload = {
      email:
        String(
          emailOrData || ""
        )
          .trim()
          .toLowerCase(),

      password:
        String(
          passwordValue || ""
        ),
    };
  }

  if (
    !payload.email ||
    !payload.password
  ) {
    throw new Error(
      "Email and password are required."
    );
  }

  const response =
    await api.post(
      "/auth/login",
      payload
    );

  const data =
    response.data;

  if (
    !data?.token
  ) {
    throw new Error(
      "Login succeeded but no authentication token was returned."
    );
  }

  saveToken(
    data.token
  );

  saveCurrentUser(
    data
  );

  return data;
};

// ==========================================================
// USER PROFILE
// ==========================================================

export const getUserProfile =
  async (userId) => {
    const response =
      await api.get(
        `/users/${userId}`
      );

    return response.data;
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

    const data =
      response.data;

    const currentUser =
      getCurrentUser();

    if (
      currentUser &&
      String(
        currentUser.userId ||
          currentUser.id
      ) ===
        String(userId)
    ) {
      saveCurrentUser({
        ...currentUser,
        ...data,
      });
    }

    return data;
  };

// ==========================================================
// COMPLAINTS
// ==========================================================

// CREATE
export const createComplaint =
  async (complaintData) => {
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

// GET USER COMPLAINTS
export const getUserComplaints =
  async (userId) => {
    const response =
      await api.get(
        `/complaints/user/${userId}`
      );

    return response.data;
  };

// GET BY ID
export const getComplaintById =
  async (complaintId) => {
    const response =
      await api.get(
        `/complaints/${complaintId}`
      );

    return response.data;
  };

// GET BY CODE
export const getComplaintByCode =
  async (complaintCode) => {
    const response =
      await api.get(
        `/complaints/code/${complaintCode}`
      );

    return response.data;
  };

// GET BY STATUS
export const getComplaintsByStatus =
  async (status) => {
    const response =
      await api.get(
        `/complaints/status/${status}`
      );

    return response.data;
  };

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

// UPDATE STATUS
export const updateComplaintStatus =
  async (
    complaintId,
    status,
    resolutionNote = null
  ) => {
    const payload = {
      status,
    };

    if (
      resolutionNote !== null
    ) {
      payload.resolutionNote =
        resolutionNote;
    }

    return updateComplaint(
      complaintId,
      payload
    );
  };

// DELETE
export const deleteComplaint =
  async (complaintId) => {
    const response =
      await api.delete(
        `/complaints/${complaintId}`
      );

    return response.data;
  };

// ==========================================================
// COMPLAINT ASSIGNMENT
// ==========================================================

export const getAssignableUsers =
  async () => {
    const response =
      await api.get(
        "/complaints/assignable-users"
      );

    return response.data;
  };

export const assignComplaint =
  async (
    complaintId,
    assignedUserId
  ) => {
    const response =
      await api.put(
        `/complaints/${complaintId}/assign`,
        {
          assignedUserId:
            assignedUserId ||
            null,
        }
      );

    return response.data;
  };

export const getMyAssignedComplaints =
  async () => {
    const response =
      await api.get(
        "/complaints/assigned/me"
      );

    return response.data;
  };

// ==========================================================
// NOTIFICATIONS
// ==========================================================

export const getUserNotifications =
  async (userId) => {
    const response =
      await api.get(
        `/notifications/user/${userId}`
      );

    return response.data;
  };

export const getUnreadNotifications =
  async (userId) => {
    const response =
      await api.get(
        `/notifications/user/${userId}/unread`
      );

    return response.data;
  };

export const getUnreadNotificationCount =
  async (userId) => {
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
  async (userId) => {
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
  async (userId) => {
    const response =
      await api.delete(
        `/notifications/user/${userId}`
      );

    return response.data;
  };

// Aliases for compatibility
export const getNotifications =
  getUserNotifications;

export const getUnreadCount =
  getUnreadNotificationCount;

export const markAsRead =
  markNotificationAsRead;

export const markAllAsRead =
  markAllNotificationsAsRead;

export const clearNotifications =
  clearUserNotifications;

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
  async (userId) => {
    const response =
      await api.get(
        `/admin/users/${userId}`
      );

    return response.data;
  };

export const createManagedUser =
  async (userData) => {
    const response =
      await api.post(
        "/admin/users",
        userData
      );

    return response.data;
  };

export const activateUser =
  async (userId) => {
    const response =
      await api.put(
        `/admin/users/${userId}/activate`
      );

    return response.data;
  };

export const deactivateUser =
  async (userId) => {
    const response =
      await api.put(
        `/admin/users/${userId}/deactivate`
      );

    return response.data;
  };

// ==========================================================
// CATEGORY MANAGEMENT
// ==========================================================

// ACTIVE CATEGORIES
export const getCategories =
  async () => {
    const response =
      await api.get(
        "/categories"
      );

    return response.data;
  };

// ALL CATEGORIES - ADMIN
export const getAdminCategories =
  async () => {
    const response =
      await api.get(
        "/categories/admin"
      );

    return response.data;
  };

// CREATE - ADMIN
export const createCategory =
  async (categoryData) => {
    const response =
      await api.post(
        "/categories",
        categoryData
      );

    return response.data;
  };

// UPDATE - ADMIN
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

// ACTIVATE - ADMIN
export const activateCategory =
  async (categoryId) => {
    const response =
      await api.put(
        `/categories/${categoryId}/activate`
      );

    return response.data;
  };

// DEACTIVATE - ADMIN
export const deactivateCategory =
  async (categoryId) => {
    const response =
      await api.put(
        `/categories/${categoryId}/deactivate`
      );

    return response.data;
  };

// ==========================================================
// DEFAULT EXPORT
// ==========================================================

export default api;