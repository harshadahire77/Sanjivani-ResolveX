import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";

import {
  getApiErrorMessage,
  getCurrentUser,
  getMyAssignedComplaints,
} from "../services/api";

// ==========================================================
// STAFF / FACULTY DASHBOARD
// ==========================================================

const StaffDashboard = () => {
  const navigate = useNavigate();

  const currentUser =
    getCurrentUser();

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================================
  // CURRENT ROLE
  // ========================================================

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() || "";

  const allowed =
    role === "STAFF" ||
    role === "FACULTY";

  // ========================================================
  // LOAD DASHBOARD DATA
  // ========================================================

  const loadDashboard =
    useCallback(
      async (
        showRefresh = false
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const data =
            await getMyAssignedComplaints();

          setComplaints(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (err) {
          setError(
            getApiErrorMessage(err) ||
              "Unable to load service dashboard."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    if (allowed) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [
    allowed,
    loadDashboard,
  ]);

  // ========================================================
  // STATISTICS
  // ========================================================

  const stats =
    useMemo(() => {
      const total =
        complaints.length;

      const assigned =
        complaints.filter(
          (item) =>
            item.status ===
            "ASSIGNED"
        ).length;

      const inProgress =
        complaints.filter(
          (item) =>
            item.status ===
            "IN_PROGRESS"
        ).length;

      const resolved =
        complaints.filter(
          (item) =>
            item.status ===
            "RESOLVED"
        ).length;

      const closed =
        complaints.filter(
          (item) =>
            item.status ===
            "CLOSED"
        ).length;

      const urgent =
        complaints.filter(
          (item) =>
            item.priority ===
              "URGENT" &&
            item.status !==
              "RESOLVED" &&
            item.status !==
              "CLOSED"
        ).length;

      return {
        total,
        assigned,
        inProgress,
        resolved,
        closed,
        urgent,
      };
    }, [complaints]);

  // ========================================================
  // RECENT COMPLAINTS
  // ========================================================

  const recentComplaints =
    useMemo(
      () =>
        complaints.slice(
          0,
          5
        ),
      [complaints]
    );

  // ========================================================
  // ACCESS DENIED
  // ========================================================

  if (!allowed) {
    return (
      <>
        <div className="rx-sd-center">

          <ShieldCheck
            size={46}
          />

          <h2>
            Staff Access Required
          </h2>

          <p>
            This dashboard is available
            only to Staff and Faculty
            accounts.
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <>
        <div className="rx-sd-center">

          <div className="rx-sd-spinner" />

          <p>
            Loading service dashboard...
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>
      <div className="rx-sd-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-sd-header">

          <div>

            <div className="rx-sd-eyebrow">

              <ShieldCheck
                size={16}
              />

              SERVICE WORKSPACE

            </div>

            <h1>
              Welcome back,{" "}
              {currentUser?.name ||
                "Team Member"}
            </h1>

            <p>
              Track and manage complaints
              assigned to your account.
            </p>

          </div>

          <button
            type="button"
            className="rx-sd-refresh"
            disabled={
              refreshing
            }
            onClick={() =>
              loadDashboard(true)
            }
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "rx-sd-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rx-sd-error">

            <AlertCircle
              size={18}
            />

            {error}

          </div>
        )}

        {/* =================================================
            STATS
        ================================================== */}

        <div className="rx-sd-stats">

          <StatCard
            title="Total Assigned"
            value={
              stats.total
            }
            icon={
              <ClipboardCheck
                size={22}
              />
            }
            type="green"
          />

          <StatCard
            title="Waiting"
            value={
              stats.assigned
            }
            icon={
              <Clock3
                size={22}
              />
            }
            type="orange"
          />

          <StatCard
            title="In Progress"
            value={
              stats.inProgress
            }
            icon={
              <Wrench
                size={22}
              />
            }
            type="blue"
          />

          <StatCard
            title="Resolved"
            value={
              stats.resolved
            }
            icon={
              <CheckCircle2
                size={22}
              />
            }
            type="green"
          />

        </div>

        {/* =================================================
            MAIN GRID
        ================================================== */}

        <div className="rx-sd-main-grid">

          {/* ===============================================
              RECENT COMPLAINTS
          ================================================ */}

          <section className="rx-sd-panel">

            <div className="rx-sd-panel-header">

              <div>

                <h2>
                  Recent Assigned Complaints
                </h2>

                <p>
                  Your latest assigned
                  campus service requests.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/assigned"
                  )
                }
              >

                View All

                <ArrowRight
                  size={15}
                />

              </button>

            </div>

            {recentComplaints.length ===
            0 ? (

              <div className="rx-sd-empty">

                <ClipboardCheck
                  size={42}
                />

                <h3>
                  No assigned complaints
                </h3>

                <p>
                  Complaints assigned to
                  you will appear here.
                </p>

              </div>

            ) : (

              <div className="rx-sd-list">

                {recentComplaints.map(
                  (complaint) => (

                    <div
                      className="rx-sd-complaint"
                      key={
                        complaint.id
                      }
                    >

                      <div className="rx-sd-complaint-main">

                        <div className="rx-sd-code">
                          {
                            complaint
                              .complaintCode
                          }
                        </div>

                        <h3>
                          {
                            complaint.title
                          }
                        </h3>

                        <div className="rx-sd-meta">

                          <span>

                            <User
                              size={13}
                            />

                            {complaint.user
                              ?.name ||
                              "Student"}

                          </span>

                          <span>

                            <MapPin
                              size={13}
                            />

                            {complaint.location ||
                              "-"}

                          </span>

                        </div>

                      </div>

                      <div className="rx-sd-complaint-side">

                        <PriorityBadge
                          value={
                            complaint.priority
                          }
                        />

                        <StatusBadge
                          value={
                            complaint.status
                          }
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* ===============================================
              RIGHT SIDE
          ================================================ */}

          <aside className="rx-sd-side">

            {/* URGENT */}

            <div className="rx-sd-urgent">

              <div className="rx-sd-urgent-icon">

                <AlertCircle
                  size={24}
                />

              </div>

              <div>

                <span>
                  URGENT WORKLOAD
                </span>

                <strong>
                  {stats.urgent}
                </strong>

                <p>
                  {stats.urgent === 1
                    ? "urgent complaint requires attention."
                    : "urgent complaints require attention."}
                </p>

              </div>

            </div>

            {/* QUICK ACTION */}

            <div className="rx-sd-quick">

              <span className="rx-sd-small-label">
                QUICK ACTION
              </span>

              <h3>
                Continue assigned work
              </h3>

              <p>
                Open your personal work
                queue, start a complaint,
                add a resolution note and
                mark completed work as
                resolved.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/assigned"
                  )
                }
              >

                <ClipboardCheck
                  size={17}
                />

                My Assigned Complaints

                <ArrowRight
                  size={16}
                />

              </button>

            </div>

            {/* PROFILE */}

            <div className="rx-sd-profile-card">

              <div className="rx-sd-avatar">

                {currentUser?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}

              </div>

              <div className="rx-sd-profile-info">

                <strong>
                  {currentUser?.name ||
                    "ResolveX User"}
                </strong>

                <span>
                  {role === "FACULTY"
                    ? "Faculty"
                    : "Service Staff"}
                </span>

                <p>
                  {currentUser?.department ||
                    "Sanjivani University"}
                </p>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="rx-sd-summary-card">

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {stats.resolved}
                </strong>
              </div>

              <div>
                <span>
                  Closed
                </span>

                <strong>
                  {stats.closed}
                </strong>
              </div>

            </div>

          </aside>

        </div>

      </div>

      <style>{styles}</style>
    </>
  );
};

// ==========================================================
// STAT CARD
// ==========================================================

const StatCard = ({
  title,
  value,
  icon,
  type,
}) => (
  <div className="rx-sd-stat">

    <div
      className={`rx-sd-stat-icon ${type}`}
    >
      {icon}
    </div>

    <div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  </div>
);

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({
  value,
}) => {
  const status =
    value
      ?.toLowerCase()
      .replaceAll(
        "_",
        "-"
      ) ||
    "assigned";

  return (
    <span
      className={`rx-sd-badge status-${status}`}
    >
      {value
        ?.replaceAll(
          "_",
          " "
        ) ||
        "ASSIGNED"}
    </span>
  );
};

// ==========================================================
// PRIORITY BADGE
// ==========================================================

const PriorityBadge = ({
  value,
}) => {
  const priority =
    value
      ?.toLowerCase() ||
    "medium";

  return (
    <span
      className={`rx-sd-badge priority-${priority}`}
    >
      {value || "MEDIUM"}
    </span>
  );
};

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-sd-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  box-sizing: border-box;

  background:
    radial-gradient(
      circle at top right,
      rgba(22, 134, 93, 0.08),
      transparent 30%
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

/* ==========================================================
   HEADER
========================================================== */

.rx-sd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 20px;

  margin-bottom: 27px;
}

.rx-sd-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: #16865d;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.rx-sd-header h1 {
  margin: 0;

  color: #17251e;

  font-size: 34px;
  font-weight: 800;

  letter-spacing: -0.7px;
}

.rx-sd-header p {
  margin: 7px 0 0;

  color: #7d8982;

  font-size: 13px;
}

.rx-sd-refresh {
  min-width: 110px;
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 15px;

  border: 1px solid #dce5e0;
  border-radius: 11px;

  background: #ffffff;

  color: #354139;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.rx-sd-refresh:hover {
  border-color: #16865d;
  color: #16865d;
}

.rx-sd-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==========================================================
   ERROR
========================================================== */

.rx-sd-error {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 13px 15px;

  margin-bottom: 18px;

  border: 1px solid #f2d1d1;
  border-radius: 11px;

  background: #fff0f0;

  color: #c94747;

  font-size: 12px;
  font-weight: 650;
}

/* ==========================================================
   STATS
========================================================== */

.rx-sd-stats {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 14px;

  margin-bottom: 20px;
}

.rx-sd-stat {
  display: flex;
  align-items: center;

  gap: 13px;

  padding: 18px;

  border: 1px solid #e3ebe7;
  border-radius: 15px;

  background: #ffffff;

  box-shadow:
    0 7px 22px
    rgba(23, 60, 42, 0.04);
}

.rx-sd-stat-icon {
  width: 45px;
  height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;
}

.rx-sd-stat-icon.green {
  background: #e8f8f0;
  color: #16865d;
}

.rx-sd-stat-icon.orange {
  background: #fff3e6;
  color: #c87922;
}

.rx-sd-stat-icon.blue {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-sd-stat > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-sd-stat span {
  color: #7d8982;

  font-size: 10px;
  font-weight: 700;
}

.rx-sd-stat strong {
  margin-top: 2px;

  color: #17251e;

  font-size: 25px;
}

/* ==========================================================
   MAIN GRID
========================================================== */

.rx-sd-main-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 2fr)
    minmax(270px, 0.8fr);

  gap: 18px;
}

/* ==========================================================
   PANEL
========================================================== */

.rx-sd-panel {
  overflow: hidden;

  border: 1px solid #e3ebe7;
  border-radius: 16px;

  background: #ffffff;

  box-shadow:
    0 8px 26px
    rgba(23, 60, 42, 0.04);
}

.rx-sd-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 15px;

  padding: 20px;

  border-bottom:
    1px solid #edf1ef;
}

