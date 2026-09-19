import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  FileText,
  Plus,
  Search,
} from "lucide-react";

import {
  getCurrentUser,
  getUserComplaints,
} from "../services/api";

function MyComplaints() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // ========================================================
  // LOAD REAL COMPLAINTS FROM MYSQL
  // ========================================================

  useEffect(() => {
    const loadComplaints = async () => {
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

        const data =
          await getUserComplaints(
            currentUser.userId
          );

        setComplaints(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Unable to load complaints:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [currentUser?.userId]);

  // ========================================================
  // FILTER COMPLAINTS
  // ========================================================

  const filteredComplaints =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return complaints.filter(
        (complaint) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            complaint.status ===
              statusFilter;

          const searchableText = [
            complaint.complaintCode,
            complaint.title,
            complaint.category,
            complaint.location,
            complaint.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
    ]);

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

    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <>
      <style>{`
        .rx-my-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 34px 28px 50px;
        }

        .rx-my-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 27px;
        }

        .rx-my-kicker {
          display: block;
          margin-bottom: 7px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .rx-my-header h1 {
          margin: 0;
          color: var(--heading);
          font-family: "Manrope", sans-serif;
          font-size: 36px;
          letter-spacing: -1.4px;
        }

        .rx-my-header p {
          margin: 9px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .rx-new-btn {
          min-height: 46px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .rx-my-toolbar {
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 210px;
          gap: 12px;
        }

        .rx-search {
          min-height: 48px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
        }

        .rx-search svg {
          color: var(--subtle);
        }

        .rx-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-size: 13px;
        }

        .rx-status-filter {
          min-height: 48px;
          padding: 0 12px;
          border: 1px solid var(--border);
          border-radius: 10px;
          outline: none;
          background: var(--surface);
          color: var(--text);
          font-family: inherit;
          cursor: pointer;
        }

        .rx-complaint-list {
          display: grid;
          gap: 14px;
        }

        .rx-complaint-card {
          padding: 20px;
          border: 1px solid var(--border);
          border-radius: 13px;
          background: var(--surface);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .rx-complaint-card:hover {
          transform: translateY(-2px);
          border-color:
            rgba(22, 134, 95, 0.35);
          box-shadow: var(--shadow-small);
        }

        .rx-card-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .rx-card-code {
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .rx-card-title {
          margin: 6px 0 5px;
          color: var(--heading);
          font-size: 16px;
        }

        .rx-card-category {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .rx-status {
          height: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .rx-card-description {
          margin: 15px 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.65;
        }

        .rx-card-bottom {
          padding-top: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid var(--border);
          color: var(--subtle);
          font-size: 10px;
        }

        .rx-priority {
          font-weight: 700;
          color: var(--text);
        }

        .rx-empty,
        .rx-loading,
        .rx-error {
          min-height: 280px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          text-align: center;
        }

        .rx-empty svg,
        .rx-loading svg {
          color: var(--accent);
        }

        .rx-error svg {
          color: #b42318;
        }

        .rx-empty h3,
        .rx-error h3 {
          margin: 15px 0 6px;
          color: var(--heading);
        }

        .rx-empty p,
        .rx-error p,
        .rx-loading p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .rx-my-page {
            padding: 25px 16px 40px;
          }

          .rx-my-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .rx-new-btn {
            width: 100%;
            justify-content: center;
          }

          .rx-my-toolbar {
            grid-template-columns: 1fr;
          }

          .rx-card-top,
          .rx-card-bottom {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="rx-my-page">
        <div className="rx-my-header">
          <div>
            <span className="rx-my-kicker">
              SANJIVANI RESOLVEX
            </span>

            <h1>My Complaints</h1>

            <p>
              View and track all complaints submitted
              from your ResolveX account.
            </p>
          </div>

          <button
            type="button"
            className="rx-new-btn"
            onClick={() =>
              navigate("/complaints/new")
            }
          >
            <Plus size={17} />
            New Complaint
          </button>
        </div>

        <div className="rx-my-toolbar">
          <div className="rx-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by complaint ID, title, category or location..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            className="rx-status-filter"
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

        {loading ? (
          <div className="rx-loading">
            <FileText size={36} />
            <p>Loading your complaints...</p>
          </div>
        ) : error ? (
          <div className="rx-error">
            <AlertCircle size={36} />

            <h3>
              Unable to load complaints
            </h3>

            <p>{error}</p>
          </div>
        ) : filteredComplaints.length ===
          0 ? (
          <div className="rx-empty">
            <FileText size={40} />

            <h3>
              No complaints found
            </h3>

            <p>
              Submit a new campus complaint and it
              will appear here.
            </p>
          </div>
        ) : (
          <div className="rx-complaint-list">
            {filteredComplaints.map(
              (complaint) => (
                <div
                  key={complaint.id}
                  className="rx-complaint-card"
                  onClick={() =>
                    navigate(
                      `/complaints/${complaint.id}`
                    )
                  }
                >
                  <div className="rx-card-top">
                    <div>
                      <span className="rx-card-code">
                        {
                          complaint.complaintCode
                        }
                      </span>

                      <h3 className="rx-card-title">
                        {complaint.title}
                      </h3>

                      <p className="rx-card-category">
                        {complaint.category}
                        {" • "}
                        {complaint.location}
                      </p>
                    </div>

                    <span className="rx-status">
                      {formatStatus(
                        complaint.status
                      )}
                    </span>
                  </div>

                  <p className="rx-card-description">
                    {complaint.description}
                  </p>

                  <div className="rx-card-bottom">
                    <span>
                      Created:{" "}
                      {formatDate(
                        complaint.createdAt
                      )}
                    </span>

                    <span className="rx-priority">
                      Priority:{" "}
                      {complaint.priority}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default MyComplaints;