import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import * as apiService from "../services/api";

// ==========================================================
// NOTIFICATIONS PAGE
// ==========================================================

const Notifications = () => {
  const navigate =
    useNavigate();

  const currentUser =
    apiService.getCurrentUser?.();

  const userId =
    currentUser?.userId ??
    currentUser?.id ??
    null;

  // ========================================================
  // STATE
  // ========================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    showClearConfirm,
    setShowClearConfirm,
  ] = useState(false);

  // ========================================================
  // API INSTANCE
  // ========================================================

  const api =
    apiService.default;

  // ========================================================
  // ERROR HELPER
  // ========================================================

  const getErrorMessage = (
    err
  ) => {
    if (
      typeof apiService
        .getApiErrorMessage ===
      "function"
    ) {
      return apiService
        .getApiErrorMessage(
          err
        );
    }

    return (
      err?.response?.data
        ?.message ||
      err?.message ||
      "Something went wrong."
    );
  };

  // ========================================================
  // NORMALIZE RESPONSE
  // ========================================================

  const normalizeArray = (
    response
  ) => {
    if (
      Array.isArray(response)
    ) {
      return response;
    }

    if (
      Array.isArray(
        response?.data
      )
    ) {
      return response.data;
    }

    return [];
  };

  // ========================================================
  // GET ALL NOTIFICATIONS
  // Supports existing api.js aliases + fallback endpoint
  // ========================================================

  const fetchNotifications =
    useCallback(
      async () => {
        if (!userId) {
          return [];
        }

        if (
          typeof apiService
            .getUserNotifications ===
          "function"
        ) {
          return normalizeArray(
            await apiService
              .getUserNotifications(
                userId
              )
          );
        }

        if (
          typeof apiService
            .getNotifications ===
          "function"
        ) {
          return normalizeArray(
            await apiService
              .getNotifications(
                userId
              )
          );
        }

        if (
          typeof apiService
            .getNotificationsByUserId ===
          "function"
        ) {
          return normalizeArray(
            await apiService
              .getNotificationsByUserId(
                userId
              )
          );
        }

        const response =
          await api.get(
            `/notifications/user/${userId}`
          );

        return normalizeArray(
          response
        );
      },
      [api, userId]
    );

  // ========================================================
  // LOAD
  // ========================================================

  const loadNotifications =
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
            await fetchNotifications();

          setNotifications(
            data
          );
        } catch (err) {
          setError(
            getErrorMessage(
              err
            )
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [fetchNotifications]
    );

  useEffect(() => {
    loadNotifications();
  }, [
    loadNotifications,
  ]);

  // ========================================================
  // UNREAD COUNT
  // ========================================================

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            !item.read
        ).length,
      [notifications]
    );

  // ========================================================
  // FILTER DATA
  // ========================================================

  const filteredNotifications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          const matchesFilter =
            filter === "ALL" ||
            (
              filter ===
                "UNREAD" &&
              !notification.read
            ) ||
            (
              filter ===
                "READ" &&
              notification.read
            );

          const matchesSearch =
            !query ||
            notification.title
              ?.toLowerCase()
              .includes(query) ||
            notification.message
              ?.toLowerCase()
              .includes(query) ||
            notification.type
              ?.toLowerCase()
              .includes(query);

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      notifications,
      search,
      filter,
    ]);

  // ========================================================
  // MARK ONE AS READ
  // ========================================================

  const markOneRead =
    async (
      notification
    ) => {
      if (
        !notification ||
        notification.read
      ) {
        return;
      }

      try {
        if (
          typeof apiService
            .markNotificationAsRead ===
          "function"
        ) {
          await apiService
            .markNotificationAsRead(
              notification.id
            );
        } else if (
          typeof apiService
            .markNotificationRead ===
          "function"
        ) {
          await apiService
            .markNotificationRead(
              notification.id
            );
        } else {
          await api.put(
            `/notifications/${notification.id}/read`
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      read: true,
                    }
                  : item
            )
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err
          )
        );
      }
    };

  // ========================================================
  // MARK ALL READ
  // ========================================================

  const handleMarkAllRead =
    async () => {
      if (
        unreadCount === 0 ||
        !userId
      ) {
        return;
      }

      try {
        setProcessing(true);
        setError("");
        setSuccess("");

        if (
          typeof apiService
            .markAllNotificationsAsRead ===
          "function"
        ) {
          await apiService
            .markAllNotificationsAsRead(
              userId
            );
        } else if (
          typeof apiService
            .markAllAsRead ===
          "function"
        ) {
          await apiService
            .markAllAsRead(
              userId
            );
        } else {
          await api.put(
            `/notifications/user/${userId}/read-all`
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                read: true,
              })
            )
        );

        setSuccess(
          "All notifications marked as read."
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err
          )
        );
      } finally {
        setProcessing(false);
      }
    };

  // ========================================================
  // DELETE ONE
  // ========================================================

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setProcessing(true);
        setError("");
        setSuccess("");

        if (
          typeof apiService
            .deleteNotification ===
          "function"
        ) {
          await apiService
            .deleteNotification(
              deleteTarget.id
            );
        } else {
          await api.delete(
            `/notifications/${deleteTarget.id}`
          );
        }

        setNotifications(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                deleteTarget.id
            )
        );

        setDeleteTarget(null);

        setSuccess(
          "Notification deleted successfully."
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err
          )
        );
      } finally {
        setProcessing(false);
      }
    };

  // ========================================================
  // CLEAR ALL
  // ========================================================

  const handleClearAll =
    async () => {
      if (
        !userId ||
        notifications.length ===
          0
      ) {
        return;
      }

      try {
        setProcessing(true);
        setError("");
        setSuccess("");

        if (
          typeof apiService
            .clearNotifications ===
          "function"
        ) {
          await apiService
            .clearNotifications(
              userId
            );
        } else if (
          typeof apiService
            .deleteAllNotifications ===
          "function"
        ) {
          await apiService
            .deleteAllNotifications(
              userId
            );
        } else {
          await api.delete(
            `/notifications/user/${userId}`
          );
        }

        setNotifications([]);

        setShowClearConfirm(
          false
        );

        setSuccess(
          "All notifications cleared successfully."
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err
          )
        );
      } finally {
        setProcessing(false);
      }
    };

  // ========================================================
  // CLICK NOTIFICATION
  // ========================================================

  const handleNotificationClick =
    async (
      notification
    ) => {
      await markOneRead(
        notification
      );

      if (
        notification
          .complaintId
      ) {
        navigate(
          `/complaints/${notification.complaintId}`
        );
      }
    };

  // ========================================================
  // DATE FORMAT
  // ========================================================

  const formatDateTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ========================================================
  // RELATIVE TIME
  // ========================================================

  const getRelativeTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const seconds =
      Math.floor(
        (
          Date.now() -
          date.getTime()
        ) / 1000
      );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return formatDateTime(
      value
    );
  };

  // ========================================================
  // NOTIFICATION STYLE
  // ========================================================

  const getNotificationMeta = (
    type
  ) => {
    const value =
      type
        ?.trim()
        ?.toUpperCase() ||
      "INFO";

    switch (value) {
      case "SUCCESS":
        return {
          icon:
            CheckCircle2,
          className:
            "success",
        };

      case "RESOLVED":
        return {
          icon:
            CheckCheck,
          className:
            "resolved",
        };

      case "ASSIGNED":
        return {
          icon:
            UserCheck,
          className:
            "assigned",
        };

      case "WARNING":
        return {
          icon:
            AlertCircle,
          className:
            "warning",
        };

      case "STATUS_UPDATE":
      case "STATUS":
        return {
          icon:
            ClipboardCheck,
          className:
            "status",
        };

      default:
        return {
          icon: Info,
          className:
            "info",
        };
    }
  };

  // ========================================================
  // NO USER
  // ========================================================

  if (!userId) {
    return (
      <>
        <div className="rx-notify-center">

          <ShieldCheck
            size={48}
          />

          <h2>
            User Session Not Found
          </h2>

          <p>
            Please log in again to
            access your notifications.
          </p>

        </div>

        <style>
          {styles}
        </style>
      </>
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <>
        <div className="rx-notify-center">

          <div className="rx-notify-spinner" />

          <p>
            Loading notifications...
          </p>

        </div>

        <style>
          {styles}
        </style>
      </>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>
      <div className="rx-notify-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-notify-header">

          <div>

            <div className="rx-notify-eyebrow">

              <BellRing
                size={16}
              />

              RESOLVEX UPDATES

            </div>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated about your
              complaints, assignments and
              service activity.
            </p>

          </div>

          <div className="rx-notify-header-actions">

            <button
              type="button"
              className="rx-notify-refresh"
              disabled={
                refreshing
              }
              onClick={() =>
                loadNotifications(
                  true
                )
              }
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "rx-notify-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

            <button
              type="button"
              className="rx-notify-read-all"
              disabled={
                processing ||
                unreadCount ===
                  0
              }
              onClick={
                handleMarkAllRead
              }
            >

              <CheckCheck
                size={17}
              />

              Mark All Read

            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="rx-notify-message error">

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
          <div className="rx-notify-message success">

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

        <div className="rx-notify-stats">

          <div className="rx-notify-stat">

            <div className="all">

              <Bell
                size={21}
              />

            </div>

            <div>

              <span>
                Total Notifications
              </span>

              <strong>
                {
                  notifications.length
                }
              </strong>

            </div>

          </div>

          <div className="rx-notify-stat">

            <div className="unread">

              <BellRing
                size={21}
              />

            </div>

            <div>

              <span>
                Unread
              </span>

              <strong>
                {unreadCount}
              </strong>

            </div>

          </div>

          <div className="rx-notify-stat">

            <div className="read">

              <CheckCheck
                size={21}
              />

            </div>

            <div>

              <span>
                Read
              </span>

              <strong>
                {notifications.length -
                  unreadCount}
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTROLS
        ================================================== */}

        <div className="rx-notify-controls">

          <div className="rx-notify-search">

            <Search
              size={18}
            />

            <input
              type="text"
              value={search}
              placeholder="Search notifications..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="rx-notify-tabs">

            <button
              type="button"
              className={
                filter ===
                "ALL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  "ALL"
                )
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                filter ===
                "UNREAD"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  "UNREAD"
                )
              }
            >

              Unread

              {unreadCount >
                0 && (
                <span>
                  {unreadCount}
                </span>
              )}

            </button>

            <button
              type="button"
              className={
                filter ===
                "READ"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  "READ"
                )
              }
            >
              Read
            </button>

          </div>

        </div>

        {/* =================================================
            LIST CARD
        ================================================== */}

        <section className="rx-notify-card">

          <div className="rx-notify-card-header">

            <div>

              <h2>
                Notification Center
              </h2>

              <p>
                Showing{" "}
                <strong>
                  {
                    filteredNotifications.length
                  }
                </strong>
                {" "}notification(s)
              </p>

            </div>

            {notifications.length >
              0 && (

              <button
                type="button"
                className="rx-notify-clear"
                onClick={() =>
                  setShowClearConfirm(
                    true
                  )
                }
              >

                <Trash2
                  size={15}
                />

                Clear All

              </button>

            )}

          </div>

          {filteredNotifications.length ===
          0 ? (

            <div className="rx-notify-empty">

              <div>

                <Bell
                  size={34}
                />

              </div>

              <h3>
                No notifications found
              </h3>

              <p>
                {filter ===
                "UNREAD"
                  ? "You have no unread notifications."
                  : search
                  ? "No notifications match your search."
                  : "Your notification center is currently empty."}
              </p>

            </div>

          ) : (

            <div className="rx-notify-list">

              {filteredNotifications.map(
                (
                  notification
                ) => {
                  const meta =
                    getNotificationMeta(
                      notification.type
                    );

                  const Icon =
                    meta.icon;

                  return (
                    <div
                      key={
                        notification.id
                      }
                      className={`rx-notify-item ${
                        !notification.read
                          ? "unread"
                          : ""
                      }`}
                    >

                      {!notification.read && (
                        <span className="rx-notify-unread-dot" />
                      )}

                      <button
                        type="button"
                        className="rx-notify-main"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >

                        <div
                          className={`rx-notify-icon ${meta.className}`}
                        >

                          <Icon
                            size={20}
                          />

                        </div>

                        <div className="rx-notify-content">

                          <div className="rx-notify-title-row">

                            <strong>
                              {notification.title ||
                                "Notification"}
                            </strong>

                            {!notification.read && (
                              <span className="rx-notify-new">
                                NEW
                              </span>
                            )}

                          </div>

                          <p>
                            {notification.message ||
                              "No message available."}
                          </p>

                          <div className="rx-notify-meta">

                            <span>

                              <Clock3
                                size={12}
                              />

                              {getRelativeTime(
                                notification.createdAt
                              )}

                            </span>

                            {notification.type && (
                              <span className="rx-notify-type">

                                {
                                  notification.type
                                    .replaceAll(
                                      "_",
                                      " "
                                    )
                                }

                              </span>
                            )}

                          </div>

                        </div>

                        {notification.complaintId && (
                          <ChevronRight
                            size={19}
                            className="rx-notify-chevron"
                          />
                        )}

                      </button>

                      <div className="rx-notify-item-actions">

                        {!notification.read && (
                          <button
                            type="button"
                            title="Mark as read"
                            className="read-button"
                            onClick={() =>
                              markOneRead(
                                notification
                              )
                            }
                          >

                            <Check
                              size={16}
                            />

                          </button>
                        )}

                        <button
                          type="button"
                          title="Delete notification"
                          className="delete-button"
                          onClick={() =>
                            setDeleteTarget(
                              notification
                            )
                          }
                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* ===================================================
          DELETE CONFIRMATION
      ==================================================== */}

      {deleteTarget && (
        <div
          className="rx-notify-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteTarget(
                null
              );
            }
          }}
        >

          <div className="rx-notify-modal">

            <div className="rx-notify-modal-icon danger">

              <Trash2
                size={25}
              />

            </div>

            <h2>
              Delete Notification?
            </h2>

            <p>
              This notification will be
              permanently removed.
            </p>

            <div className="rx-notify-delete-preview">

              <strong>
                {
                  deleteTarget.title
                }
              </strong>

              <span>
                {
                  deleteTarget.message
                }
              </span>

            </div>

            <div className="rx-notify-modal-actions">

              <button
                type="button"
                className="cancel"
                disabled={
                  processing
                }
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger"
                disabled={
                  processing
                }
                onClick={
                  handleDelete
                }
              >

                {processing ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="rx-notify-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                    />

                    Delete
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          CLEAR ALL CONFIRMATION
      ==================================================== */}

      {showClearConfirm && (
        <div
          className="rx-notify-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowClearConfirm(
                false
              );
            }
          }}
        >

          <div className="rx-notify-modal">

            <div className="rx-notify-modal-icon danger">

              <Trash2
                size={25}
              />

            </div>

            <h2>
              Clear All Notifications?
            </h2>

            <p>
              All your notifications will
              be permanently deleted.
            </p>

            <div className="rx-notify-warning">

              <AlertCircle
                size={16}
              />

              This action cannot be undone.

            </div>

            <div className="rx-notify-modal-actions">

              <button
                type="button"
                className="cancel"
                disabled={
                  processing
                }
                onClick={() =>
                  setShowClearConfirm(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger"
                disabled={
                  processing
                }
                onClick={
                  handleClearAll
                }
              >

                {processing ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="rx-notify-spin"
                    />

                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                    />

                    Clear All
                  </>
                )}

              </button>

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

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-notify-page {
  min-height: calc(100vh - 68px);

  box-sizing: border-box;

  padding: 32px;

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

.rx-notify-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 20px;

  margin-bottom: 24px;
}

.rx-notify-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #16865d;

  font-size: 9px;
  font-weight: 850;

  letter-spacing: 1.2px;
}

.rx-notify-header h1 {
  margin: 0;

  font-size: 34px;
  letter-spacing: -.8px;
}

.rx-notify-header p {
  margin: 6px 0 0;

  color: #7d8982;

  font-size: 11px;
}

.rx-notify-header-actions {
  display: flex;

  gap: 8px;
}

.rx-notify-refresh,
.rx-notify-read-all {
  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 14px;

  border-radius: 10px;

  font-size: 9px;
  font-weight: 800;

  cursor: pointer;
}

.rx-notify-refresh {
  border: 1px solid #dce5e0;

  background: #ffffff;

  color: #536159;
}

.rx-notify-read-all {
  border: 1px solid #16865d;

  background: #16865d;

  color: #ffffff;
}

.rx-notify-refresh:disabled,
.rx-notify-read-all:disabled {
  opacity: .55;

  cursor: not-allowed;
}

/* =========================================================
   MESSAGE
========================================================= */

.rx-notify-message {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 14px;

  margin-bottom: 16px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 700;
}

.rx-notify-message span {
  flex: 1;
}

.rx-notify-message button {
  display: flex;
  align-items: center;

  border: 0;

  background: transparent;

  color: inherit;

  cursor: pointer;
}

.rx-notify-message.error {
  border: 1px solid #f1cccc;

  background: #fff0f0;

  color: #c94747;
}

.rx-notify-message.success {
  border: 1px solid #cae8d8;

  background: #eaf8f1;

  color: #16865d;
}

/* =========================================================
   STATS
========================================================= */

.rx-notify-stats {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 13px;

  margin-bottom: 18px;
}

.rx-notify-stat {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 17px;

  border: 1px solid #e3ebe7;
  border-radius: 14px;

  background: #ffffff;
}

.rx-notify-stat > div:first-child {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.rx-notify-stat .all {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-notify-stat .unread {
  background: #fff3e6;
  color: #c87922;
}

.rx-notify-stat .read {
  background: #e8f8f0;
  color: #16865d;
}

.rx-notify-stat > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-notify-stat span {
  color: #7d8982;

  font-size: 8px;
}

.rx-notify-stat strong {
  font-size: 22px;
}

/* =========================================================
   CONTROLS
========================================================= */

.rx-notify-controls {
  display: flex;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 17px;
}

.rx-notify-search {
  min-height: 43px;

  flex: 1;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 12px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  background: #ffffff;

  color: #849089;
}

.rx-notify-search input {
  width: 100%;

  border: 0;
  outline: none;

  background: transparent;

  font-size: 10px;
}

.rx-notify-tabs {
  display: flex;

  gap: 5px;

  padding: 4px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  background: #ffffff;
}

.rx-notify-tabs button {
  min-height: 34px;

  display: flex;
  align-items: center;

  gap: 5px;

  padding: 0 12px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: #718078;

  font-size: 9px;
  font-weight: 750;

  cursor: pointer;
}

.rx-notify-tabs button.active {
  background: #e8f8f0;

  color: #16865d;
}

.rx-notify-tabs button span {
  min-width: 17px;
  height: 17px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 999px;

  background: #16865d;

  color: white;

  font-size: 7px;
}

/* =========================================================
   CARD
========================================================= */

.rx-notify-card {
  overflow: hidden;

  border: 1px solid #e3ebe7;
  border-radius: 15px;

  background: #ffffff;
}

.rx-notify-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 18px 20px;

  border-bottom: 1px solid #edf1ef;
}

.rx-notify-card-header h2 {
  margin: 0;

  font-size: 15px;
}

.rx-notify-card-header p {
  margin: 3px 0 0;

  color: #89948e;

  font-size: 8px;
}

.rx-notify-clear {
  display: flex;
  align-items: center;

  gap: 6px;

  min-height: 35px;

  padding: 0 11px;

  border: 1px solid #f0cccc;
  border-radius: 8px;

  background: #fff5f5;

  color: #cd4949;

  font-size: 8px;
  font-weight: 800;

  cursor: pointer;
}

/* =========================================================
   LIST
========================================================= */

.rx-notify-list {
  display: flex;
  flex-direction: column;
}

.rx-notify-item {
  position: relative;

  display: flex;
  align-items: center;

  border-bottom: 1px solid #edf1ef;

  transition: .2s ease;
}

.rx-notify-item:last-child {
  border-bottom: 0;
}

.rx-notify-item:hover {
  background: #fafcfb;
}

.rx-notify-item.unread {
  background:
    linear-gradient(
      90deg,
      rgba(22,134,93,.055),
      rgba(22,134,93,.01)
    );
}

.rx-notify-unread-dot {
  position: absolute;

  left: 7px;
  top: 50%;

  width: 6px;
  height: 6px;

  transform: translateY(-50%);

  border-radius: 50%;

  background: #16865d;
}

.rx-notify-main {
  flex: 1;

  display: flex;
  align-items: center;

  gap: 13px;

  min-width: 0;

  padding: 16px 13px 16px 19px;

  border: 0;

  background: transparent;

  text-align: left;

  cursor: pointer;
}

.rx-notify-icon {
  width: 41px;
  height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;
}

.rx-notify-icon.info {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-notify-icon.success,
.rx-notify-icon.resolved {
  background: #e8f8f0;
  color: #16865d;
}

.rx-notify-icon.warning {
  background: #fff3e6;
  color: #c87922;
}

.rx-notify-icon.assigned {
  background: #f2edff;
  color: #7357c4;
}

.rx-notify-icon.status {
  background: #e8f4ff;
  color: #3877bd;
}

.rx-notify-content {
  min-width: 0;

  flex: 1;
}

.rx-notify-title-row {
  display: flex;
  align-items: center;

  gap: 7px;
}

.rx-notify-title-row strong {
  color: #344139;

  font-size: 11px;
}

.rx-notify-new {
  padding: 3px 6px;

  border-radius: 999px;

  background: #16865d;

  color: white;

  font-size: 6px;
  font-weight: 850;

  letter-spacing: .5px;
}

.rx-notify-content p {
  max-width: 800px;

  margin: 5px 0 7px;

  color: #6d7972;

  font-size: 9px;
  line-height: 1.5;
}

.rx-notify-meta {
  display: flex;
  align-items: center;

  gap: 9px;

  color: #969f9a;

  font-size: 7px;
}

.rx-notify-meta > span:first-child {
  display: flex;
  align-items: center;

  gap: 4px;
}

.rx-notify-type {
  padding: 3px 6px;

  border-radius: 999px;

  background: #f0f4f2;

  color: #68746d;

  font-size: 6px;
  font-weight: 750;
}

.rx-notify-chevron {
  flex-shrink: 0;

  color: #a4ada8;
}

.rx-notify-item-actions {
  display: flex;
  align-items: center;

  gap: 5px;

  padding-right: 14px;
}

.rx-notify-item-actions button {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 8px;

  cursor: pointer;
}

.rx-notify-item-actions .read-button {
  background: #e8f8f0;
  color: #16865d;
}

.rx-notify-item-actions .delete-button {
  background: #fff3f3;
  color: #cf4c4c;
}

/* =========================================================
   EMPTY
========================================================= */

.rx-notify-empty {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 65px 20px;

  text-align: center;
}

.rx-notify-empty > div {
  width: 60px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background: #edf7f2;

  color: #16865d;
}

.rx-notify-empty h3 {
  margin: 13px 0 4px;

  color: #344139;

  font-size: 14px;
}

.rx-notify-empty p {
  margin: 0;

  color: #89948e;

  font-size: 9px;
}

/* =========================================================
   MODAL
========================================================= */

.rx-notify-overlay {
  position: fixed;
  inset: 0;

  z-index: 6000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(8,25,18,.62);

  backdrop-filter: blur(5px);
}

.rx-notify-modal {
  width: min(430px,100%);

  padding: 25px;

  border-radius: 17px;

  background: #ffffff;

  text-align: center;

  box-shadow:
    0 30px 80px
    rgba(0,0,0,.25);
}

.rx-notify-modal-icon {
  width: 53px;
  height: 53px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 13px;

  border-radius: 14px;
}

.rx-notify-modal-icon.danger {
  background: #fff0f0;

  color: #d04848;
}

.rx-notify-modal h2 {
  margin: 0;

  color: #344139;

  font-size: 19px;
}

.rx-notify-modal > p {
  margin: 7px 0 15px;

  color: #818c86;

  font-size: 9px;
}

.rx-notify-delete-preview {
  display: flex;
  flex-direction: column;

  gap: 4px;

  padding: 12px;

  border-radius: 9px;

  background: #f7f9f8;

  text-align: left;
}

.rx-notify-delete-preview strong {
  color: #344139;

  font-size: 9px;
}

.rx-notify-delete-preview span {
  color: #7d8982;

  font-size: 8px;
  line-height: 1.5;
}

.rx-notify-warning {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin: 15px 0 0;

  color: #c94747;

  font-size: 8px;
  font-weight: 750;
}

.rx-notify-modal-actions {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 8px;

  margin-top: 19px;
}

.rx-notify-modal-actions button {
  min-height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  border-radius: 9px;

  font-size: 9px;
  font-weight: 800;

  cursor: pointer;
}

.rx-notify-modal-actions .cancel {
  border: 1px solid #dce5e0;

  background: #ffffff;

  color: #536159;
}

.rx-notify-modal-actions .danger {
  border: 1px solid #d04848;

  background: #d04848;

  color: #ffffff;
}

.rx-notify-modal-actions button:disabled {
  opacity: .6;

  cursor: not-allowed;
}

/* =========================================================
   LOADING
========================================================= */

.rx-notify-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  color: #7d8982;

  text-align: center;
}

.rx-notify-center h2 {
  margin: 12px 0 5px;

  color: #344139;
}

.rx-notify-center p {
  margin: 0;
}

.rx-notify-spinner {
  width: 36px;
  height: 36px;

  margin-bottom: 12px;

  border: 4px solid #dceae3;
  border-top-color: #16865d;

  border-radius: 50%;

  animation:
    rxNotifySpin
    .8s
    linear
    infinite;
}

.rx-notify-spin {
  animation:
    rxNotifySpin
    .8s
    linear
    infinite;
}

@keyframes rxNotifySpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media(max-width:800px) {
  .rx-notify-page {
    padding: 20px 15px;
  }

  .rx-notify-header {
    flex-direction: column;
  }

  .rx-notify-header-actions {
    width: 100%;
  }

  .rx-notify-header-actions button {
    flex: 1;
  }

  .rx-notify-controls {
    flex-direction: column;
  }

  .rx-notify-stats {
    grid-template-columns: 1fr;
  }

  .rx-notify-tabs {
    width: 100%;
  }

  .rx-notify-tabs button {
    flex: 1;
    justify-content: center;
  }
}

@media(max-width:600px) {
  .rx-notify-item {
    align-items: flex-start;
  }

  .rx-notify-main {
    align-items: flex-start;
  }

  .rx-notify-chevron {
    display: none;
  }

  .rx-notify-item-actions {
    flex-direction: column;

    padding:
      13px
      10px
      0
      0;
  }

  .rx-notify-modal-actions {
    grid-template-columns: 1fr;
  }
}
`;

export default Notifications;