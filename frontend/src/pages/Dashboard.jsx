import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  getCurrentUser,
  getUserComplaints,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================================
  // LOAD REAL COMPLAINTS
  // ========================================================

  const loadDashboard = async () => {
    if (!currentUser?.userId) {
      setError(
        "Unable to identify the logged-in user. Please sign in again."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getUserComplaints(
        currentUser.userId
      );

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [currentUser?.userId]);

  // ========================================================
  // DASHBOARD STATISTICS
  // ========================================================

  const stats = useMemo(() => {
    const total = complaints.length;

    const open = complaints.filter(
      (complaint) =>
        complaint.status === "OPEN" ||
        complaint.status === "ASSIGNED"
    ).length;

    const inProgress = complaints.filter(
      (complaint) =>
        complaint.status === "IN_PROGRESS"
    ).length;

    const resolved = complaints.filter(
      (complaint) =>
        complaint.status === "RESOLVED" ||
        complaint.status === "CLOSED"
    ).length;

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }, [complaints]);

  // ========================================================
  // RECENT COMPLAINTS
  // ========================================================

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [complaints]);

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <>
      <style>{`
        .rx-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 34px 28px 50px;
        }

        .rx-dashboard-header {
          margin-bottom: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .rx-dashboard-kicker {
          display: block;
          margin-bottom: 7px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .rx-dashboard-header h1 {
          margin: 0;
          color: var(--heading);
          font-family: "Manrope", sans-serif;
          font-size: 36px;
          letter-spacing: -1.4px;
        }

        .rx-dashboard-header p {
          margin: 9px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .rx-dashboard-actions {
          display: flex;
          gap: 10px;
        }

        .rx-dashboard-btn {
          min-height: 44px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .rx-dashboard-btn.secondary {
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
        }

        .rx-dashboard-btn.primary {
          border: none;
          background: var(--accent);
          color: white;
        }

        .rx-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .rx-stat-card {
          padding: 20px;
          border: 1px solid var(--border);
          border-radius: 13px;
          background: var(--surface);
          box-shadow: var(--shadow-small);
        }

        .rx-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: var(--accent-soft);
          color: var(--accent);
        }

        .rx-stat-card strong {
          display: block;
          margin-top: 16px;
          color: var(--heading);
          font-size: 27px;
        }

        .rx-stat-card span {
          display: block;
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
        }

        .rx-dashboard-section {
          margin-top: 22px;
          padding: 22px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
        }

        .rx-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .rx-section-head h2 {
          margin: 0;
          color: var(--heading);
          font-size: 16px;
        }

        .rx-section-head button {
          padding: 0;
          border: none;
          background: transparent;
          color: var(--accent);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .rx-dashboard-list {
          display: grid;
        }

        .rx-dashboard-item {
          padding: 15px 0;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            130px
            110px
            100px;
          gap: 15px;
          align-items: center;
          border-top: 1px solid var(--border);
          cursor: pointer;
        }

        .rx-dashboard-item:first-child {
          border-top: none;
        }

        .rx-dashboard-item:hover h3 {
          color: var(--accent);
        }

        .rx-dashboard-code {
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .rx-dashboard-item h3 {
          margin: 5px 0 4px;
          color: var(--heading);
          font-size: 13px;
          transition: 0.2s;
        }

        .rx-dashboard-item p {
          margin: 0;
          color: var(--muted);
          font-size: 10px;
        }

        .rx-dashboard-category,
        .rx-dashboard-date {
          color: var(--muted);
          font-size: 10px;
        }

        .rx-dashboard-status {
          width: fit-content;
          padding: 6px 9px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
        }

        .rx-dashboard-empty,
        .rx-dashboard-loading,
        .rx-dashboard-error {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .rx-dashboard-empty svg,
        .rx-dashboard-loading svg {
          color: var(--accent);
        }

        .rx-dashboard-error svg {
          color: #b42318;
        }

        .rx-dashboard-empty h3,
        .rx-dashboard-error h3 {
          margin: 14px 0 6px;
          color: var(--heading);
        }

        .rx-dashboard-empty p,
        .rx-dashboard-error p,
        .rx-dashboard-loading p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .rx-dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .rx-dashboard-item {
            grid-template-columns: 1fr 100px;
          }

          .rx-dashboard-category,
          .rx-dashboard-date {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .rx-dashboard {
            padding: 25px 16px 40px;
          }

          .rx-dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .rx-dashboard-actions {
            width: 100%;
          }

          .rx-dashboard-btn {
            flex: 1;
          }

          .rx-dashboard-stats {
            grid-template-columns: 1fr 1fr;
          }

          .rx-dashboard-header h1 {
            font-size: 30px;
          }

          .rx-dashboard-item {
            grid-template-columns: 1fr;
          }

          .rx-dashboard-status {
            margin-top: 5px;
          }
        }
      `}</style>

      <div className="rx-dashboard">

        <div className="rx-dashboard-header">
          <div>
            <span className="rx-dashboard-kicker">
              SANJIVANI RESOLVEX
            </span>

            <h1>
              Welcome,{" "}
              {currentUser?.name || "User"}
            </h1>

            <p>
              Track your complaints and campus
              service requests from one dashboard.
            </p>
          </div>

          <div className="rx-dashboard-actions">
            <button
              type="button"
              className="rx-dashboard-btn secondary"
              onClick={loadDashboard}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              type="button"
              className="rx-dashboard-btn primary"
              onClick={() =>
                navigate("/complaints/new")
              }
            >
              <Plus size={16} />
              New Complaint
            </button>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="rx-dashboard-stats">

          <StatCard
            icon={<FileText size={20} />}
            value={stats.total}
            label="Total Complaints"
          />

          <StatCard
            icon={<AlertCircle size={20} />}
            value={stats.open}
            label="Open Complaints"
          />

          <StatCard
            icon={<Clock3 size={20} />}
            value={stats.inProgress}
            label="In Progress"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            value={stats.resolved}
            label="Resolved"
          />

        </div>

        {/* RECENT COMPLAINTS */}

        <div className="rx-dashboard-section">

          <div className="rx-section-head">
            <h2>
              Recent Complaints
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate("/complaints")
              }
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="rx-dashboard-loading">
              <RefreshCw size={32} />
              <p>
                Loading dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="rx-dashboard-error">
              <AlertCircle size={36} />

              <h3>
                Unable to load dashboard
              </h3>

              <p>{error}</p>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="rx-dashboard-empty">
              <FileText size={38} />

              <h3>
                No complaints yet
              </h3>

              <p>
                Create your first complaint to
                start tracking it here.
              </p>
            </div>
          ) : (
            <div className="rx-dashboard-list">

              {recentComplaints.map(
                (complaint) => (
                  <div
                    key={complaint.id}
                    className="rx-dashboard-item"
                    onClick={() =>
                      navigate(
                        `/complaints/${complaint.id}`
                      )
                    }
                  >
                    <div>
                      <span className="rx-dashboard-code">
                        {
                          complaint.complaintCode
                        }
                      </span>

                      <h3>
                        {complaint.title}
                      </h3>

                      <p>
                        {complaint.location}
                      </p>
                    </div>

                    <span className="rx-dashboard-category">
                      {complaint.category}
                    </span>

                    <span className="rx-dashboard-status">
                      {formatStatus(
                        complaint.status
                      )}
                    </span>

                    <span className="rx-dashboard-date">
                      {formatDate(
                        complaint.createdAt
                      )}
                    </span>
                  </div>
                )
              )}

            </div>
          )}
        </div>

      </div>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <div className="rx-stat-card">

      <div className="rx-stat-icon">
        {icon}
      </div>

      <strong>{value}</strong>

      <span>{label}</span>

    </div>
  );
}

export default Dashboard;