import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  MapPin,
  PlayCircle,
  RefreshCw,
  Search,
  User,
  Wrench,
  X,
} from "lucide-react";

import {
  getApiErrorMessage,
  getCurrentUser,
  getMyAssignedComplaints,
  updateComplaint,
} from "../services/api";

const MyAssignedComplaints = () => {
  const currentUser = getCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [resolutionNote, setResolutionNote] =
    useState("");

  // =========================================================
  // ROLE
  // =========================================================

  const role =
    currentUser?.role?.trim()?.toUpperCase() || "";

  const allowed =
    role === "STAFF" ||
    role === "FACULTY";

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadComplaints = useCallback(
    async (showRefresh = false) => {
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
            "Unable to load assigned complaints."
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
      loadComplaints();
    } else {
      setLoading(false);
    }
  }, [
    allowed,
    loadComplaints,
  ]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredComplaints =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            !query ||
            complaint.title
              ?.toLowerCase()
              .includes(query) ||
            complaint.complaintCode
              ?.toLowerCase()
              .includes(query) ||
            complaint.category
              ?.toLowerCase()
              .includes(query) ||
            complaint.location
              ?.toLowerCase()
              .includes(query) ||
            complaint.user?.name
              ?.toLowerCase()
              .includes(query) ||
            complaint.user?.universityId
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            complaint.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
    ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const assignedCount =
    complaints.filter(
      (item) =>
        item.status === "ASSIGNED"
    ).length;

  const progressCount =
    complaints.filter(
      (item) =>
        item.status ===
        "IN_PROGRESS"
    ).length;

  const resolvedCount =
    complaints.filter(
      (item) =>
        item.status ===
        "RESOLVED"
    ).length;

  const closedCount =
    complaints.filter(
      (item) =>
        item.status ===
        "CLOSED"
    ).length;

  // =========================================================
  // OPEN DETAILS
  // =========================================================

  const openComplaint = (
    complaint
  ) => {
    setError("");
    setSuccess("");

    setSelectedComplaint(
      complaint
    );

    setResolutionNote(
      complaint.resolutionNote || ""
    );
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const closeComplaint = () => {
    if (saving) {
      return;
    }

    setSelectedComplaint(null);
    setResolutionNote("");
  };

  // =========================================================
  // UPDATE LOCAL COMPLAINT
  // =========================================================

  const replaceComplaint = (
    updatedComplaint
  ) => {
    setComplaints(
      (previous) =>
        previous.map(
          (complaint) =>
            complaint.id ===
            updatedComplaint.id
              ? {
                  ...complaint,
                  ...updatedComplaint,
                }
              : complaint
        )
    );

    setSelectedComplaint(
      (previous) =>
        previous?.id ===
        updatedComplaint.id
          ? {
              ...previous,
              ...updatedComplaint,
            }
          : previous
    );
  };

  // =========================================================
  // START WORK
  // ASSIGNED -> IN_PROGRESS
  // =========================================================

  const handleStartWork =
    async () => {
      if (!selectedComplaint) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const updated =
          await updateComplaint(
            selectedComplaint.id,
            {
              status:
                "IN_PROGRESS",
            }
          );

        replaceComplaint(
          updated
        );

        setSuccess(
          "Work started successfully. The student has been notified."
        );
      } catch (err) {
        setError(
          getApiErrorMessage(err) ||
            "Unable to start work."
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // RESOLVE COMPLAINT
  // =========================================================

  const handleResolve =
    async () => {
      if (!selectedComplaint) {
        return;
      }

      const note =
        resolutionNote.trim();

      if (!note) {
        setError(
          "Please enter a resolution note before resolving the complaint."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const updated =
          await updateComplaint(
            selectedComplaint.id,
            {
              status:
                "RESOLVED",

              resolutionNote:
                note,
            }
          );

        replaceComplaint(
          updated
        );

        setSuccess(
          "Complaint resolved successfully. The student has been notified."
        );

        setSelectedComplaint(
          null
        );

        setResolutionNote(
          ""
        );
      } catch (err) {
        setError(
          getApiErrorMessage(err) ||
            "Unable to resolve complaint."
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // ACCESS DENIED
  // =========================================================

  if (!allowed) {
    return (
      <>
        <div className="rx-ma-center">

          <AlertCircle
            size={44}
          />

          <h2>
            Access Denied
          </h2>

          <p>
            This page is available only
            for Staff and Faculty accounts.
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <div className="rx-ma-center">

          <div className="rx-ma-spinner" />

          <p>
            Loading your assigned complaints...
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  return (
    <>
      <div className="rx-ma-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-ma-header">

          <div>

            <div className="rx-ma-label">
              <Wrench size={16} />
              SERVICE WORKSPACE
            </div>

            <h1>
              My Assigned Complaints
            </h1>

            <p>
              Review and resolve complaints
              assigned to{" "}
              {currentUser?.name || "you"}.
            </p>

          </div>

          <button
            type="button"
            className="rx-ma-refresh"
            disabled={refreshing}
            onClick={() =>
              loadComplaints(true)
            }
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "rx-ma-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="rx-ma-message error">

            <AlertCircle
              size={18}
            />

            {error}

          </div>
        )}

        {success && (
          <div className="rx-ma-message success">

            <CheckCircle2
              size={18}
            />

            {success}

          </div>
        )}

        {/* =================================================
            STATS
        ================================================== */}

        <div className="rx-ma-stats">

          <StatCard
            title="Total Assigned"
            value={complaints.length}
            icon={
              <ClipboardList
                size={20}
              />
            }
            type="green"
          />

          <StatCard
            title="Waiting"
            value={assignedCount}
            icon={
              <User
                size={20}
              />
            }
            type="orange"
          />

          <StatCard
            title="In Progress"
            value={progressCount}
            icon={
              <Clock3
                size={20}
              />
            }
            type="blue"
          />

          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={
              <CheckCircle2
                size={20}
              />
            }
            type="green"
          />

        </div>

        {/* =================================================
            SEARCH
        ================================================== */}

        <div className="rx-ma-toolbar">

          <div className="rx-ma-search">

            <Search
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search complaint, student, category..."
            />

          </div>

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="ASSIGNED">
              Assigned
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

          </select>

        </div>

        {/* =================================================
            RESULTS SUMMARY
        ================================================== */}

        <div className="rx-ma-result-info">

          <span>
            Showing{" "}
            <strong>
              {filteredComplaints.length}
            </strong>
            {" "}of{" "}
            <strong>
              {complaints.length}
            </strong>
            {" "}assigned complaints
          </span>

          {closedCount > 0 && (
            <span>
              {closedCount} closed
            </span>
          )}

        </div>

        {/* =================================================
            EMPTY
        ================================================== */}

        {filteredComplaints.length ===
        0 ? (

          <div className="rx-ma-empty">

            <ClipboardList
              size={46}
            />

            <h3>
              No assigned complaints
            </h3>

            <p>
              You currently have no
              complaints matching this filter.
            </p>

          </div>

        ) : (

          /* =================================================
             CARDS
          ================================================= */

          <div className="rx-ma-grid">

            {filteredComplaints.map(
              (complaint) => (

                <div
                  className="rx-ma-card"
                  key={
                    complaint.id
                  }
                >

                  <div className="rx-ma-card-top">

                    <span className="rx-ma-code">
                      {
                        complaint.complaintCode
                      }
                    </span>

                    <StatusBadge
                      value={
                        complaint.status
                      }
                    />

                  </div>

                  <h3>
                    {
                      complaint.title
                    }
                  </h3>

                  <p className="rx-ma-description">
                    {
                      complaint.description
                    }
                  </p>

                  <div className="rx-ma-info">

                    <div>
                      <User size={15} />

                      <span>
                        {complaint.user
                          ?.name ||
                          "Student"}
                      </span>
                    </div>

                    <div>
                      <MapPin
                        size={15}
                      />

                      <span>
                        {complaint.location ||
                          "-"}
                      </span>
                    </div>

                  </div>

                  <div className="rx-ma-card-meta">

                    <PriorityBadge
                      value={
                        complaint.priority
                      }
                    />

                    <span>
                      {complaint.category ||
                        "Other"}
                    </span>

                  </div>

                  <div className="rx-ma-card-actions">

                    <button
                      type="button"
                      className="rx-ma-view"
                      onClick={() =>
                        openComplaint(
                          complaint
                        )
                      }
                    >
                      <Eye size={15} />

                      Manage
                    </button>

                    {complaint.status ===
                      "ASSIGNED" && (

                      <button
                        type="button"
                        className="rx-ma-start"
                        disabled={saving}
                        onClick={async () => {

                          setSelectedComplaint(
                            complaint
                          );

                          try {
                            setSaving(true);
                            setError("");
                            setSuccess("");

                            const updated =
                              await updateComplaint(
                                complaint.id,
                                {
                                  status:
                                    "IN_PROGRESS",
                                }
                              );

                            replaceComplaint(
                              updated
                            );

                            setSelectedComplaint(
                              null
                            );

                            setSuccess(
                              `Work started on ${complaint.complaintCode}.`
                            );
                          } catch (err) {
                            setError(
                              getApiErrorMessage(
                                err
                              ) ||
                                "Unable to start work."
                            );
                          } finally {
                            setSaving(false);
                          }

                        }}
                      >

                        <PlayCircle
                          size={15}
                        />

                        Start Work

                      </button>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* ===================================================
          COMPLAINT MODAL
      ==================================================== */}

      {selectedComplaint && (
        <div
          className="rx-ma-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeComplaint();
            }

          }}
        >

          <div className="rx-ma-modal">

            {/* HEADER */}

            <div className="rx-ma-modal-header">

              <div>

                <span>
                  {
                    selectedComplaint
                      .complaintCode
                  }
                </span>

                <h2>
                  {
                    selectedComplaint
                      .title
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeComplaint
                }
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* STATUS */}

            <div className="rx-ma-modal-status">

              <StatusBadge
                value={
                  selectedComplaint
                    .status
                }
              />

              <PriorityBadge
                value={
                  selectedComplaint
                    .priority
                }
              />

            </div>

            {/* DETAILS */}

            <div className="rx-ma-modal-grid">

              <div>
                <span>
                  Student
                </span>

                <strong>
                  {selectedComplaint
                    .user?.name ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  University ID
                </span>

                <strong>
                  {selectedComplaint
                    .user
                    ?.universityId ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Category
                </span>

                <strong>
                  {selectedComplaint
                    .category ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Location
                </span>

                <strong>
                  {selectedComplaint
                    .location ||
                    "-"}
                </strong>
              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="rx-ma-modal-section">

              <span className="rx-ma-section-title">
                Complaint Description
              </span>

              <p>
                {
                  selectedComplaint
                    .description
                }
              </p>

            </div>

            {/* ASSIGNED PERSON */}

            <div className="rx-ma-assignment">

              <User size={17} />

              <div>
                <span>
                  Assigned To
                </span>

                <strong>
                  {selectedComplaint
                    .assignedUser
                    ?.name ||
                    currentUser?.name ||
                    "-"}
                </strong>
              </div>

            </div>

            {/* RESOLUTION */}

            <div className="rx-ma-modal-section">

              <label className="rx-ma-resolution-label">

                <span>
                  Resolution Note
                </span>

                <textarea
                  rows={5}
                  value={
                    resolutionNote
                  }
                  disabled={
                    selectedComplaint
                      .status ===
                      "RESOLVED" ||
                    selectedComplaint
                      .status ===
                      "CLOSED"
                  }
                  onChange={(event) =>
                    setResolutionNote(
                      event.target.value
                    )
                  }
                  placeholder="Describe the work completed and how the issue was resolved..."
                />

              </label>

              {selectedComplaint
                .status ===
                "RESOLVED" && (

                <small className="rx-ma-resolved-text">
                  This complaint has
                  already been resolved.
                </small>

              )}

            </div>

            {/* ACTIONS */}

            <div className="rx-ma-modal-actions">

              <button
                type="button"
                className="secondary"
                disabled={saving}
                onClick={
                  closeComplaint
                }
              >
                Close
              </button>

              {selectedComplaint
                .status ===
                "ASSIGNED" && (

                <button
                  type="button"
                  className="start"
                  disabled={saving}
                  onClick={
                    handleStartWork
                  }
                >

                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="rx-ma-spin"
                    />
                  ) : (
                    <PlayCircle
                      size={16}
                    />
                  )}

                  Start Work

                </button>

              )}

              {selectedComplaint
                .status ===
                "IN_PROGRESS" && (

                <button
                  type="button"
                  className="resolve"
                  disabled={saving}
                  onClick={
                    handleResolve
                  }
                >

                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="rx-ma-spin"
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                    />
                  )}

                  Resolve Complaint

                </button>

              )}

            </div>

          </div>

        </div>
      )}

      <style>
        {styles}
      </style>
    </>
  );
};

// ===========================================================
// STAT
// ===========================================================

const StatCard = ({
  title,
  value,
  icon,
  type,
}) => (
  <div className="rx-ma-stat">

    <div
      className={`rx-ma-stat-icon ${type}`}
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

// ===========================================================
// STATUS
// ===========================================================

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
      className={`rx-ma-status status-${status}`}
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

// ===========================================================
// PRIORITY
// ===========================================================

const PriorityBadge = ({
  value,
}) => {
  const priority =
    value?.toLowerCase() ||
    "medium";

  return (
    <span
      className={`rx-ma-priority priority-${priority}`}
    >
      {value ||
        "MEDIUM"}
    </span>
  );
};

// ===========================================================
// CSS
// ===========================================================

const styles = `
.rx-ma-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  background:
    radial-gradient(
      circle at top right,
      rgba(22, 134, 93, 0.07),
      transparent 28%
    ),
    #f6f8f7;
  color: #17251e;
  font-family: Inter, system-ui, sans-serif;
}

.rx-ma-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 26px;
}

.rx-ma-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #16865d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.rx-ma-header h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.7px;
}

.rx-ma-header p {
  margin: 7px 0 0;
  color: #7c8781;
  font-size: 13px;
}

.rx-ma-refresh {
  height: 43px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 15px;
  border: 1px solid #dce5e0;
  border-radius: 11px;
  background: #ffffff;
  color: #354139;
  font-weight: 700;
  cursor: pointer;
}

.rx-ma-refresh:hover {
  border-color: #16865d;
  color: #16865d;
}

.rx-ma-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 15px;
  margin-bottom: 18px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 650;
}

.rx-ma-message.error {
  border: 1px solid #f0d0d0;
  background: #fff0f0;
  color: #c94747;
}

.rx-ma-message.success {
  border: 1px solid #cce8da;
  background: #eaf8f1;
  color: #16865d;
}

/* STATS */

.rx-ma-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.rx-ma-stat {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
  border: 1px solid #e3ebe7;
  border-radius: 15px;
  background: #ffffff;
  box-shadow:
    0 7px 22px rgba(23, 60, 42, 0.04);
}

.rx-ma-stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
}

.rx-ma-stat-icon.green {
  background: #e8f8f0;
  color: #16865d;
}

.rx-ma-stat-icon.orange {
  background: #fff3e6;
  color: #c87922;
}

.rx-ma-stat-icon.blue {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-ma-stat > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-ma-stat span {
  color: #7c8781;
  font-size: 10px;
  font-weight: 700;
}

.rx-ma-stat strong {
  margin-top: 2px;
  font-size: 24px;
}

/* TOOLBAR */

.rx-ma-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.rx-ma-search {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid #dce5e0;
  border-radius: 11px;
  background: #ffffff;
  color: #7b8780;
}

.rx-ma-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
}

.rx-ma-toolbar select {
  min-width: 170px;
  padding: 0 12px;
  border: 1px solid #dce5e0;
  border-radius: 11px;
  background: #ffffff;
  outline: none;
}

.rx-ma-result-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 17px;
  color: #8a958f;
  font-size: 10px;
}

/* GRID */

.rx-ma-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.rx-ma-card {
  padding: 20px;
  border: 1px solid #e3ebe7;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 8px 25px rgba(23, 60, 42, 0.04);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.rx-ma-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 30px rgba(23, 60, 42, 0.07);
}

.rx-ma-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.rx-ma-code {
  color: #16865d;
  font-size: 10px;
  font-weight: 800;
}

.rx-ma-card h3 {
  margin: 12px 0 7px;
  color: #27372f;
  font-size: 17px;
}

.rx-ma-description {
  min-height: 40px;
  color: #69766f;
  font-size: 12px;
  line-height: 1.6;
}

.rx-ma-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 0;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
}

.rx-ma-info div {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #657169;
  font-size: 11px;
}

.rx-ma-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 0;
  color: #7e8983;
  font-size: 10px;
}

.rx-ma-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 3px;
}

.rx-ma-card-actions button {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.rx-ma-view {
  border: 1px solid #dce5e0;
  background: #ffffff;
  color: #56635b;
}

.rx-ma-start {
  border: 1px solid #16865d;
  background: #16865d;
  color: #ffffff;
}

/* BADGES */

.rx-ma-status,
.rx-ma-priority {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
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

.status-open {
  background: #fff3e6;
  color: #c87922;
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

/* EMPTY */

.rx-ma-empty,
.rx-ma-center {
  min-height: 55vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #849088;
  text-align: center;
}

.rx-ma-empty {
  min-height: 330px;
  border: 1px solid #e3ebe7;
  border-radius: 16px;
  background: #ffffff;
}

.rx-ma-empty h3,
.rx-ma-center h2 {
  margin: 10px 0 5px;
  color: #344139;
}

.rx-ma-empty p,
.rx-ma-center p {
  margin: 0;
}

/* MODAL */

.rx-ma-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(8, 25, 18, 0.62);
  backdrop-filter: blur(5px);
}

.rx-ma-modal {
  width: min(700px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 19px;
  background: #ffffff;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.25);
}

.rx-ma-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 21px 23px;
  border-bottom: 1px solid #e9eeeb;
}

.rx-ma-modal-header span {
  color: #16865d;
  font-size: 10px;
  font-weight: 800;
}

.rx-ma-modal-header h2 {
  margin: 4px 0 0;
  font-size: 21px;
}

.rx-ma-modal-header button {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9px;
  background: #f4f6f5;
  cursor: pointer;
}

.rx-ma-modal-status {
  display: flex;
  gap: 8px;
  padding: 18px 23px 0;
}

.rx-ma-modal-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 16px 23px 0;
}

.rx-ma-modal-grid > div {
  padding: 12px;
  border-radius: 10px;
  background: #f7f9f8;
}

.rx-ma-modal-grid span {
  display: block;
  color: #89948e;
  font-size: 9px;
}

.rx-ma-modal-grid strong {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.rx-ma-modal-section {
  padding: 18px 23px 0;
}

.rx-ma-section-title {
  display: block;
  margin-bottom: 6px;
  color: #78847d;
  font-size: 10px;
  font-weight: 750;
}

.rx-ma-modal-section p {
  margin: 0;
  color: #536159;
  font-size: 12px;
  line-height: 1.7;
}

.rx-ma-assignment {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 23px 0;
  padding: 13px;
  border: 1px solid #dbece3;
  border-radius: 11px;
  background: #f1faf5;
  color: #16865d;
}

.rx-ma-assignment div {
  display: flex;
  flex-direction: column;
}

.rx-ma-assignment span {
  color: #799087;
  font-size: 9px;
}

.rx-ma-assignment strong {
  color: #287557;
  font-size: 12px;
}

.rx-ma-resolution-label {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rx-ma-resolution-label > span {
  color: #536159;
  font-size: 11px;
  font-weight: 750;
}

.rx-ma-resolution-label textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px;
  border: 1px solid #dbe4df;
  border-radius: 10px;
  outline: none;
  resize: vertical;
  font: inherit;
}

.rx-ma-resolution-label textarea:focus {
  border-color: #16865d;
  box-shadow:
    0 0 0 3px rgba(22, 134, 93, 0.08);
}

.rx-ma-resolution-label textarea:disabled {
  background: #f4f6f5;
  color: #6f7973;
}

.rx-ma-resolved-text {
  display: block;
  margin-top: 7px;
  color: #16865d;
  font-size: 10px;
}

.rx-ma-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 22px 23px 23px;
}

.rx-ma-modal-actions button {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 15px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.rx-ma-modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rx-ma-modal-actions .secondary {
  border: 1px solid #dce5e0;
  background: #ffffff;
  color: #536159;
}

.rx-ma-modal-actions .start {
  border: 1px solid #3672bd;
  background: #3672bd;
  color: #ffffff;
}

.rx-ma-modal-actions .resolve {
  border: 1px solid #16865d;
  background: #16865d;
  color: #ffffff;
}

/* SPINNER */

.rx-ma-spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  border: 4px solid #dceae3;
  border-top-color: #16865d;
  border-radius: 50%;
  animation:
    rxMaSpin 0.8s linear infinite;
}

.rx-ma-spin {
  animation:
    rxMaSpin 0.8s linear infinite;
}

@keyframes rxMaSpin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media (max-width: 950px) {
  .rx-ma-stats,
  .rx-ma-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .rx-ma-page {
    padding: 20px 15px;
  }

  .rx-ma-header,
  .rx-ma-toolbar {
    flex-direction: column;
  }

  .rx-ma-stats,
  .rx-ma-grid,
  .rx-ma-modal-grid {
    grid-template-columns: 1fr;
  }

  .rx-ma-refresh {
    width: 100%;
    justify-content: center;
  }

  .rx-ma-toolbar select {
    height: 44px;
  }

  .rx-ma-modal-actions {
    flex-direction: column-reverse;
  }

  .rx-ma-modal-actions button {
    width: 100%;
  }
}
`;

export default MyAssignedComplaints;