.rx-sd-panel-header h2 {
  margin: 0;

  color: #27372f;

  font-size: 17px;
}

.rx-sd-panel-header p {
  margin: 4px 0 0;

  color: #87928c;

  font-size: 10px;
}

.rx-sd-panel-header button {
  display: flex;
  align-items: center;

  gap: 5px;

  border: 0;

  background: transparent;

  color: #16865d;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;
}

/* ==========================================================
   COMPLAINT LIST
========================================================== */

.rx-sd-list {
  padding: 4px 20px;
}

.rx-sd-complaint {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 15px;

  padding: 17px 0;

  border-bottom:
    1px solid #edf1ef;
}

.rx-sd-complaint:last-child {
  border-bottom: 0;
}

.rx-sd-complaint-main {
  min-width: 0;
}

.rx-sd-code {
  color: #16865d;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.3px;
}

.rx-sd-complaint h3 {
  margin: 4px 0 8px;

  overflow: hidden;

  color: #29382f;

  font-size: 13px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-sd-meta {
  display: flex;
  flex-wrap: wrap;

  gap: 12px;
}

.rx-sd-meta span {
  display: flex;
  align-items: center;

  gap: 5px;

  color: #808c85;

  font-size: 9px;
}

.rx-sd-complaint-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  gap: 6px;

  flex-shrink: 0;
}

