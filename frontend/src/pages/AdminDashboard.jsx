import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserRound,
  Users,
  UserX,
  Wrench,
  Flame,
  TrendingUp,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import {
  getAdminStats,
  getAdminAnalytics,
  getApiErrorMessage,
} from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [statsData, analyticsData] =
          await Promise.all([
            getAdminStats(),
            getAdminAnalytics(),
          ]);

        setStats(statsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(
          getApiErrorMessage
            ? getApiErrorMessage(err)
            : "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <div className="rx-ad-loading">
          <div className="rx-ad-spinner" />
          <p>Loading admin dashboard...</p>
        </div>

        <style>{styles}</style>
      </>
    );
  }

  const data = stats || {};
  const analysis = analytics || {};

  const priorities =
    analysis.priority || {};

  const recentComplaints =
    Array.isArray(
      analysis.recentComplaints
    )
      ? analysis.recentComplaints
      : [];

  const resolutionRate =
    Number(
      analysis.resolutionRate || 0
    );

  const activeWorkload =
    Number(
      analysis.activeWorkload || 0
    );

  // =========================================================
  // USER CARDS
  // =========================================================

  const userCards = [
    {
      title: "Total Users",
      value: data.totalUsers || 0,
      icon: Users,
      type: "green",
    },
    {
      title: "Active Users",
      value: data.activeUsers || 0,
      icon: UserCheck,
      type: "blue",
    },
    {
      title: "Inactive Users",
      value: data.inactiveUsers || 0,
      icon: UserX,
      type: "red",
    },
    {
      title: "Students",
      value: data.students || 0,
      icon: UserRound,
      type: "purple",
    },
  ];

  return (
    <>
      <div className="rx-ad-page">

        {/* HEADER */}

        <div className="rx-ad-header">

          <div>
            <div className="rx-ad-eyebrow">
              <ShieldCheck size={16} />
              ADMIN CONTROL CENTER
            </div>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Monitor ResolveX users,
              complaints and campus
              service operations.
            </p>
          </div>

          <button
            type="button"
            className="rx-ad-refresh"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "rx-ad-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="rx-ad-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* USER OVERVIEW */}

        <section className="rx-ad-section">

          <div className="rx-ad-title">
            <div>
              <h2>User Overview</h2>
              <p>
                Registered ResolveX accounts
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              Manage Users
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="rx-ad-grid">

            {userCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="rx-ad-card"
                  key={item.title}
                >

                  <div
                    className={`rx-ad-card-icon ${item.type}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <span>
                      {item.title}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* ANALYTICS */}

        <div className="rx-ad-analytics">

          <div className="rx-ad-analytics-card">

            <div className="rx-ad-analytics-icon green">
              <TrendingUp size={23} />
            </div>

            <div>
              <span>
                Resolution Rate
              </span>

              <strong>
                {resolutionRate.toFixed(1)}%
              </strong>

              <small>
                Resolved + closed complaints
              </small>
            </div>

          </div>

          <div className="rx-ad-analytics-card">

            <div className="rx-ad-analytics-icon orange">
              <Clock3 size={23} />
            </div>

            <div>
              <span>
                Active Workload
              </span>

              <strong>
                {activeWorkload}
              </strong>

              <small>
                Open, assigned and in progress
              </small>
            </div>

          </div>

          <div className="rx-ad-analytics-card">

            <div className="rx-ad-analytics-icon red">
              <Flame size={23} />
            </div>

            <div>
              <span>
                Urgent Complaints
              </span>

              <strong>
                {priorities.urgent || 0}
              </strong>

              <small>
                Immediate attention required
              </small>
            </div>

          </div>

        </div>

        {/* COMPLAINT OVERVIEW */}

        <section className="rx-ad-section">

          <div className="rx-ad-title">

            <div>
              <h2>
                Complaint Overview
              </h2>

              <p>
                Current campus complaint status
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/staff/complaints"
                )
              }
            >
              View Complaints
              <ArrowRight size={15} />
            </button>

          </div>

          <div className="rx-ad-grid">

            <ComplaintCard
              title="Total Complaints"
              value={
                data.totalComplaints || 0
              }
              icon={ClipboardList}
              type="dark"
            />

            <ComplaintCard
              title="Open"
              value={
                data.openComplaints || 0
              }
              icon={AlertCircle}
              type="orange"
            />

            <ComplaintCard
              title="In Progress"
              value={
                data.inProgressComplaints || 0
              }
              icon={Wrench}
              type="blue"
            />

            <ComplaintCard
              title="Resolved"
              value={
                data.resolvedComplaints || 0
              }
              icon={CheckCircle2}
              type="green"
            />

          </div>

        </section>

        {/* PRIORITY ANALYSIS */}

        <section className="rx-ad-panel">

          <div className="rx-ad-panel-header">

            <div>
              <h2>
                Priority Analysis
              </h2>

              <p>
                Complaint distribution by priority
              </p>
            </div>

          </div>

          <div className="rx-ad-priority-grid">

            <PriorityCard
              title="Low"
              value={priorities.low || 0}
              type="low"
            />

            <PriorityCard
              title="Medium"
              value={
                priorities.medium || 0
              }
              type="medium"
            />

            <PriorityCard
              title="High"
              value={priorities.high || 0}
              type="high"
            />

            <PriorityCard
              title="Urgent"
              value={
                priorities.urgent || 0
              }
              type="urgent"
            />

          </div>

        </section>

        {/* RECENT COMPLAINTS */}

        <section className="rx-ad-panel">

          <div className="rx-ad-panel-header">

            <div>
              <h2>
                Recent Complaints
              </h2>

              <p>
                Latest campus complaints
              </p>
            </div>

            <button
              type="button"
              className="rx-ad-link"
              onClick={() =>
                navigate(
                  "/staff/complaints"
                )
              }
            >
              View All
              <ArrowRight size={15} />
            </button>

          </div>

          {recentComplaints.length === 0 ? (

            <div className="rx-ad-empty">

              <ClipboardList size={35} />

              <h3>
                No complaints yet
              </h3>

              <p>
                Recent complaints will
                appear here.
              </p>

            </div>

          ) : (

            <div className="rx-ad-table-wrap">

              <table className="rx-ad-table">

                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentComplaints.map(
                    (complaint) => (
                      <tr
                        key={complaint.id}
                        onClick={() =>
                          navigate(
                            `/complaints/${complaint.id}`
                          )
                        }
                      >

                        <td>

                          <div className="rx-ad-complaint">

                            <strong>
                              {complaint.title}
                            </strong>

                            <span>
                              {complaint.complaintCode}
                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="rx-ad-complaint">

                            <strong>
                              {complaint.userName ||
                                "-"}
                            </strong>

                            <span>
                              {complaint.universityId ||
                                "-"}
                            </span>

                          </div>

                        </td>

                        <td>
                          {complaint.category ||
                            "-"}
                        </td>

                        <td>
                          <PriorityBadge
                            value={
                              complaint.priority
                            }
                          />
                        </td>

                        <td>
                          <StatusBadge
                            value={
                              complaint.status
                            }
                          />
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ROLE DISTRIBUTION */}

        <section className="rx-ad-panel">

          <div className="rx-ad-panel-header">
            <div>
              <h2>
                Role Distribution
              </h2>

              <p>
                Current users by role
              </p>
            </div>
          </div>

          <div className="rx-ad-role-grid">

            <RoleCard
              icon={<UserRound size={20} />}
              label="Students"
              value={data.students || 0}
            />

            <RoleCard
              icon={<Users size={20} />}
              label="Faculty"
              value={data.faculty || 0}
            />

            <RoleCard
              icon={<Wrench size={20} />}
              label="Staff"
              value={data.staff || 0}
            />

            <RoleCard
              icon={<UserCog size={20} />}
              label="Admins"
              value={data.admins || 0}
            />

          </div>

        </section>

      </div>

      <style>{styles}</style>
    </>
  );
};

// ===========================================================
// COMPLAINT CARD
// ===========================================================

const ComplaintCard = ({
  title,
  value,
  icon: Icon,
  type,
}) => {
  return (
    <div className="rx-ad-card">

      <div
        className={`rx-ad-card-icon ${type}`}
      >
        <Icon size={22} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
};

// ===========================================================
// PRIORITY CARD
// ===========================================================

const PriorityCard = ({
  title,
  value,
  type,
}) => {
  return (
    <div
      className={`rx-ad-priority ${type}`}
    >
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
};

// ===========================================================
// ROLE CARD
// ===========================================================

const RoleCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rx-ad-role">

      <div className="rx-ad-role-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
};

// ===========================================================
// PRIORITY BADGE
// ===========================================================

const PriorityBadge = ({
  value,
}) => {
  const priority =
    value?.toLowerCase() || "medium";

  return (
    <span
      className={`rx-ad-badge priority-${priority}`}
    >
      {value || "MEDIUM"}
    </span>
  );
};

// ===========================================================
// STATUS BADGE
// ===========================================================

const StatusBadge = ({
  value,
}) => {
  const status =
    value
      ?.toLowerCase()
      .replace("_", "-") ||
    "open";

  return (
    <span
      className={`rx-ad-badge status-${status}`}
    >
      {value
        ?.replace("_", " ") ||
        "OPEN"}
    </span>
  );
};

// ===========================================================
// CSS
// ===========================================================

const styles = `
.rx-ad-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  background:
    radial-gradient(
      circle at top right,
      rgba(16,185,129,.08),
      transparent 27%
    ),
    #f6f8f7;
  color: #18251f;
  font-family:
    Inter,
    system-ui,
    sans-serif;
}

.rx-ad-header {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 28px;
}

.rx-ad-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  color: #178b61;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.rx-ad-header h1 {
  margin: 0;
  font-size: 36px;
  letter-spacing: -1px;
}

