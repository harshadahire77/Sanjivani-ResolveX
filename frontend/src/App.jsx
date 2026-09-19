import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  AnimatePresence,
} from "framer-motion";

import "./App.css";

// ==========================================================
// COMPONENTS
// ==========================================================

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";

// ==========================================================
// PUBLIC PAGES
// ==========================================================

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================================
// STUDENT / COMMON PAGES
// ==========================================================

import Dashboard from "./pages/Dashboard";
import CreateComplaint from "./pages/CreateComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

// ==========================================================
// STAFF / FACULTY PAGES
// ==========================================================

import StaffDashboard from "./pages/StaffDashboard";
import MyAssignedComplaints from "./pages/MyAssignedComplaints";

// ==========================================================
// ADMIN PAGES
// ==========================================================

import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import StaffComplaints from "./pages/StaffComplaints";
import CategoryManagement from "./pages/CategoryManagement";
import ReportsAnalytics from "./pages/ReportsAnalytics";

// ==========================================================
// AUTH
// ==========================================================

import {
  getCurrentUser,
  isLoggedIn,
} from "./services/api";

// ==========================================================
// GET CURRENT ROLE
// ==========================================================

const getRole = () => {
  const user =
    getCurrentUser();

  return (
    user?.role
      ?.trim()
      ?.toUpperCase() || ""
  );
};

// ==========================================================
// PROTECTED ROUTE
// ==========================================================

const ProtectedRoute = ({
  children,
}) => {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

// ==========================================================
// STUDENT ROUTE
// ==========================================================

const StudentRoute = ({
  children,
}) => {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role =
    getRole();

  if (
    role === "STUDENT"
  ) {
    return children;
  }

  if (
    role === "ADMIN"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
};

// ==========================================================
// STAFF / FACULTY ROUTE
// ==========================================================

const StaffFacultyRoute = ({
  children,
}) => {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role =
    getRole();

  if (
    role === "STAFF" ||
    role === "FACULTY"
  ) {
    return children;
  }

  if (
    role === "ADMIN"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
};

// ==========================================================
// ADMIN ROUTE
// ==========================================================

const AdminRoute = ({
  children,
}) => {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role =
    getRole();

  if (
    role !== "ADMIN"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

// ==========================================================
// ROLE-BASED DASHBOARD
// ==========================================================

const DashboardRouter = () => {
  const role =
    getRole();

  if (
    role === "ADMIN"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  if (
    role === "STAFF" ||
    role === "FACULTY"
  ) {
    return (
      <StaffDashboard />
    );
  }

  return (
    <Dashboard />
  );
};

// ==========================================================
// DASHBOARD LAYOUT
// ==========================================================

const DashboardLayout = ({
  children,
}) => {
  const location =
    useLocation();

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN AREA */}

      <div className="app-content">

        {/* NAVBAR */}

        <Navbar />

        {/* PAGE CONTENT */}

        <main className="dashboard-main">

          <AnimatePresence
            mode="wait"
            initial={false}
          >

            <PageTransition
              key={
                location.pathname
              }
            >
              {children}
            </PageTransition>

          </AnimatePresence>

        </main>

      </div>

    </div>
  );
};

// ==========================================================
// APP
// ==========================================================

function App() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC
      ================================================== */}

      <Route
        path="/"
        element={
          <LandingPage />
        }
      />

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />

      {/* ==================================================
          DASHBOARD
      ================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>

            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>

          </ProtectedRoute>
        }
      />

      {/* ==================================================
          STUDENT - NEW COMPLAINT
      ================================================== */}

      <Route
        path="/complaints/new"
        element={
          <StudentRoute>

            <DashboardLayout>
              <CreateComplaint />
            </DashboardLayout>

          </StudentRoute>
        }
      />

      {/* ==================================================
          STUDENT - MY COMPLAINTS
      ================================================== */}

      <Route
        path="/complaints"
        element={
          <StudentRoute>

            <DashboardLayout>
              <MyComplaints />
            </DashboardLayout>

          </StudentRoute>
        }
      />

      {/* ==================================================
          COMPLAINT DETAILS
      ================================================== */}

      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>

            <DashboardLayout>
              <ComplaintDetails />
            </DashboardLayout>

          </ProtectedRoute>
        }
      />

      {/* ==================================================
          STAFF / FACULTY - ASSIGNED
      ================================================== */}

      <Route
        path="/staff/assigned"
        element={
          <StaffFacultyRoute>

            <DashboardLayout>
              <MyAssignedComplaints />
            </DashboardLayout>

          </StaffFacultyRoute>
        }
      />

      {/* ==================================================
          ADMIN - COMPLAINT MANAGEMENT
      ================================================== */}

      <Route
        path="/staff/complaints"
        element={
          <AdminRoute>

            <DashboardLayout>
              <StaffComplaints />
            </DashboardLayout>

          </AdminRoute>
        }
      />

      {/* ==================================================
          ADMIN DASHBOARD
      ================================================== */}

      <Route
        path="/admin"
        element={
          <AdminRoute>

            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>

          </AdminRoute>
        }
      />

      {/* ==================================================
          ADMIN - USERS
      ================================================== */}

      <Route
        path="/admin/users"
        element={
          <AdminRoute>

            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>

          </AdminRoute>
        }
      />

      {/* ==================================================
          ADMIN - CATEGORIES
      ================================================== */}

      <Route
        path="/admin/categories"
        element={
          <AdminRoute>

            <DashboardLayout>
              <CategoryManagement />
            </DashboardLayout>

          </AdminRoute>
        }
      />

      {/* ==================================================
          ADMIN - REPORTS
      ================================================== */}

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>

            <DashboardLayout>
              <ReportsAnalytics />
            </DashboardLayout>

          </AdminRoute>
        }
      />

      {/* ==================================================
          NOTIFICATIONS
      ================================================== */}

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>

            <DashboardLayout>
              <Notifications />
            </DashboardLayout>

          </ProtectedRoute>
        }
      />

      {/* ==================================================
          PROFILE
      ================================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>

            <DashboardLayout>
              <Profile />
            </DashboardLayout>

          </ProtectedRoute>
        }
      />

      {/* ==================================================
          FALLBACK
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;