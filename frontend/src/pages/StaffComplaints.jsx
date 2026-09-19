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
  Filter,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Wrench,
  X,
  XCircle,
} from "lucide-react";

import {
  assignComplaint,
  deleteComplaint,
  getAllComplaints,
  getApiErrorMessage,
  getAssignableUsers,
  getCategories,
  getCurrentUser,
  updateComplaint,
} from "../services/api";

// ==========================================================
// ADMIN COMPLAINT MANAGEMENT
// ==========================================================

const StaffComplaints = () => {
  const currentUser =
    getCurrentUser();

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() || "";

  const allowed =
    role === "ADMIN";

  // ========================================================
  // DATA
  // ========================================================

  const [complaints, setComplaints] =
    useState([]);

  const [
    assignableUsers,
    setAssignableUsers,
  ] = useState([]);

  const [categories, setCategories] =
    useState([]);

  // ========================================================
  // PAGE STATE
  // ========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================================
  // FILTERS
  // ========================================================

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("ALL");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("ALL");

  const [
    assigneeFilter,
    setAssigneeFilter,
  ] = useState("ALL");

  // ========================================================
  // MANAGE MODAL
  // ========================================================

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      assignedUserId: "",
      status: "OPEN",
      priority: "MEDIUM",
      resolutionNote: "",
    });

  // ========================================================
  // DELETE MODAL
  // ========================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  // ========================================================
  // LOAD DATA
  // ========================================================

  const loadData =
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

          const [
            complaintData,
            userData,
            categoryData,
          ] = await Promise.all([
            getAllComplaints(),
            getAssignableUsers(),
            getCategories(),
          ]);

          setComplaints(
            Array.isArray(
              complaintData
            )
              ? complaintData
              : []
          );

          setAssignableUsers(
            Array.isArray(
              userData
            )
              ? userData
              : []
          );

          setCategories(
            Array.isArray(
              categoryData
            )
              ? categoryData
              : []
          );
        } catch (err) {
          setError(
            getApiErrorMessage(
              err
            )
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
      loadData();
    } else {
      setLoading(false);
    }
  }, [
    allowed,
    loadData,
  ]);

  // ========================================================
  // FILTERED COMPLAINTS
  // ========================================================

  const filteredComplaints =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

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
            complaint.user
              ?.universityId
              ?.toLowerCase()
              .includes(query) ||
            complaint.assignedUser
              ?.name
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            complaint.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter ===
              "ALL" ||
            complaint.priority ===
              priorityFilter;

          const matchesCategory =
            categoryFilter ===
              "ALL" ||
            complaint.category ===
              categoryFilter;

          let matchesAssignee =
            true;

          if (
            assigneeFilter ===
            "UNASSIGNED"
          ) {
            matchesAssignee =
              !complaint.assignedUser;
          } else if (
            assigneeFilter !==
            "ALL"
          ) {
            matchesAssignee =
              String(
                complaint
                  .assignedUser
                  ?.userId || ""
              ) ===
              String(
                assigneeFilter
              );
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesCategory &&
            matchesAssignee
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
      priorityFilter,
      categoryFilter,
      assigneeFilter,
    ]);

  // ========================================================
  // STATS
  // ========================================================

  const stats =
    useMemo(() => {
      return {
        total:
          complaints.length,

        open:
          complaints.filter(
            (item) =>
              item.status ===
              "OPEN"
          ).length,

        assigned:
          complaints.filter(
            (item) =>
              item.status ===
              "ASSIGNED"
          ).length,

        progress:
          complaints.filter(
            (item) =>
              item.status ===
              "IN_PROGRESS"
          ).length,

        resolved:
          complaints.filter(
            (item) =>
              item.status ===
              "RESOLVED"
          ).length,

        closed:
          complaints.filter(
            (item) =>
              item.status ===
              "CLOSED"
          ).length,

        urgent:
          complaints.filter(
            (item) =>
              item.priority ===
                "URGENT" &&
              item.status !==
                "RESOLVED" &&
              item.status !==
                "CLOSED"
          ).length,
      };
    }, [complaints]);

  // ========================================================
  // OPEN MANAGE MODAL
  // ========================================================

  const openManageModal = (
    complaint
  ) => {
    setError("");
    setSuccess("");

    setSelectedComplaint(
      complaint
    );

    setFormData({
      assignedUserId:
        complaint.assignedUser
          ?.userId
          ? String(
              complaint
                .assignedUser
                .userId
            )
          : "",

      status:
        complaint.status ||
        "OPEN",

      priority:
        complaint.priority ||
        "MEDIUM",

      resolutionNote:
        complaint.resolutionNote ||
        "",
    });
  };

  // ========================================================
  // CLOSE MANAGE MODAL
  // ========================================================

  const closeManageModal =
    () => {
      if (saving) {
        return;
      }

      setSelectedComplaint(
        null
      );
    };

  // ========================================================
  // FORM INPUT
  // ========================================================

  const handleChange = (
    event
  ) => {
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

  // ========================================================
  // SAVE COMPLAINT
  // ========================================================

  const handleSave =
    async (event) => {
      event.preventDefault();

      if (
        !selectedComplaint
      ) {
        return;
      }

      setError("");
      setSuccess("");

      const oldAssignedUserId =
        selectedComplaint
          .assignedUser?.userId
          ? Number(
              selectedComplaint
                .assignedUser
                .userId
            )
          : null;

      const newAssignedUserId =
        formData.assignedUserId
          ? Number(
              formData
                .assignedUserId
            )
          : null;

      let finalStatus =
        formData.status;

      // If newly assigned while still OPEN
      if (
        newAssignedUserId &&
        finalStatus === "OPEN"
      ) {
        finalStatus =
          "ASSIGNED";
      }

      // If unassigned while status is ASSIGNED
      if (
        !newAssignedUserId &&
        finalStatus ===
          "ASSIGNED"
      ) {
        finalStatus =
          "OPEN";
      }

      if (
        finalStatus ===
          "RESOLVED" &&
        !formData
          .resolutionNote
          .trim()
      ) {
        setError(
          "Resolution note is required before marking a complaint as resolved."
        );

        return;
      }

      try {
        setSaving(true);

        // -----------------------------------------------
        // ASSIGN / REASSIGN / UNASSIGN
        // -----------------------------------------------

        if (
          oldAssignedUserId !==
          newAssignedUserId
        ) {
          await assignComplaint(
            selectedComplaint.id,
            newAssignedUserId
          );
        }

        // -----------------------------------------------
        // STATUS / PRIORITY / RESOLUTION
        // -----------------------------------------------

        await updateComplaint(
          selectedComplaint.id,
          {
            status:
              finalStatus,

            priority:
              formData.priority,

            resolutionNote:
              formData
                .resolutionNote
                .trim(),
          }
        );

        setSelectedComplaint(
          null
        );

        setSuccess(
          "Complaint updated successfully."
        );

        await loadData();
      } catch (err) {
        setError(
          getApiErrorMessage(
            err
          )
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================================
  // CLOSE COMPLAINT
  // ========================================================

  const handleCloseComplaint =
    async () => {
      if (
        !selectedComplaint
      ) {
        return;
      }

      if (
        selectedComplaint.status !==
          "RESOLVED" &&
        formData.status !==
          "RESOLVED"
      ) {
        setError(
          "Only resolved complaints can be closed."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        await updateComplaint(
          selectedComplaint.id,
          {
            status: "CLOSED",

            resolutionNote:
              formData
                .resolutionNote
                .trim(),
          }
        );

        setSelectedComplaint(
          null
        );

        setSuccess(
          "Complaint closed successfully."
        );

        await loadData();
      } catch (err) {
        setError(
          getApiErrorMessage(
            err
          )
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================================
  // DELETE
  // ========================================================

  const openDeleteModal = (
    complaint
  ) => {
    setSelectedComplaint(
      null
    );

    setDeleteTarget(
      complaint
    );

    setError("");
  };

  const closeDeleteModal =
    () => {
      if (deleting) {
        return;
      }

      setDeleteTarget(
        null
      );
    };

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteComplaint(
          deleteTarget.id
        );

        setDeleteTarget(
          null
        );

        setSuccess(
          "Complaint deleted successfully."
        );

        await loadData();
      } catch (err) {
        setError(
          getApiErrorMessage(
            err
          )
        );
      } finally {
        setDeleting(false);
      }
    };

  // ========================================================
  // RESET FILTERS
  // ========================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
    setAssigneeFilter("ALL");
  };

  // ========================================================
  // ACCESS DENIED
  // ========================================================

  if (!allowed) {
    return (
      <>
        <div className="rx-cm-center">

          <ShieldCheck
            size={48}
          />

          <h2>
            Administrator Access Required
          </h2>

          <p>
            Complaint Management is
            available only to Administrator
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
        <div className="rx-cm-center">

          <div className="rx-cm-spinner" />

          <p>
            Loading complaint management...
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  return (
    <>
      <div className="rx-cm-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-cm-header">

          <div>

            <div className="rx-cm-eyebrow">

              <ShieldCheck
                size={16}
              />

              ADMIN WORKSPACE

            </div>

            <h1>
              Complaint Management
            </h1>

            <p>
              Assign, prioritize, track,
              resolve, close and manage
              campus complaints.
            </p>

          </div>

          <button
            type="button"
            className="rx-cm-refresh"
            disabled={refreshing}
            onClick={() =>
              loadData(true)
            }
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "rx-cm-spin"
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
          <div className="rx-cm-message error">

            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>

          </div>
        )}

        {success && (
          <div className="rx-cm-message success">

            <CheckCircle2
              size={18}
            />

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================== */}

        <div className="rx-cm-stats">

          <StatCard
            title="Total"
            value={stats.total}
            icon={
              <ClipboardList
                size={21}
              />
            }
            type="dark"
          />

          <StatCard
            title="Open"
            value={stats.open}
            icon={
              <AlertCircle
                size={21}
              />
            }
            type="orange"
          />

          <StatCard
            title="Assigned"
            value={
              stats.assigned
            }
            icon={
              <UserCheck
                size={21}
              />
            }
            type="purple"
          />

          <StatCard
            title="In Progress"
            value={
              stats.progress
            }
            icon={
              <Wrench
                size={21}
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
                size={21}
              />
            }
            type="green"
          />

          <StatCard
            title="Urgent"
            value={
              stats.urgent
            }
            icon={
              <AlertCircle
                size={21}
              />
            }
            type="red"
          />

        </div>

        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="rx-cm-filter-card">

          <div className="rx-cm-search">

            <Search
              size={18}
            />

            <input
              type="text"
              value={search}
              placeholder="Search complaint, student, location, category or assignee..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="rx-cm-filters">

            <div className="rx-cm-filter">

              <Filter
                size={15}
              />

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

                <option value="OPEN">
                  Open
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

            <div className="rx-cm-filter">

              <select
                value={
                  priorityFilter
                }
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Priority
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="URGENT">
                  Urgent
                </option>

              </select>

            </div>

            <div className="rx-cm-filter">

              <Layers3
                size={15}
              />

              <select
                value={
                  categoryFilter
                }
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.name
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="rx-cm-filter">

              <Users
                size={15}
              />

              <select
                value={
                  assigneeFilter
                }
                onChange={(event) =>
                  setAssigneeFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Assignees
                </option>

                <option value="UNASSIGNED">
                  Unassigned
                </option>

                {assignableUsers.map(
                  (user) => (
                    <option
                      key={
                        user.userId
                      }
                      value={
                        user.userId
                      }
                    >
                      {user.name}
                      {" — "}
                      {user.role}
                    </option>
                  )
                )}

              </select>

            </div>

            <button
              type="button"
              className="rx-cm-reset"
              onClick={
                resetFilters
              }
            >
              Reset
            </button>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================== */}

        <div className="rx-cm-table-card">

          <div className="rx-cm-table-header">

            <div>

              <h2>
                Campus Complaints
              </h2>

              <p>
                Showing{" "}
                {
                  filteredComplaints.length
                }
                {" "}of{" "}
                {complaints.length}
                {" "}complaints
              </p>

            </div>

            <div className="rx-cm-service-users">

              <Users
                size={15}
              />

              {
                assignableUsers.length
              }
              {" "}active staff/faculty

            </div>

          </div>

          {filteredComplaints.length ===
          0 ? (

            <div className="rx-cm-empty">

              <ClipboardList
                size={44}
              />

              <h3>
                No complaints found
              </h3>

              <p>
                Try changing your filters
                or search text.
              </p>

            </div>

          ) : (

            <div className="rx-cm-table-wrap">

              <table className="rx-cm-table">

                <thead>

                  <tr>
                    <th>Complaint</th>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredComplaints.map(
                    (complaint) => (

                      <tr
                        key={
                          complaint.id
                        }
                      >

                        <td>

                          <div className="rx-cm-primary">

                            <strong>
                              {
                                complaint.title
                              }
                            </strong>

                            <span>
                              {
                                complaint
                                  .complaintCode
                              }
                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="rx-cm-primary">

                            <strong>
                              {complaint.user
                                ?.name ||
                                "-"}
                            </strong>

                            <span>
                              {complaint.user
                                ?.universityId ||
                                "-"}
                            </span>

                          </div>

                        </td>

                        <td>
                          {complaint.category ||
                            "-"}
                        </td>

                        <td>
                          {complaint.location ||
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

                          {complaint.assignedUser ? (

                            <div className="rx-cm-assignee">

                              <UserCheck
                                size={14}
                              />

                              <div>

                                <strong>
                                  {
                                    complaint
                                      .assignedUser
                                      .name
                                  }
                                </strong>

                                <span>
                                  {
                                    complaint
                                      .assignedUser
                                      .role
                                  }
                                </span>

                              </div>

                            </div>

                          ) : (

                            <span className="rx-cm-unassigned">
                              Unassigned
                            </span>

                          )}

                        </td>

                        <td>

                          <StatusBadge
                            value={
                              complaint.status
                            }
                          />

                        </td>

                        <td>

                          <button
                            type="button"
                            className="rx-cm-manage"
                            onClick={() =>
                              openManageModal(
                                complaint
                              )
                            }
                          >

                            Manage

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ===================================================
          MANAGE MODAL
      ==================================================== */}

      {selectedComplaint && (
        <div
          className="rx-cm-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeManageModal();
            }
          }}
        >

          <div className="rx-cm-modal">

            <div className="rx-cm-modal-header">

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
                className="rx-cm-close"
                disabled={saving}
                onClick={
                  closeManageModal
                }
              >

                <X size={20} />

              </button>

            </div>

            {/* SUMMARY */}

            <div className="rx-cm-summary">

              <SummaryItem
                title="Student"
                value={
                  selectedComplaint
                    .user?.name ||
                  "-"
                }
              />

              <SummaryItem
                title="Category"
                value={
                  selectedComplaint
                    .category ||
                  "-"
                }
              />

              <SummaryItem
                title="Location"
                value={
                  selectedComplaint
                    .location ||
                  "-"
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div className="rx-cm-description">

              <span>
                Complaint Description
              </span>

              <p>
                {
                  selectedComplaint
                    .description
                }
              </p>

            </div>

            <form
              className="rx-cm-form"
              onSubmit={
                handleSave
              }
            >

              {/* ASSIGNMENT */}

              <label>

                <span>
                  Assigned Staff / Faculty
                </span>

                <select
                  name="assignedUserId"
                  value={
                    formData
                      .assignedUserId
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Unassigned
                  </option>

                  {assignableUsers.map(
                    (user) => (

                      <option
                        key={
                          user.userId
                        }
                        value={
                          user.userId
                        }
                      >

                        {user.name}

                        {" — "}

                        {user.role}

                        {user.department
                          ? ` — ${user.department}`
                          : ""}

                      </option>

                    )
                  )}

                </select>

                {assignableUsers.length ===
                  0 && (

                  <small>
                    Create Staff or Faculty
                    accounts from User
                    Management first.
                  </small>

                )}

              </label>

              {/* STATUS + PRIORITY */}

              <div className="rx-cm-form-grid">

                <label>

                  <span>
                    Status
                  </span>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="OPEN">
                      Open
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

                </label>

                <label>

                  <span>
                    Priority
                  </span>

                  <select
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="URGENT">
                      Urgent
                    </option>

                  </select>

                </label>

              </div>

              {/* RESOLUTION */}

              <label>

                <span>
                  Resolution Note
                </span>

                <textarea
                  name="resolutionNote"
                  rows={5}
                  value={
                    formData
                      .resolutionNote
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter resolution details, work completed or other notes..."
                  maxLength={2000}
                />

                <small>
                  {
                    formData
                      .resolutionNote
                      .length
                  }
                  /2000
                </small>

              </label>

              {formData.status ===
                "RESOLVED" && (
                <div className="rx-cm-info">
                  <CheckCircle2
                    size={16}
                  />

                  A resolution note is
                  required before resolving
                  the complaint.
                </div>
              )}

              {/* ACTION BAR */}

              <div className="rx-cm-modal-footer">

                <div className="rx-cm-danger-actions">

                  <button
                    type="button"
                    className="rx-cm-delete"
                    disabled={saving}
                    onClick={() =>
                      openDeleteModal(
                        selectedComplaint
                      )
                    }
                  >

                    <Trash2
                      size={15}
                    />

                    Delete

                  </button>

                  {(
                    selectedComplaint.status ===
                      "RESOLVED" ||
                    formData.status ===
                      "RESOLVED"
                  ) && (

                    <button
                      type="button"
                      className="rx-cm-close-complaint"
                      disabled={saving}
                      onClick={
                        handleCloseComplaint
                      }
                    >

                      <XCircle
                        size={15}
                      />

                      Close Complaint

                    </button>

                  )}

                </div>

                <div className="rx-cm-save-actions">

                  <button
                    type="button"
                    className="secondary"
                    disabled={saving}
                    onClick={
                      closeManageModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >

                    {saving ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="rx-cm-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={16}
                        />

                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION
      ==================================================== */}

      {deleteTarget && (
        <div
          className="rx-cm-overlay rx-cm-delete-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >

          <div className="rx-cm-delete-modal">

            <div className="rx-cm-delete-icon">

              <Trash2
                size={26}
              />

            </div>

            <h2>
              Delete Complaint?
            </h2>

            <p>
              You are about to permanently
              delete:
            </p>

            <div className="rx-cm-delete-target">

              <strong>
                {
                  deleteTarget
                    .complaintCode
                }
              </strong>

              <span>
                {
                  deleteTarget.title
                }
              </span>

            </div>

            <div className="rx-cm-delete-warning">

              <AlertCircle
                size={16}
              />

              This action cannot be undone.

            </div>

            <div className="rx-cm-delete-buttons">

              <button
                type="button"
                className="cancel"
                disabled={deleting}
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete"
                disabled={deleting}
                onClick={
                  handleDelete
                }
              >

                {deleting ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="rx-cm-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={16}
                    />

                    Delete Complaint
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

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
  <div className="rx-cm-stat">

    <div
      className={`rx-cm-stat-icon ${type}`}
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
// SUMMARY
// ==========================================================

const SummaryItem = ({
  title,
  value,
}) => (
  <div>

    <span>
      {title}
    </span>

    <strong>
      {value}
    </strong>

  </div>
);

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
      className={`rx-cm-badge priority-${priority}`}
    >
      {value || "MEDIUM"}
    </span>
  );
};

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
    "open";

  return (
    <span
      className={`rx-cm-badge status-${status}`}
    >
      {value
        ?.replaceAll(
          "_",
          " "
        ) ||
        "OPEN"}
    </span>
  );
};

// ==========================================================
// CSS
// ==========================================================

const styles = `
.rx-cm-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  box-sizing: border-box;

  background:
    radial-gradient(
      circle at top right,
      rgba(22,134,93,.07),
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

/* =========================================================
   HEADER
========================================================= */

.rx-cm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 20px;

  margin-bottom: 25px;
}

.rx-cm-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #16865d;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.rx-cm-header h1 {
  margin: 0;

  font-size: 34px;
  letter-spacing: -.7px;
}

.rx-cm-header p {
  margin: 7px 0 0;

  color: #7c8781;

  font-size: 11px;
}

.rx-cm-refresh {
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 15px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  background: #ffffff;

  color: #46534c;

  font-size: 10px;
  font-weight: 750;

  cursor: pointer;
}

.rx-cm-refresh:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* =========================================================
   MESSAGES
========================================================= */

.rx-cm-message {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 13px;

  margin-bottom: 17px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 650;
}

.rx-cm-message > span {
  flex: 1;
}

.rx-cm-message button {
  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;

  background: transparent;

  color: inherit;

  cursor: pointer;
}

.rx-cm-message.error {
  border: 1px solid #f0d0d0;
  background: #fff0f0;
  color: #c94747;
}

.rx-cm-message.success {
  border: 1px solid #cbe8d9;
  background: #eaf8f1;
  color: #16865d;
}

/* =========================================================
   STATS
========================================================= */

.rx-cm-stats {
  display: grid;

  grid-template-columns:
    repeat(6, 1fr);

  gap: 12px;

  margin-bottom: 20px;
}

.rx-cm-stat {
  display: flex;
  align-items: center;

  gap: 11px;

  padding: 16px;

  border: 1px solid #e3ebe7;
  border-radius: 14px;

  background: #ffffff;
}

.rx-cm-stat-icon {
  width: 41px;
  height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;
}

.rx-cm-stat-icon.dark {
  background: #edf1ef;
  color: #48554e;
}

.rx-cm-stat-icon.orange {
  background: #fff3e6;
  color: #c87922;
}

.rx-cm-stat-icon.purple {
  background: #f2edff;
  color: #7357c4;
}

.rx-cm-stat-icon.blue {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-cm-stat-icon.green {
  background: #e8f8f0;
  color: #16865d;
}

.rx-cm-stat-icon.red {
  background: #fff0f0;
  color: #d04848;
}

.rx-cm-stat > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-cm-stat span {
  color: #7c8781;

  font-size: 8px;
}

.rx-cm-stat strong {
  margin-top: 2px;

  font-size: 22px;
}

/* =========================================================
   FILTER CARD
========================================================= */

.rx-cm-filter-card {
  margin-bottom: 18px;

  padding: 14px;

  border: 1px solid #e3ebe7;
  border-radius: 14px;

  background: #ffffff;
}

.rx-cm-search {
  min-height: 43px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 12px;

  margin-bottom: 10px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  color: #849089;
}

.rx-cm-search input {
  width: 100%;

  border: 0;
  outline: none;

  background: transparent;

  font-size: 11px;
}

.rx-cm-filters {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0,1fr))
    auto;

  gap: 8px;
}

.rx-cm-filter {
  min-height: 40px;

  display: flex;
  align-items: center;

  gap: 6px;

  padding: 0 9px;

  border: 1px solid #dce5e0;
  border-radius: 9px;

  background: #ffffff;

  color: #7d8982;
}

.rx-cm-filter select {
  width: 100%;

  border: 0;
  outline: none;

  background: transparent;

  color: #445149;

  font-size: 9px;
}

.rx-cm-reset {
  min-width: 72px;

  border: 1px solid #dce5e0;
  border-radius: 9px;

  background: #f8faf9;

  color: #536159;

  font-size: 9px;
  font-weight: 750;

  cursor: pointer;
}

/* =========================================================
   TABLE
========================================================= */

.rx-cm-table-card {
  overflow: hidden;

  border: 1px solid #e3ebe7;
  border-radius: 16px;

  background: #ffffff;
}

.rx-cm-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 15px;

  padding: 19px 21px;
}

.rx-cm-table-header h2 {
  margin: 0;

  font-size: 17px;
}

.rx-cm-table-header p {
  margin: 4px 0 0;

  color: #89948e;

  font-size: 9px;
}

.rx-cm-service-users {
  display: flex;
  align-items: center;

  gap: 6px;

  padding: 7px 10px;

  border-radius: 999px;

  background: #eaf8f1;

  color: #16865d;

  font-size: 9px;
  font-weight: 700;
}

.rx-cm-table-wrap {
  overflow-x: auto;
}

.rx-cm-table {
  width: 100%;

  min-width: 1250px;

  border-collapse: collapse;
}

.rx-cm-table th {
  padding: 12px 14px;

  background: #f8faf9;

  color: #79847e;

  text-align: left;

  font-size: 8px;
}

.rx-cm-table td {
  padding: 14px;

  border-top: 1px solid #edf1ef;

  color: #4f5d55;

  font-size: 10px;
}

.rx-cm-primary {
  display: flex;
  flex-direction: column;
}

.rx-cm-primary strong {
  max-width: 210px;

  overflow: hidden;

  color: #28362e;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-cm-primary span {
  margin-top: 3px;

  color: #929c97;

  font-size: 8px;
}

.rx-cm-assignee {
  display: flex;
  align-items: center;

  gap: 7px;

  color: #16865d;
}

.rx-cm-assignee > div {
  display: flex;
  flex-direction: column;
}

.rx-cm-assignee strong {
  font-size: 9px;
}

.rx-cm-assignee span {
  color: #929c97;

  font-size: 8px;
}

.rx-cm-unassigned {
  color: #9aa39e;
}

.rx-cm-manage {
  padding: 7px 11px;

  border: 0;
  border-radius: 8px;

  background: #e8f7ef;

  color: #16865d;

  font-size: 8px;
  font-weight: 800;

  cursor: pointer;
}

/* =========================================================
   BADGES
========================================================= */

.rx-cm-badge {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 999px;

  font-size: 7px;
  font-weight: 800;
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

.status-open {
  background: #fff3e6;
  color: #c87922;
}

.status-assigned {
  background: #f2edff;
  color: #7357c4;
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

/* =========================================================
   EMPTY
========================================================= */

.rx-cm-empty {
  padding: 60px;

  color: #89948e;

  text-align: center;
}

.rx-cm-empty h3 {
  margin: 9px 0 4px;

  color: #344139;
}

.rx-cm-empty p {
  margin: 0;

  font-size: 9px;
}

/* =========================================================
   MODAL
========================================================= */

.rx-cm-overlay {
  position: fixed;
  inset: 0;

  z-index: 5000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(8,25,18,.62);

  backdrop-filter:
    blur(5px);
}

.rx-cm-modal {
  width:
    min(720px,100%);

  max-height: 92vh;

  overflow-y: auto;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 30px 85px
    rgba(0,0,0,.24);
}

.rx-cm-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 15px;

  padding: 21px 23px;

  border-bottom: 1px solid #e9eeeb;
}

.rx-cm-modal-header span {
  color: #16865d;

  font-size: 8px;
  font-weight: 800;
}

.rx-cm-modal-header h2 {
  margin: 4px 0 0;

  font-size: 20px;
}

.rx-cm-close {
  width: 35px;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 9px;

  background: #f4f6f5;

  color: #556159;

  cursor: pointer;
}

.rx-cm-summary {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 10px;

  padding: 18px 23px 0;
}

.rx-cm-summary > div {
  padding: 12px;

  border-radius: 10px;

  background: #f7f9f8;
}

.rx-cm-summary span,
.rx-cm-description > span {
  display: block;

  color: #89948e;

  font-size: 8px;
}

.rx-cm-summary strong {
  display: block;

  margin-top: 3px;

  color: #344139;

  font-size: 10px;
}

.rx-cm-description {
  padding: 17px 23px 0;
}

.rx-cm-description p {
  margin: 5px 0 0;

  color: #536159;

  font-size: 10px;
  line-height: 1.6;
}

/* =========================================================
   FORM
========================================================= */

.rx-cm-form {
  display: flex;
  flex-direction: column;

  gap: 16px;

  padding: 21px 23px 23px;
}

.rx-cm-form label {
  display: flex;
  flex-direction: column;

  gap: 7px;
}

.rx-cm-form label > span {
  color: #536159;

  font-size: 9px;
  font-weight: 750;
}

.rx-cm-form select,
.rx-cm-form textarea {
  width: 100%;

  box-sizing: border-box;

  border: 1px solid #dbe4df;
  border-radius: 9px;

  outline: none;

  background: #ffffff;

  font: inherit;

  font-size: 10px;
}

.rx-cm-form select {
  min-height: 43px;

  padding: 0 11px;
}

.rx-cm-form textarea {
  padding: 11px;

  resize: vertical;

  line-height: 1.6;
}

.rx-cm-form select:focus,
.rx-cm-form textarea:focus {
  border-color: #16865d;

  box-shadow:
    0 0 0 3px
    rgba(22,134,93,.06);
}

.rx-cm-form small {
  align-self: flex-end;

  color: #8a958f;

  font-size: 8px;
}

.rx-cm-form-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 13px;
}

.rx-cm-info {
  display: flex;
  align-items: center;

  gap: 7px;

  padding: 10px 11px;

  border-radius: 9px;

  background: #eaf8f1;

  color: #16865d;

  font-size: 9px;
}

/* =========================================================
   MODAL ACTIONS
========================================================= */

.rx-cm-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 12px;

  padding-top: 6px;
}

.rx-cm-danger-actions,
.rx-cm-save-actions {
  display: flex;

  gap: 8px;
}

.rx-cm-modal-footer button {
  min-height: 39px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  padding: 0 13px;

  border-radius: 8px;

  font-size: 8px;
  font-weight: 800;

  cursor: pointer;
}

.rx-cm-delete {
  border: 1px solid #f0cccc;

  background: #fff4f4;

  color: #d04747;
}

.rx-cm-close-complaint {
  border: 1px solid #e2dac3;

  background: #fff9e9;

  color: #a36e1d;
}

.rx-cm-save-actions .secondary {
  border: 1px solid #dbe4df;

  background: #ffffff;

  color: #536159;
}

.rx-cm-save-actions .primary {
  border: 1px solid #16865d;

  background: #16865d;

  color: #ffffff;
}

/* =========================================================
   DELETE MODAL
========================================================= */

.rx-cm-delete-overlay {
  z-index: 6000;
}

.rx-cm-delete-modal {
  width:
    min(440px,100%);

  padding: 26px;

  border-radius: 17px;

  background: #ffffff;

  text-align: center;

  box-shadow:
    0 30px 80px
    rgba(0,0,0,.26);
}

.rx-cm-delete-icon {
  width: 54px;
  height: 54px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 14px;

  border-radius: 15px;

  background: #fff0f0;

  color: #d04848;
}

.rx-cm-delete-modal h2 {
  margin: 0;

  color: #2f3c34;

  font-size: 20px;
}

.rx-cm-delete-modal > p {
  margin: 7px 0 14px;

  color: #7f8a84;

  font-size: 10px;
}

.rx-cm-delete-target {
  display: flex;
  flex-direction: column;

  gap: 3px;

  padding: 13px;

  border-radius: 10px;

  background: #f7f9f8;
}

.rx-cm-delete-target strong {
  color: #d04848;

  font-size: 10px;
}

.rx-cm-delete-target span {
  color: #4c5a52;

  font-size: 10px;
}

.rx-cm-delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin-top: 13px;

  color: #c94747;

  font-size: 9px;
  font-weight: 700;
}

.rx-cm-delete-buttons {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 9px;

  margin-top: 19px;
}

.rx-cm-delete-buttons button {
  min-height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  border-radius: 9px;

  font-size: 9px;
  font-weight: 800;

  cursor: pointer;
}

.rx-cm-delete-buttons .cancel {
  border: 1px solid #dbe4df;

  background: #ffffff;

  color: #536159;
}

.rx-cm-delete-buttons .delete {
  border: 1px solid #d04848;

  background: #d04848;

  color: #ffffff;
}

/* =========================================================
   LOADING / ACCESS
========================================================= */

.rx-cm-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  color: #78847d;

  text-align: center;
}

.rx-cm-center h2 {
  margin: 12px 0 5px;

  color: #344139;
}

.rx-cm-center p {
  max-width: 430px;

  margin: 0;

  line-height: 1.6;
}

.rx-cm-spinner {
  width: 36px;
  height: 36px;

  margin-bottom: 12px;

  border: 4px solid #dceae3;
  border-top-color: #16865d;

  border-radius: 50%;

  animation:
    rxCmSpin
    .8s
    linear
    infinite;
}

.rx-cm-spin {
  animation:
    rxCmSpin
    .8s
    linear
    infinite;
}

@keyframes rxCmSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media(max-width:1250px) {
  .rx-cm-stats {
    grid-template-columns:
      repeat(3,1fr);
  }

  .rx-cm-filters {
    grid-template-columns:
      repeat(2,1fr);
  }
}

@media(max-width:750px) {
  .rx-cm-page {
    padding: 20px 15px;
  }

  .rx-cm-header {
    flex-direction: column;
  }

  .rx-cm-refresh {
    width: 100%;
  }

  .rx-cm-stats {
    grid-template-columns:
      repeat(2,1fr);
  }

  .rx-cm-filters {
    grid-template-columns: 1fr;
  }

  .rx-cm-reset {
    min-height: 40px;
  }

  .rx-cm-summary,
  .rx-cm-form-grid {
    grid-template-columns: 1fr;
  }

  .rx-cm-modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .rx-cm-danger-actions,
  .rx-cm-save-actions {
    width: 100%;
  }

  .rx-cm-danger-actions button,
  .rx-cm-save-actions button {
    flex: 1;
  }
}

@media(max-width:500px) {
  .rx-cm-stats {
    grid-template-columns: 1fr;
  }

  .rx-cm-danger-actions,
  .rx-cm-save-actions {
    flex-direction: column;
  }

  .rx-cm-delete-buttons {
    grid-template-columns: 1fr;
  }
}
`;

export default StaffComplaints;