.rx-ad-header p {
  margin: 7px 0 0;
  color: #748078;
}

.rx-ad-refresh {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid #dce5e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-weight: 700;
}

.rx-ad-spin {
  animation: rxSpin .8s linear infinite;
}

@keyframes rxSpin {
  to {
    transform: rotate(360deg);
  }
}

.rx-ad-error {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
  padding: 13px 15px;
  border-radius: 11px;
  background: #fff0f0;
  color: #c84747;
}

.rx-ad-section,
.rx-ad-panel {
  margin-bottom: 27px;
}

.rx-ad-title,
.rx-ad-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rx-ad-title h2,
.rx-ad-panel-header h2 {
  margin: 0;
  font-size: 19px;
}

.rx-ad-title p,
.rx-ad-panel-header p {
  margin: 4px 0 0;
  color: #87918b;
  font-size: 12px;
}

.rx-ad-title button,
.rx-ad-link {
  border: 0;
  background: transparent;
  color: #16865d;
  display: flex;
  gap: 5px;
  align-items: center;
  font-weight: 700;
  cursor: pointer;
}

.rx-ad-grid {
  display: grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap: 15px;
}

.rx-ad-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  min-height: 112px;
  border: 1px solid #e4ebe7;
  border-radius: 17px;
  background: white;
  box-shadow:
    0 8px 25px rgba(30,60,45,.04);
}

