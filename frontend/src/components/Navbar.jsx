import {
  Bell,
  ChevronRight,
  Menu,
  RefreshCw,
  UserCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import * as apiService from "../services/api";

// ==========================================================
// NAVBAR
// ==========================================================

const Navbar = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const currentUser =
    apiService.getCurrentUser?.();

  const userId =
    currentUser?.userId ??
    currentUser?.id ??
    null;

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() ||
    "STUDENT";

  // ========================================================
  // STATE
  // ========================================================

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loadingCount,
    setLoadingCount,
  ] = useState(false);

  // ========================================================
  // API INSTANCE
  // ========================================================

  const api =
    apiService.default;

  // ========================================================
  // PAGE DETAILS
  // ========================================================

  const pageDetails =
    useMemo(() => {
      const path =
        location.pathname;

      if (
        path === "/admin"
      ) {
        return {
          title:
            "Admin Dashboard",
          section:
            "Administration",
        };
      }

      if (
        path === "/admin/users"
      ) {
        return {
          title:
            "User Management",
          section:
            "Administration",
        };
      }

      if (
        path ===
        "/admin/categories"
      ) {
        return {
          title:
            "Category Management",
          section:
            "Administration",
        };
      }

      if (
        path ===
        "/admin/reports"
      ) {
        return {
          title:
            "Reports & Analytics",
          section:
            "Administration",
        };
      }

      if (
        path ===
        "/staff/complaints"
      ) {
        return {
          title:
            "Complaint Management",
          section:
            "Administration",
        };
      }

      if (
        path ===
        "/staff/assigned"
      ) {
        return {
          title:
            "My Assigned Complaints",
          section:
            "Service Workspace",
        };
      }

      if (
        path ===
        "/complaints/new"
      ) {
        return {
          title:
            "New Complaint",
          section:
            "Student Workspace",
        };
      }

      if (
        path ===
        "/complaints"
      ) {
        return {
          title:
            "My Complaints",
          section:
            "Student Workspace",
        };
      }

      if (
        path.startsWith(
          "/complaints/"
        )
      ) {
        return {
          title:
            "Complaint Details",
          section:
            "Complaint",
        };
      }

      if (
        path ===
        "/notifications"
      ) {
        return {
          title:
            "Notifications",
          section:
            "Updates",
        };
      }

      if (
        path ===
        "/profile"
      ) {
        return {
          title:
            "My Profile",
          section:
            "Account",
        };
      }

      if (
        path ===
        "/dashboard"
      ) {
        if (
          role === "STAFF" ||
          role === "FACULTY"
        ) {
          return {
            title:
              "Service Dashboard",
            section:
              "Service Workspace",
          };
        }

        return {
          title:
            "Dashboard",
          section:
            "Student Workspace",
        };
      }

      return {
        title: "ResolveX",
        section:
          "Sanjivani University",
      };
    }, [
      location.pathname,
      role,
    ]);

  // ========================================================
  // NORMALIZE UNREAD COUNT RESPONSE
  // ========================================================

  const normalizeCount = (
    response
  ) => {
    if (
      typeof response ===
      "number"
    ) {
      return response;
    }

    if (
      typeof response?.data ===
      "number"
    ) {
      return response.data;
    }

    if (
      typeof response?.count ===
      "number"
    ) {
      return response.count;
    }

    if (
      typeof response
        ?.unreadCount ===
      "number"
    ) {
      return response
        .unreadCount;
    }

    if (
      typeof response?.data
        ?.count ===
      "number"
    ) {
      return response
        .data.count;
    }

    if (
      typeof response?.data
        ?.unreadCount ===
      "number"
    ) {
      return response
        .data.unreadCount;
    }

    return 0;
  };

  // ========================================================
  // LOAD UNREAD COUNT
  // ========================================================

  const loadUnreadCount =
    useCallback(
      async (
        showLoader = false
      ) => {
        if (!userId) {
          setUnreadCount(0);
          return;
        }

        try {
          if (showLoader) {
            setLoadingCount(
              true
            );
          }

          let response;

          // -----------------------------------------------
          // SUPPORT DIFFERENT api.js FUNCTION NAMES
          // -----------------------------------------------

          if (
            typeof apiService
              .getUnreadNotificationCount ===
            "function"
          ) {
            response =
              await apiService
                .getUnreadNotificationCount(
                  userId
                );
          } else if (
            typeof apiService
              .getUnreadCount ===
            "function"
          ) {
            response =
              await apiService
                .getUnreadCount(
                  userId
                );
          } else if (
            typeof apiService
              .getNotificationUnreadCount ===
            "function"
          ) {
            response =
              await apiService
                .getNotificationUnreadCount(
                  userId
                );
          } else {
            response =
              await api.get(
                `/notifications/user/${userId}/unread/count`
              );
          }

          const count =
            normalizeCount(
              response
            );

          setUnreadCount(
            Math.max(
              0,
              Number(count) ||
                0
            )
          );
        } catch (err) {
          // Navbar should not break if notification count fails.
          console.error(
            "Unable to load unread notification count:",
            err
          );
        } finally {
          if (showLoader) {
            setLoadingCount(
              false
            );
          }
        }
      },
      [
        api,
        userId,
      ]
    );

  // ========================================================
  // LOAD ON PAGE CHANGE
  // ========================================================

  useEffect(() => {
    loadUnreadCount();
  }, [
    loadUnreadCount,
    location.pathname,
  ]);

  // ========================================================
  // AUTO REFRESH EVERY 30 SECONDS
  // ========================================================

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const interval =
      window.setInterval(
        () => {
          loadUnreadCount();
        },
        30000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    userId,
    loadUnreadCount,
  ]);

  // ========================================================
  // REFRESH WHEN USER RETURNS TO TAB
  // ========================================================

  useEffect(() => {
    const handleFocus =
      () => {
        loadUnreadCount();
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    loadUnreadCount,
  ]);

  // ========================================================
  // ROLE NAME
  // ========================================================

  const formatRole = (
    value
  ) => {
    if (
      value === "ADMIN"
    ) {
      return "Administrator";
    }

    if (
      value === "STAFF"
    ) {
      return "Service Staff";
    }

    if (
      value === "FACULTY"
    ) {
      return "Faculty";
    }

    return "Student";
  };

  // ========================================================
  // USER INITIALS
  // ========================================================

  const initials =
    useMemo(() => {
      const name =
        currentUser?.name
          ?.trim();

      if (!name) {
        return "U";
      }

      const parts =
        name
          .split(/\s+/)
          .filter(Boolean);

      if (
        parts.length === 1
      ) {
        return parts[0]
          .charAt(0)
          .toUpperCase();
      }

      return (
        parts[0]
          .charAt(0) +
        parts[
          parts.length - 1
        ].charAt(0)
      ).toUpperCase();
    }, [
      currentUser?.name,
    ]);

  // ========================================================
  // OPEN NOTIFICATIONS
  // ========================================================

  const handleNotificationClick =
    () => {
      navigate(
        "/notifications"
      );
    };

  // ========================================================
  // OPEN PROFILE
  // ========================================================

  const handleProfileClick =
    () => {
      navigate(
        "/profile"
      );
    };

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>
      <header className="rx-navbar">

        {/* =================================================
            LEFT
        ================================================== */}

        <div className="rx-navbar-left">

          <button
            type="button"
            className="rx-navbar-mobile-menu"
            aria-label="Open navigation"
          >
            <Menu
              size={20}
            />
          </button>

          <div className="rx-navbar-page">

            <div className="rx-navbar-breadcrumb">

              <span>
                {
                  pageDetails.section
                }
              </span>

              <ChevronRight
                size={12}
              />

              <strong>
                {
                  pageDetails.title
                }
              </strong>

            </div>

            <h2>
              {
                pageDetails.title
              }
            </h2>

          </div>

        </div>

        {/* =================================================
            RIGHT
        ================================================== */}

        <div className="rx-navbar-right">

          {/* NOTIFICATION */}

          <div className="rx-navbar-notification-wrap">

            <button
              type="button"
              className={
                unreadCount > 0
                  ? "rx-navbar-bell has-unread"
                  : "rx-navbar-bell"
              }
              title={
                unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount >
                      1
                        ? "s"
                        : ""
                    }`
                  : "Notifications"
              }
              onClick={
                handleNotificationClick
              }
            >

              {loadingCount ? (
                <RefreshCw
                  size={19}
                  className="rx-navbar-spin"
                />
              ) : (
                <Bell
                  size={19}
                />
              )}

              {unreadCount > 0 && (
                <span className="rx-navbar-badge">

                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}

                </span>
              )}

            </button>

          </div>

          {/* DIVIDER */}

          <div className="rx-navbar-divider" />

          {/* PROFILE */}

          <button
            type="button"
            className="rx-navbar-profile"
            onClick={
              handleProfileClick
            }
          >

            <div className="rx-navbar-avatar">

              {initials}

            </div>

            <div className="rx-navbar-user-info">

              <strong>
                {currentUser?.name ||
                  "ResolveX User"}
              </strong>

              <span>
                {formatRole(
                  role
                )}
              </span>

            </div>

            <UserCircle
              size={17}
              className="rx-navbar-user-icon"
            />

          </button>

        </div>

      </header>

      <style>
        {styles}
      </style>
    </>
  );
};

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-navbar {
  position: sticky;
  top: 0;

  z-index: 900;

  width: 100%;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-sizing: border-box;

  padding: 0 27px;

  border-bottom:
    1px solid #e5ebe8;

  background:
    rgba(255,255,255,.94);

  backdrop-filter:
    blur(14px);

  color: #17251e;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  box-shadow:
    0 3px 16px
    rgba(20,50,37,.035);
}

/* ==========================================================
   LEFT
========================================================== */

.rx-navbar-left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 12px;
}

.rx-navbar-mobile-menu {
  display: none;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border: 1px solid #e0e8e4;
  border-radius: 9px;

  background: #ffffff;

  color: #536159;

  cursor: pointer;
}

.rx-navbar-page {
  min-width: 0;
}

.rx-navbar-breadcrumb {
  display: flex;
  align-items: center;

  gap: 3px;

  margin-bottom: 3px;

  color: #9ba49f;

  font-size: 7px;
  font-weight: 700;

  letter-spacing: .25px;

  text-transform: uppercase;
}

.rx-navbar-breadcrumb strong {
  overflow: hidden;

  max-width: 260px;

  color: #16865d;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-navbar-page h2 {
  margin: 0;

  overflow: hidden;

  max-width: 420px;

  color: #2d3a33;

  font-size: 16px;
  font-weight: 800;

  letter-spacing: -.25px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==========================================================
   RIGHT
========================================================== */

.rx-navbar-right {
  display: flex;
  align-items: center;

  gap: 11px;
}

/* ==========================================================
   NOTIFICATION BELL
========================================================== */

.rx-navbar-notification-wrap {
  position: relative;
}

.rx-navbar-bell {
  position: relative;

  width: 41px;
  height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #e1e8e4;
  border-radius: 11px;

  background: #ffffff;

  color: #66736c;

  cursor: pointer;

  transition:
    background .2s ease,
    color .2s ease,
    border-color .2s ease,
    transform .2s ease;
}

.rx-navbar-bell:hover {
  border-color: #cfe1d8;

  background: #f3faf6;

  color: #16865d;

  transform:
    translateY(-1px);
}

.rx-navbar-bell.has-unread {
  border-color:
    rgba(22,134,93,.22);

  background: #f0faf5;

  color: #16865d;
}

.rx-navbar-badge {
  position: absolute;

  top: -6px;
  right: -7px;

  min-width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  padding: 0 4px;

  border: 2px solid #ffffff;
  border-radius: 999px;

  background: #e34f4f;

  color: #ffffff;

  font-size: 7px;
  font-weight: 900;

  line-height: 1;

  box-shadow:
    0 3px 8px
    rgba(211,62,62,.25);
}

/* ==========================================================
   DIVIDER
========================================================== */

.rx-navbar-divider {
  width: 1px;
  height: 30px;

  background: #e5ebe8;
}

/* ==========================================================
   PROFILE
========================================================== */

.rx-navbar-profile {
  display: flex;
  align-items: center;

  gap: 9px;

  min-width: 0;

  padding: 5px 7px;

  border: 0;
  border-radius: 11px;

  background: transparent;

  text-align: left;

  cursor: pointer;

  transition:
    background .2s ease;
}

.rx-navbar-profile:hover {
  background: #f5f8f6;
}

.rx-navbar-avatar {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #cce6d9;
  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #e6f8ee,
      #d9f2e5
    );

  color: #16865d;

  font-size: 10px;
  font-weight: 900;

  letter-spacing: .3px;
}

.rx-navbar-user-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.rx-navbar-user-info strong {
  overflow: hidden;

  max-width: 150px;

  color: #344139;

  font-size: 10px;
  font-weight: 800;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-navbar-user-info span {
  margin-top: 2px;

  color: #8b9590;

  font-size: 7px;
}

.rx-navbar-user-icon {
  color: #a0aaa5;
}

/* ==========================================================
   SPINNER
========================================================== */

.rx-navbar-spin {
  animation:
    rxNavbarSpin
    .8s
    linear
    infinite;
}

@keyframes rxNavbarSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media(max-width:900px) {
  .rx-navbar {
    padding:
      0
      16px;
  }

  .rx-navbar-mobile-menu {
    display: flex;
  }

  .rx-navbar-user-info {
    display: none;
  }

  .rx-navbar-user-icon {
    display: none;
  }
}

@media(max-width:600px) {
  .rx-navbar {
    height: 62px;
  }

  .rx-navbar-breadcrumb {
    display: none;
  }

  .rx-navbar-page h2 {
    max-width: 180px;

    font-size: 14px;
  }

  .rx-navbar-divider {
    display: none;
  }

  .rx-navbar-avatar {
    display: none;
  }

  .rx-navbar-profile {
    padding: 0;
  }

  .rx-navbar-right {
    gap: 7px;
  }
}
`;

export default Navbar;