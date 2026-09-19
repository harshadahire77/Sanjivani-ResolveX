import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  activateUser,
  createManagedUser,
  deactivateUser,
  getAdminUsers,
  getApiErrorMessage,
  getCurrentUser,
} from "../services/api";

const UserManagement = () => {
  const currentUser = getCurrentUser();

  // =========================================================
  // USERS
  // =========================================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // =========================================================
  // CREATE USER MODAL
  // =========================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const initialForm = {
    name: "",
    universityId: "",
    email: "",
    phone: "",
    role: "STAFF",
    department: "",
    program: "",
    year: "",
    password: "",
  };

  const [formData, setFormData] =
    useState(initialForm);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await getAdminUsers();

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          getApiErrorMessage
            ? getApiErrorMessage(err)
            : "Unable to load users."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            !query ||
            user.name
              ?.toLowerCase()
              .includes(query) ||
            user.email
              ?.toLowerCase()
              .includes(query) ||
            user.universityId
              ?.toLowerCase()
              .includes(query) ||
            user.department
              ?.toLowerCase()
              .includes(query);

          const matchesRole =
            roleFilter === "ALL" ||
            user.role ===
              roleFilter;

          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter ===
                "ACTIVE" &&
              user.active === true
            ) ||
            (
              statusFilter ===
                "INACTIVE" &&
              user.active === false
            );

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =========================================================
  // OPEN MODAL
  // =========================================================

  const openCreateModal = () => {
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowCreateModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    setShowCreateModal(false);
    setFormData(initialForm);
    setShowPassword(false);
  };

  // =========================================================
  // CREATE STAFF / FACULTY
  // =========================================================

  const handleCreateUser =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      // ---------------------------------------------
      // FRONTEND VALIDATION
      // ---------------------------------------------

      if (!formData.name.trim()) {
        setError(
          "Name is required."
        );
        return;
      }

      if (
        !formData.universityId.trim()
      ) {
        setError(
          "University ID is required."
        );
        return;
      }

      if (!formData.email.trim()) {
        setError(
          "Email is required."
        );
        return;
      }

      if (
        !formData.email.includes("@")
      ) {
        setError(
          "Enter a valid email address."
        );
        return;
      }

      if (
        formData.role !== "STAFF" &&
        formData.role !== "FACULTY"
      ) {
        setError(
          "Role must be STAFF or FACULTY."
        );
        return;
      }

      if (
        formData.password.length < 6
      ) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      try {
        setCreating(true);

        const payload = {
          name:
            formData.name.trim(),

          universityId:
            formData.universityId
              .trim()
              .toUpperCase(),

          email:
            formData.email
              .trim()
              .toLowerCase(),

          phone:
            formData.phone.trim(),

          role:
            formData.role,

          department:
            formData.department.trim(),

          program:
            formData.program.trim(),

          year:
            formData.year.trim(),

          password:
            formData.password,
        };

        const response =
          await createManagedUser(
            payload
          );

        setSuccess(
          response?.message ||
            "Account created successfully."
        );

        setShowCreateModal(false);

        setFormData(initialForm);

        await loadUsers();
      } catch (err) {
        setError(
          getApiErrorMessage
            ? getApiErrorMessage(err)
            : "Unable to create account."
        );
      } finally {
        setCreating(false);
      }
    };

  // =========================================================
  // ACTIVATE USER
  // =========================================================

  const handleActivate =
    async (userId) => {
      try {
        setUpdatingId(userId);

        setError("");
        setSuccess("");

        const response =
          await activateUser(
            userId
          );

        setUsers(
          (previous) =>
            previous.map(
              (user) =>
                user.userId ===
                userId
                  ? {
                      ...user,
                      active: true,
                    }
                  : user
            )
        );

        setSuccess(
          response?.message ||
            "User activated successfully."
        );
      } catch (err) {
        setError(
          getApiErrorMessage
            ? getApiErrorMessage(err)
            : "Unable to activate user."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  // =========================================================
  // DEACTIVATE USER
  // =========================================================

  const handleDeactivate =
    async (userId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to deactivate this user?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(userId);

        setError("");
        setSuccess("");

        const response =
          await deactivateUser(
            userId
          );

        setUsers(
          (previous) =>
            previous.map(
              (user) =>
                user.userId ===
                userId
                  ? {
                      ...user,
                      active: false,
                    }
                  : user
            )
        );

        setSuccess(
          response?.message ||
            "User deactivated successfully."
        );
      } catch (err) {
        setError(
          getApiErrorMessage
            ? getApiErrorMessage(err)
            : "Unable to deactivate user."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  // =========================================================
  // COUNTS
  // =========================================================

  const totalUsers =
    users.length;

  const activeUsers =
    users.filter(
      (user) =>
        user.active
    ).length;

  const inactiveUsers =
    users.filter(
      (user) =>
        !user.active
    ).length;

  const studentCount =
    users.filter(
      (user) =>
        user.role === "STUDENT"
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <div className="rx-um-loading">
          <div className="rx-um-spinner" />

          <p>
            Loading users...
          </p>
        </div>

        <style>{styles}</style>
      </>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <div className="rx-um-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-um-header">

          <div>
            <div className="rx-um-label">
              <ShieldCheck size={16} />
              ADMINISTRATION
            </div>

            <h1>
              User Management
            </h1>

            <p>
              Manage students, faculty,
              staff and ResolveX accounts.
            </p>
          </div>

          <div className="rx-um-header-actions">

            <button
              type="button"
              className="rx-um-refresh"
              onClick={() =>
                loadUsers(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "rx-um-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="rx-um-create-button"
              onClick={
                openCreateModal
              }
            >
              <Plus size={18} />

              Create Staff / Faculty
            </button>

          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="rx-um-message error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="rx-um-message success">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================== */}

        <div className="rx-um-stats">

          <StatCard
            icon={
              <Users size={22} />
            }
            title="Total Users"
            value={totalUsers}
            type="green"
          />

          <StatCard
            icon={
              <UserCheck
                size={22}
              />
            }
            title="Active Users"
            value={activeUsers}
            type="blue"
          />

          <StatCard
            icon={
              <UserX size={22} />
            }
            title="Inactive Users"
            value={inactiveUsers}
            type="red"
          />

          <StatCard
            icon={
              <UserRound
                size={22}
              />
            }
            title="Students"
            value={studentCount}
            type="purple"
          />

        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================== */}

        <div className="rx-um-toolbar">

          <div className="rx-um-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search name, email, university ID..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="rx-um-filter">

            <Filter size={17} />

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="STUDENT">
                Student
              </option>

              <option value="FACULTY">
                Faculty
              </option>

              <option value="STAFF">
                Staff
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>

          </div>

          <div className="rx-um-filter">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>

        </div>

        {/* =================================================
            USER TABLE
        ================================================== */}

        <div className="rx-um-table-card">

          <div className="rx-um-table-title">

            <div>
              <h2>
                Registered Users
              </h2>

              <p>
                Showing{" "}
                {filteredUsers.length}
                {" "}of{" "}
                {users.length} users
              </p>
            </div>

          </div>

          {filteredUsers.length ===
          0 ? (

            <div className="rx-um-empty">

              <Users size={40} />

              <h3>
                No users found
              </h3>

              <p>
                Change your search
                or filter options.
              </p>

            </div>

          ) : (

            <div className="rx-um-table-wrapper">

              <table className="rx-um-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>
                      University ID
                    </th>
                    <th>Role</th>
                    <th>
                      Department
                    </th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map(
                    (user) => {

                      const isCurrentAdmin =
                        Number(
                          currentUser
                            ?.userId
                        ) ===
                        Number(
                          user.userId
                        );

                      return (
                        <tr
                          key={
                            user.userId
                          }
                        >

                          <td>

                            <div className="rx-um-user">

                              <div className="rx-um-avatar">

                                {user.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "U"}

                              </div>

                              <div>

                                <strong>
                                  {user.name ||
                                    "Unknown User"}
                                </strong>

                                <span>
                                  <Mail
                                    size={12}
                                  />

                                  {user.email}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="rx-um-id">
                              {user.universityId ||
                                "-"}
                            </span>

                          </td>

                          <td>

                            <RoleBadge
                              role={
                                user.role
                              }
                            />

                          </td>

                          <td>

                            <div className="rx-um-department">

                              <strong>
                                {user.department ||
                                  "-"}
                              </strong>

                              {user.program && (
                                <span>
                                  {
                                    user.program
                                  }
                                </span>
                              )}

                            </div>

                          </td>

                          <td>

                            <span
                              className={`rx-um-status ${
                                user.active
                                  ? "active"
                                  : "inactive"
                              }`}
                            >

                              <span />

                              {user.active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>

                          <td>

                            {isCurrentAdmin ? (

                              <span className="rx-um-current">
                                Current Admin
                              </span>

                            ) : user.active ? (

                              <button
                                type="button"
                                className="rx-um-action deactivate"
                                disabled={
                                  updatingId ===
                                  user.userId
                                }
                                onClick={() =>
                                  handleDeactivate(
                                    user.userId
                                  )
                                }
                              >
                                <UserX
                                  size={15}
                                />

                                {updatingId ===
                                user.userId
                                  ? "Updating..."
                                  : "Deactivate"}
                              </button>

                            ) : (

                              <button
                                type="button"
                                className="rx-um-action activate"
                                disabled={
                                  updatingId ===
                                  user.userId
                                }
                                onClick={() =>
                                  handleActivate(
                                    user.userId
                                  )
                                }
                              >
                                <UserCheck
                                  size={15}
                                />

                                {updatingId ===
                                user.userId
                                  ? "Updating..."
                                  : "Activate"}
                              </button>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>

            </div>
          )}

        </div>
      </div>

      {/* ===================================================
          CREATE ACCOUNT MODAL
      ==================================================== */}

      {showCreateModal && (
        <div
          className="rx-um-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }
          }}
        >

          <div className="rx-um-modal">

            <div className="rx-um-modal-header">

              <div>
                <div className="rx-um-modal-icon">
                  <Plus size={21} />
                </div>

                <div>
                  <h2>
                    Create Account
                  </h2>

                  <p>
                    Create a Staff or
                    Faculty ResolveX account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="rx-um-close"
                onClick={
                  closeCreateModal
                }
                disabled={creating}
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateUser
              }
              className="rx-um-form"
            >

              <div className="rx-um-form-grid">

                <FormField
                  label="Full Name"
                  required
                >
                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                    autoFocus
                  />
                </FormField>

                <FormField
                  label="University ID"
                  required
                >
                  <input
                    type="text"
                    name="universityId"
                    value={
                      formData.universityId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. SU2026STF001"
                  />
                </FormField>

                <FormField
                  label="Email"
                  required
                >
                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="user@university.com"
                  />
                </FormField>

                <FormField
                  label="Phone"
                >
                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Phone number"
                  />
                </FormField>

                <FormField
                  label="Role"
                  required
                >
                  <select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="STAFF">
                      Staff
                    </option>

                    <option value="FACULTY">
                      Faculty
                    </option>
                  </select>
                </FormField>

                <FormField
                  label="Department"
                >
                  <input
                    type="text"
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. AI & DS"
                  />
                </FormField>

                <FormField
                  label="Program"
                >
                  <input
                    type="text"
                    name="program"
                    value={
                      formData.program
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. B.Tech AI & DS"
                  />
                </FormField>

                <FormField
                  label="Year"
                >
                  <select
                    name="year"
                    value={
                      formData.year
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select year
                    </option>

                    <option value="1">
                      First Year
                    </option>

                    <option value="2">
                      Second Year
                    </option>

                    <option value="3">
                      Third Year
                    </option>

                    <option value="4">
                      Fourth Year
                    </option>
                  </select>
                </FormField>

              </div>

              <FormField
                label="Temporary Password"
                required
              >

                <div className="rx-um-password">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </FormField>

              <div className="rx-um-form-note">

                <ShieldCheck
                  size={17}
                />

                <p>
                  Only STAFF and FACULTY
                  accounts can be created
                  here. Passwords are
                  securely hashed by the
                  backend.
                </p>

              </div>

              <div className="rx-um-modal-actions">

                <button
                  type="button"
                  className="rx-um-cancel"
                  onClick={
                    closeCreateModal
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rx-um-submit"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="rx-um-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus
                        size={17}
                      />

                      Create Account
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      <style>{styles}</style>
    </>
  );
};

// ===========================================================
// FORM FIELD
// ===========================================================

const FormField = ({
  label,
  required = false,
  children,
}) => {
  return (
    <label className="rx-um-field">

      <span>
        {label}

        {required && (
          <b>*</b>
        )}
      </span>

      {children}

    </label>
  );
};

// ===========================================================
// STAT CARD
// ===========================================================

const StatCard = ({
  icon,
  title,
  value,
  type,
}) => {
  return (
    <div className="rx-um-stat-card">

      <div
        className={`rx-um-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
};

// ===========================================================
// ROLE BADGE
// ===========================================================

const RoleBadge = ({
  role,
}) => {
  const normalized =
    role || "UNKNOWN";

  return (
    <span
      className={`rx-um-role ${normalized.toLowerCase()}`}
    >
      {normalized}
    </span>
  );
};

// ===========================================================
// CSS
// ===========================================================

const styles = `
.rx-um-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  background:
    radial-gradient(
      circle at top right,
      rgba(16,185,129,.08),
      transparent 27%
    ),
    #f6f8f7;
  color: #17251e;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.rx-um-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 25px;
  margin-bottom: 27px;
}

.rx-um-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #16865d;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.rx-um-header h1 {
  margin: 0;
  font-size: 36px;
  letter-spacing: -1px;
}

.rx-um-header p {
  margin: 7px 0 0;
  color: #758078;
  font-size: 14px;
}

.rx-um-header-actions {
  display: flex;
  gap: 10px;
}

.rx-um-refresh,
.rx-um-create-button {
  min-height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

.rx-um-refresh {
  border: 1px solid #dce5e0;
  background: white;
  color: #344139;
}

.rx-um-create-button {
  border: 1px solid #178d63;
  background: #178d63;
  color: white;
  box-shadow:
    0 7px 18px rgba(23,141,99,.18);
}

.rx-um-create-button:hover {
  background: #117a55;
}

.rx-um-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 15px;
  margin-bottom: 17px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 650;
}

.rx-um-message.error {
  border: 1px solid #f2d0d0;
  background: #fff0f0;
  color: #c84747;
}

.rx-um-message.success {
  border: 1px solid #caeadb;
  background: #eaf8f1;
  color: #16865d;
}

.rx-um-stats {
  display: grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap: 15px;
  margin-bottom: 22px;
}

.rx-um-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e3ebe7;
  border-radius: 16px;
  background: white;
}

.rx-um-stat-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
}

.rx-um-stat-icon.green {
  background: #e6f8ef;
  color: #16865d;
}

.rx-um-stat-icon.blue {
  background: #e9f2ff;
  color: #3775c0;
}

.rx-um-stat-icon.red {
  background: #fff0f0;
  color: #d65050;
}

.rx-um-stat-icon.purple {
  background: #f2edff;
  color: #7357c4;
}

.rx-um-stat-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-um-stat-card span {
  color: #78847d;
  font-size: 12px;
  font-weight: 700;
}

.rx-um-stat-card strong {
  margin-top: 3px;
  font-size: 25px;
}

.rx-um-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.rx-um-search {
  flex: 1;
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid #dde5e1;
  border-radius: 12px;
  background: white;
  color: #7e8a83;
}

.rx-um-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
}

.rx-um-filter {
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #dde5e1;
  border-radius: 12px;
  background: white;
}

.rx-um-filter select {
  border: 0;
  outline: none;
  background: transparent;
  color: #344139;
  font-weight: 650;
}

.rx-um-table-card {
  overflow: hidden;
  border: 1px solid #e3ebe7;
  border-radius: 17px;
  background: white;
  box-shadow:
    0 8px 26px rgba(23,60,42,.04);
}

.rx-um-table-title {
  padding: 20px 22px;
}

.rx-um-table-title h2 {
  margin: 0;
  font-size: 18px;
}

.rx-um-table-title p {
  margin: 4px 0 0;
  color: #89948e;
  font-size: 11px;
}

.rx-um-table-wrapper {
  overflow-x: auto;
}

.rx-um-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

.rx-um-table th {
  padding: 12px 17px;
  text-align: left;
  background: #f8faf9;
  color: #78847d;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.rx-um-table td {
  padding: 15px 17px;
  border-top: 1px solid #edf1ef;
  font-size: 12px;
}

.rx-um-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rx-um-avatar {
  width: 38px;
  height: 38px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #e8f7ef;
  color: #16865d;
  font-weight: 800;
}

.rx-um-user > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.rx-um-user span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8e9993;
  font-size: 10px;
}

.rx-um-id {
  font-family: monospace;
}

.rx-um-role {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 850;
}

.rx-um-role.student {
  background: #e9f7ef;
  color: #16865d;
}

.rx-um-role.faculty {
  background: #eaf3ff;
  color: #3473bd;
}

.rx-um-role.staff {
  background: #fff3e5;
  color: #c97a24;
}

.rx-um-role.admin {
  background: #f1ebff;
  color: #704fc5;
}

.rx-um-department {
  display: flex;
  flex-direction: column;
}

.rx-um-department span {
  margin-top: 2px;
  color: #8f9994;
  font-size: 10px;
}

.rx-um-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
}

.rx-um-status > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.rx-um-status.active {
  color: #16865d;
}

.rx-um-status.active > span {
  background: #22a875;
}

.rx-um-status.inactive {
  color: #cf4c4c;
}

.rx-um-status.inactive > span {
  background: #d95757;
}

.rx-um-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.rx-um-action.activate {
  background: #e9f8f1;
  color: #16865d;
}

.rx-um-action.deactivate {
  background: #fff0f0;
  color: #cb4949;
}

.rx-um-action:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.rx-um-current {
  color: #7e8a83;
  font-size: 10px;
  font-weight: 700;
}

.rx-um-empty {
  padding: 60px 20px;
  text-align: center;
  color: #89948e;
}

.rx-um-empty h3 {
  margin: 11px 0 4px;
  color: #354139;
}

.rx-um-empty p {
  margin: 0;
  font-size: 12px;
}

/* ===========================
   MODAL
=========================== */

.rx-um-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(8,25,18,.58);
  backdrop-filter: blur(5px);
}

.rx-um-modal {
  width: min(760px,100%);
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid #dfe8e3;
  border-radius: 20px;
  background: white;
  box-shadow:
    0 30px 80px rgba(0,0,0,.22);
}

.rx-um-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 23px;
  border-bottom: 1px solid #e8eeeb;
}

.rx-um-modal-header > div:first-child {
  display: flex;
  gap: 12px;
}

.rx-um-modal-icon {
  width: 43px;
  height: 43px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e7f8ef;
  color: #16865d;
}

.rx-um-modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.rx-um-modal-header p {
  margin: 4px 0 0;
  color: #849089;
  font-size: 12px;
}

.rx-um-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: #f4f6f5;
  color: #5c6962;
  cursor: pointer;
}

.rx-um-form {
  padding: 23px;
}

.rx-um-form-grid {
  display: grid;
  grid-template-columns:
    repeat(2,minmax(0,1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.rx-um-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rx-um-field > span {
  color: #4f5d55;
  font-size: 11px;
  font-weight: 750;
}

.rx-um-field > span b {
  margin-left: 3px;
  color: #dc4f4f;
}

.rx-um-field input,
.rx-um-field select {
  width: 100%;
  min-height: 43px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #dae4df;
  border-radius: 10px;
  outline: none;
  background: #fff;
  color: #26352e;
  font-size: 13px;
  transition: .2s;
}

.rx-um-field input:focus,
.rx-um-field select:focus {
  border-color: #20a573;
  box-shadow:
    0 0 0 3px rgba(32,165,115,.09);
}

.rx-um-password {
  position: relative;
}

.rx-um-password input {
  padding-right: 45px;
}

.rx-um-password button {
  position: absolute;
  top: 50%;
  right: 8px;
  display: flex;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: #76827b;
  cursor: pointer;
}

.rx-um-form-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 17px;
  padding: 12px;
  border-radius: 10px;
  background: #f0f8f4;
  color: #36725a;
}

.rx-um-form-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.rx-um-form-note p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
}

.rx-um-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.rx-um-cancel,
.rx-um-submit {
  min-height: 41px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.rx-um-cancel {
  border: 1px solid #dce5e0;
  background: white;
  color: #536159;
}

.rx-um-submit {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #178d63;
  background: #178d63;
  color: white;
}

.rx-um-submit:disabled,
.rx-um-cancel:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.rx-um-loading {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #758078;
}

.rx-um-spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  border: 4px solid #dceae3;
  border-top-color: #1a9c6c;
  border-radius: 50%;
  animation: rxUmSpin .8s linear infinite;
}

.rx-um-spin {
  animation: rxUmSpin .8s linear infinite;
}

@keyframes rxUmSpin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width:1100px) {
  .rx-um-stats {
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }
}

@media(max-width:760px) {
  .rx-um-page {
    padding: 20px 15px;
  }

  .rx-um-header {
    flex-direction: column;
  }

  .rx-um-header-actions {
    width: 100%;
    flex-direction: column;
  }

  .rx-um-refresh,
  .rx-um-create-button {
    width: 100%;
  }

  .rx-um-stats {
    grid-template-columns: 1fr;
  }

  .rx-um-toolbar {
    flex-direction: column;
  }

  .rx-um-form-grid {
    grid-template-columns: 1fr;
  }

  .rx-um-modal {
    border-radius: 15px;
  }

  .rx-um-modal-actions {
    flex-direction: column-reverse;
  }

  .rx-um-cancel,
  .rx-um-submit {
    width: 100%;
    justify-content: center;
  }
}
`;

export default UserManagement;