/* ==========================================================
   BADGES
========================================================== */

.rx-sd-badge {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 800;
}

.status-open {
  background: #fff3e6;
  color: #c87922;
}

.status-assigned {
  background: #fff3e6;
  color: #c87922;
}

.status-in-progress {
  background: #eaf3ff;
  color: #3672bd;
}

.status-resolved {
  background: #e8f8f0;
  color: #16865d;
}

.status-closed {
  background: #edf1ef;
  color: #58655e;
}

.priority-low {
  background: #e8f8f0;
  color: #16865d;
}

.priority-medium {
  background: #eaf3ff;
  color: #3672bd;
}

.priority-high {
  background: #fff3e6;
  color: #c87922;
}

.priority-urgent {
  background: #fff0f0;
  color: #d04848;
}

/* ==========================================================
   RIGHT SIDE
========================================================== */

.rx-sd-side {
  display: flex;
  flex-direction: column;

  gap: 14px;
}

.rx-sd-urgent,
.rx-sd-quick,
.rx-sd-profile-card,
.rx-sd-summary-card {
  border: 1px solid #e3ebe7;
  border-radius: 16px;

  background: #ffffff;

  box-shadow:
    0 8px 25px
    rgba(23, 60, 42, 0.04);
}

/* URGENT */

.rx-sd-urgent {
  display: flex;

  gap: 13px;

  padding: 19px;
}