.rx-ad-card-icon,
.rx-ad-analytics-icon {
  width: 47px;
  height: 47px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rx-ad-card-icon.green,
.rx-ad-analytics-icon.green {
  background: #e6f8ef;
  color: #16865d;
}

.rx-ad-card-icon.blue {
  background: #e8f2ff;
  color: #3476c5;
}

.rx-ad-card-icon.red,
.rx-ad-analytics-icon.red {
  background: #fff0f0;
  color: #d84c4c;
}

.rx-ad-card-icon.purple {
  background: #f2edff;
  color: #7357c4;
}

.rx-ad-card-icon.orange,
.rx-ad-analytics-icon.orange {
  background: #fff4e7;
  color: #d68a2b;
}

.rx-ad-card-icon.dark {
  background: #edf1ef;
  color: #29362f;
}

.rx-ad-card div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-ad-card span {
  color: #76827b;
  font-size: 12px;
  font-weight: 700;
}

.rx-ad-card strong {
  margin-top: 4px;
  font-size: 29px;
}

.rx-ad-analytics {
  display: grid;
  grid-template-columns:
    repeat(3,minmax(0,1fr));
  gap: 15px;
  margin-bottom: 28px;
}

.rx-ad-analytics-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e4ebe7;
  border-radius: 17px;
  background: white;
}

