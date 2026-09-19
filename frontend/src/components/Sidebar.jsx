import {
  BarChart3,
  Bell,
  ClipboardCheck,
  ClipboardList,
  Layers3,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
  logoutUser,
} from "../services/api";

import logo from "../assets/resolvex-mark.png";

// ==========================================================
// SIDEBAR
// ==========================================================

const Sidebar = () => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() ||
    "STUDENT";

  // ========================================================
  // STUDENT MENU
  // ========================================================

  const studentMenu = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Complaint",
      path: "/complaints/new",
      icon: PlusCircle,
    },
    {
      label: "My Complaints",
      path: "/complaints",
      icon: ClipboardList,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  // ========================================================
  // STAFF / FACULTY MENU
  // ========================================================

  const staffMenu = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Assigned",
      path: "/staff/assigned",
      icon: ClipboardCheck,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  // ========================================================
  // ADMIN MENU
  // ========================================================

  const adminMenu = [
    {
      label: "Admin Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Complaint Management",
      path: "/staff/complaints",
      icon: Wrench,
    },
    {
      label: "Category Management",
      path: "/admin/categories",
      icon: Layers3,
    },
    {
      label: "Reports & Analytics",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  // ========================================================
  // SELECT MENU
  // ========================================================

  let menuItems =
    studentMenu;

  if (
    role === "STAFF" ||
    role === "FACULTY"
  ) {
    menuItems =
      staffMenu;
  }

  if (
    role === "ADMIN"
  ) {
    menuItems =
      adminMenu;
  }

  // ========================================================
  // ACTIVE ITEM
  // ========================================================

  const isActive = (
    path
  ) => {
    if (
      path === "/dashboard"
    ) {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    if (
      path === "/admin"
    ) {
      return (
        location.pathname ===
        "/admin"
      );
    }

    if (
      path === "/complaints"
    ) {
      return (
        location.pathname ===
        "/complaints"
      );
    }

    return (
      location.pathname ===
        path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  // ========================================================
  // LOGO CLICK
  // ========================================================

  const handleLogoClick =
    () => {
      if (
        role === "ADMIN"
      ) {
        navigate(
          "/admin"
        );

        return;
      }

      navigate(
        "/dashboard"
      );
    };

  // ========================================================
  // LOGOUT
  // ========================================================

  const handleLogout =
    () => {
      logoutUser();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  // ========================================================
  // ROLE LABEL
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
  // PAGE
  // ========================================================

  return (
    <>
      <aside className="rx-sidebar">

        {/* =================================================
            BRAND
        ================================================== */}

        <div
          className="rx-sidebar-brand"
          onClick={
            handleLogoClick
          }
        >

          <div className="rx-sidebar-logo">

            <img
              src={logo}
              alt="ResolveX"
            />

          </div>

          <div className="rx-sidebar-brand-text">

            <strong>
              ResolveX
            </strong>

            <span>
              Sanjivani University
            </span>

          </div>

        </div>

        {/* =================================================
            LABEL
        ================================================== */}

        <div className="rx-sidebar-section-label">
          WORKSPACE
        </div>

        {/* =================================================
            MENU
        ================================================== */}

        <nav className="rx-sidebar-nav">

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.path
                );

              return (
                <button
                  type="button"
                  key={
                    item.path
                  }
                  className={
                    active
                      ? "rx-sidebar-item active"
                      : "rx-sidebar-item"
                  }
                  onClick={() =>
                    navigate(
                      item.path
                    )
                  }
                >

                  <span className="rx-sidebar-item-icon">

                    <Icon
                      size={19}
                      strokeWidth={2}
                    />

                  </span>

                  <span>
                    {item.label}
                  </span>

                </button>
              );
            }
          )}

        </nav>

        {/* =================================================
            USER
        ================================================== */}

        <div className="rx-sidebar-bottom">

          <div className="rx-sidebar-user">

            <div className="rx-sidebar-avatar">

              {currentUser?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}

            </div>

            <div className="rx-sidebar-user-details">

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

          </div>

          <button
            type="button"
            className="rx-sidebar-logout"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      <style>{styles}</style>
    </>
  );
};

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  width: 255px;
  height: 100vh;

  display: flex;
  flex-direction: column;

  box-sizing: border-box;

  background:
    linear-gradient(
      180deg,
      #0d231a 0%,
      #102b20 52%,
      #0b1e17 100%
    );

  border-right:
    1px solid
    rgba(255,255,255,.06);

  color: #ffffff;

  box-shadow:
    10px 0 35px
    rgba(0,0,0,.08);
}

/* ==========================================================
   BRAND
========================================================== */

.rx-sidebar-brand {
  min-height: 82px;

  display: flex;
  align-items: center;

  gap: 11px;

  padding: 0 19px;

  border-bottom:
    1px solid
    rgba(255,255,255,.07);

  cursor: pointer;
}

.rx-sidebar-logo {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  background:
    rgba(255,255,255,.08);
}

.rx-sidebar-logo img {
  width: 31px;
  height: 31px;

  object-fit: contain;
}

.rx-sidebar-brand-text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.rx-sidebar-brand-text strong {
  color: #ffffff;

  font-size: 18px;
  font-weight: 800;

  letter-spacing: -.3px;
}

.rx-sidebar-brand-text span {
  margin-top: 2px;

  overflow: hidden;

  color:
    rgba(255,255,255,.52);

  font-size: 9px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==========================================================
   MENU
========================================================== */

.rx-sidebar-section-label {
  padding:
    23px
    21px
    8px;

  color:
    rgba(255,255,255,.35);

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.3px;
}

.rx-sidebar-nav {
  display: flex;
  flex-direction: column;

  gap: 5px;

  padding: 0 12px;
}

.rx-sidebar-item {
  width: 100%;
  min-height: 45px;

  display: flex;
  align-items: center;

  gap: 11px;

  padding: 0 13px;

  border:
    1px solid transparent;

  border-radius: 11px;

  background: transparent;

  color:
    rgba(255,255,255,.68);

  text-align: left;

  font-size: 12px;
  font-weight: 650;

  cursor: pointer;

  transition:
    .2s ease;
}

.rx-sidebar-item:hover {
  background:
    rgba(255,255,255,.06);

  color: #ffffff;

  transform:
    translateX(2px);
}

.rx-sidebar-item.active {
  border-color:
    rgba(66,214,155,.12);

  background:
    linear-gradient(
      90deg,
      rgba(28,171,115,.23),
      rgba(28,171,115,.08)
    );

  color: #75e3b8;
}

.rx-sidebar-item-icon {
  width: 25px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;
}

/* ==========================================================
   USER / LOGOUT
========================================================== */

.rx-sidebar-bottom {
  margin-top: auto;

  padding:
    15px
    13px
    17px;

  border-top:
    1px solid
    rgba(255,255,255,.07);
}

.rx-sidebar-user {
  display: flex;
  align-items: center;

  gap: 10px;

  padding:
    10px
    8px
    14px;
}

.rx-sidebar-avatar {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border:
    1px solid
    rgba(108,226,179,.25);

  border-radius: 10px;

  background:
    rgba(31,173,116,.18);

  color: #78e6bb;

  font-size: 14px;
  font-weight: 800;
}

.rx-sidebar-user-details {
  min-width: 0;

  display: flex;
  flex: 1;
  flex-direction: column;
}

.rx-sidebar-user-details strong {
  overflow: hidden;

  color: #ffffff;

  font-size: 11px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-sidebar-user-details span {
  margin-top: 2px;

  color:
    rgba(255,255,255,.43);

  font-size: 9px;
}

.rx-sidebar-logout {
  width: 100%;
  min-height: 41px;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 0 12px;

  border: 0;

  border-radius: 10px;

  background: transparent;

  color:
    rgba(255,255,255,.54);

  font-size: 11px;
  font-weight: 650;

  cursor: pointer;

  transition:
    .2s ease;
}

.rx-sidebar-logout:hover {
  background:
    rgba(239,68,68,.1);

  color: #ff8e8e;
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media(max-width:900px) {
  .rx-sidebar {
    display: none;
  }
}
`;

export default Sidebar;