.rx-sd-urgent-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  background: #fff0f0;

  color: #d04848;
}

.rx-sd-urgent span,
.rx-sd-small-label {
  color: #89948e;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.8px;
}

.rx-sd-urgent strong {
  display: block;

  margin-top: 2px;

  color: #17251e;

  font-size: 25px;
}

.rx-sd-urgent p {
  margin: 3px 0 0;

  color: #7c8781;

  font-size: 10px;
}

/* QUICK ACTION */

.rx-sd-quick {
  padding: 20px;
}

.rx-sd-quick h3 {
  margin: 7px 0;

  color: #29382f;

  font-size: 16px;
}

.rx-sd-quick p {
  margin: 0 0 17px;

  color: #7c8781;

  font-size: 11px;
  line-height: 1.6;
}

.rx-sd-quick button {
  width: 100%;
  min-height: 42px;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 7px;

  border: 0;
  border-radius: 10px;

  background: #16865d;

  color: #ffffff;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;
}

.rx-sd-quick button:hover {
  background: #10704e;
}

/* PROFILE */

.rx-sd-profile-card {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 18px;
}

.rx-sd-avatar {
  width: 43px;
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  background: #e8f8f0;

  color: #16865d;

  font-weight: 800;
}

.rx-sd-profile-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.rx-sd-profile-info strong {
  overflow: hidden;

  color: #29382f;

  font-size: 12px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-sd-profile-info span {
  margin-top: 2px;

  color: #16865d;

  font-size: 9px;
  font-weight: 800;
}

.rx-sd-profile-info p {
  margin: 2px 0 0;

  color: #89948e;

  font-size: 9px;
}

/* SUMMARY */

.rx-sd-summary-card {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  overflow: hidden;
}

.rx-sd-summary-card > div {
  padding: 16px;

  text-align: center;
}

.rx-sd-summary-card > div:first-child {
  border-right:
    1px solid #edf1ef;
}

.rx-sd-summary-card span {
  display: block;

  color: #89948e;

  font-size: 9px;
}

.rx-sd-summary-card strong {
  display: block;

  margin-top: 3px;

  color: #17251e;

  font-size: 20px;
}

/* ==========================================================
   EMPTY / LOADING / DENIED
========================================================== */

.rx-sd-empty {
  min-height: 280px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: #89948e;

  text-align: center;
}

.rx-sd-empty h3 {
  margin: 9px 0 4px;

  color: #344139;
}

.rx-sd-empty p {
  margin: 0;

  font-size: 10px;
}

.rx-sd-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  color: #7d8982;

  text-align: center;
}

.rx-sd-center h2 {
  margin: 12px 0 5px;

  color: #344139;
}

.rx-sd-center p {
  max-width: 420px;

  margin: 0;

  line-height: 1.6;
}

.rx-sd-spinner {
  width: 36px;
  height: 36px;

  margin-bottom: 12px;

  border:
    4px solid #dceae3;

  border-top-color:
    #16865d;

  border-radius: 50%;

  animation:
    rxSdSpin
    0.8s
    linear
    infinite;
}

.rx-sd-spin {
  animation:
    rxSdSpin
    0.8s
    linear
    infinite;
}

@keyframes rxSdSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media (max-width: 1050px) {
  .rx-sd-main-grid {
    grid-template-columns: 1fr;
  }

  .rx-sd-stats {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .rx-sd-page {
    padding:
      20px 15px;
  }

  .rx-sd-header {
    flex-direction: column;
  }

  .rx-sd-stats {
    grid-template-columns: 1fr;
  }

  .rx-sd-refresh {
    width: 100%;
  }

  .rx-sd-complaint {
    align-items: flex-start;
  }

  .rx-sd-complaint-side {
    align-items: flex-start;
  }
}
`;

// ==========================================================
// IMPORTANT DEFAULT EXPORT
// ==========================================================

export default StaffDashboard;