.rx-ad-analytics-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-ad-analytics-card span {
  color: #748078;
  font-size: 12px;
  font-weight: 700;
}

.rx-ad-analytics-card strong {
  margin-top: 3px;
  font-size: 27px;
}

.rx-ad-analytics-card small {
  margin-top: 4px;
  color: #9aa39e;
}

.rx-ad-panel {
  padding: 23px;
  border: 1px solid #e4ebe7;
  border-radius: 18px;
  background: white;
}

.rx-ad-priority-grid {
  display: grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap: 14px;
}

.rx-ad-priority {
  padding: 18px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
}

.rx-ad-priority span {
  font-size: 12px;
  font-weight: 700;
}

.rx-ad-priority strong {
  margin-top: 5px;
  font-size: 28px;
}

.rx-ad-priority.low {
  background: #ecf8f2;
  color: #16865d;
}

.rx-ad-priority.medium {
  background: #eef4ff;
  color: #3f72ba;
}

.rx-ad-priority.high {
  background: #fff3e5;
  color: #cc7922;
}

.rx-ad-priority.urgent {
  background: #fff0f0;
  color: #d14848;
}

.rx-ad-table-wrap {
  overflow-x: auto;
}

.rx-ad-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
}

.rx-ad-table th {
  text-align: left;
  padding: 12px;
  background: #f8faf9;
  color: #7c8781;
  font-size: 10px;
  text-transform: uppercase;
}

.rx-ad-table td {
  padding: 14px 12px;
  border-top: 1px solid #edf1ef;
  font-size: 12px;
}

.rx-ad-table tbody tr {
  cursor: pointer;
}

.rx-ad-table tbody tr:hover {
  background: #fafcfb;
}

.rx-ad-complaint {
  display: flex;
  flex-direction: column;
}

.rx-ad-complaint span {
  margin-top: 3px;
  color: #929c97;
  font-size: 10px;
}

.rx-ad-badge {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}

.priority-low,
.status-resolved {
  background: #e7f8ef;
  color: #16865d;
}

.priority-medium,
.status-in-progress {
  background: #eaf2ff;
  color: #3973ba;
}

.priority-high,
.status-assigned {
  background: #fff3e5;
  color: #c97921;
}

.priority-urgent {
  background: #fff0f0;
  color: #cf4646;
}

.status-open {
  background: #fff4e7;
  color: #c97921;
}

.status-closed {
  background: #edf1ef;
  color: #526058;
}

.rx-ad-role-grid {
  display: grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap: 13px;
}

.rx-ad-role {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e7ece9;
  border-radius: 14px;
}

.rx-ad-role-icon {
  width: 41px;
  height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 11px;
  background: #eaf7f1;
  color: #16865d;
}

.rx-ad-role > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-ad-role span {
  color: #7d8882;
  font-size: 11px;
}

.rx-ad-role strong {
  font-size: 21px;
}

.rx-ad-empty {
  padding: 45px;
  text-align: center;
  color: #929c97;
}

.rx-ad-empty h3 {
  margin: 10px 0 4px;
  color: #354139;
}

.rx-ad-empty p {
  margin: 0;
  font-size: 12px;
}

.rx-ad-loading {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #718078;
}

.rx-ad-spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  border: 4px solid #dceae3;
  border-top-color: #1a9b6b;
  border-radius: 50%;
  animation: rxSpin .8s linear infinite;
}

@media(max-width:1100px) {
  .rx-ad-grid,
  .rx-ad-priority-grid,
  .rx-ad-role-grid {
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

  .rx-ad-analytics {
    grid-template-columns: 1fr;
  }
}

@media(max-width:700px) {
  .rx-ad-page {
    padding: 20px 15px;
  }

  .rx-ad-header {
    flex-direction: column;
  }

  .rx-ad-grid,
  .rx-ad-priority-grid,
  .rx-ad-role-grid {
    grid-template-columns: 1fr;
  }

  .rx-ad-refresh {
    width: 100%;
    justify-content: center;
  }
}
`;

export default AdminDashboard;