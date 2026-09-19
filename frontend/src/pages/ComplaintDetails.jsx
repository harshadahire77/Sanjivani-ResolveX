import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  MapPin,
  Tag,
  User,
} from "lucide-react";

import {
  getComplaintById,
  getCurrentUser,
} from "../services/api";

function ComplaintDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentUser = getCurrentUser();

  const [complaint, setComplaint] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================================
  // LOAD COMPLAINT
  // ========================================================

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getComplaintById(id);

        // Student should see only their own complaint
        if (
          currentUser?.role === "STUDENT" &&
          data?.user?.id !==
            currentUser?.userId
        ) {
          setError(
            "You do not have permission to view this complaint."
          );

          return;
        }

        setComplaint(data);
      } catch (err) {
        console.error(
          "Complaint details error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load complaint details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [id, currentUser?.role, currentUser?.userId]);

  // ========================================================
  // STATUS FORMAT
  // ========================================================

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

  // ========================================================
  // DATE FORMAT
  // ========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="rx-detail-state">
        <FileText size={40} />

        <h3>
          Loading complaint...
        </h3>
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error) {
    return (
      <div className="rx-detail-state error">
        <AlertCircle size={42} />

        <h3>
          Unable to open complaint
        </h3>

        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/complaints")
          }
        >
          Back to My Complaints
        </button>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <>
      <style>{`
        .rx-details-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 34px 28px 50px;
        }

        .rx-details-back {
          margin-bottom: 22px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .rx-details-back:hover {
          color: var(--accent);
        }

        .rx-details-header {
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .rx-details-code {
          display: block;
          margin-bottom: 8px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .rx-details-header h1 {
          margin: 0;
          color: var(--heading);
          font-family: "Manrope", sans-serif;
          font-size: 34px;
          line-height: 1.2;
          letter-spacing: -1.2px;
        }

        .rx-details-subtitle {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .rx-details-status {
          padding: 8px 13px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .rx-details-grid {
          display: grid;
          grid-template-columns: 1.45fr 0.75fr;
          gap: 20px;
        }

        .rx-details-card {
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          box-shadow: var(--shadow-small);
        }

        .rx-details-card h2 {
          margin: 0 0 18px;
          color: var(--heading);
          font-size: 16px;
        }

        .rx-description {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .rx-info-list {
          display: grid;
          gap: 4px;
        }

        .rx-info-row {
          padding: 14px 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-bottom: 1px solid var(--border);
        }

        .rx-info-row:last-child {
          border-bottom: none;
        }

        .rx-info-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: var(--accent-soft);
          color: var(--accent);
        }

        .rx-info-row span,
        .rx-info-row strong {
          display: block;
        }

        .rx-info-row span {
          margin-bottom: 4px;
          color: var(--subtle);
          font-size: 10px;
        }

        .rx-info-row strong {
          color: var(--text);
          font-size: 12px;
          line-height: 1.5;
        }

        .rx-details-section {
          margin-top: 20px;
        }

        .rx-resolution {
          padding: 18px;
          border-radius: 10px;
          background: var(--surface-soft);
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .rx-resolution.resolved {
          border: 1px solid #bbf7d0;
          background: #ecfdf3;
          color: #067647;
        }

        .rx-detail-state {
          min-height: 65vh;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--accent);
        }

        .rx-detail-state h3 {
          margin: 15px 0 7px;
          color: var(--heading);
        }

        .rx-detail-state p {
          max-width: 500px;
          margin: 0 0 20px;
          color: var(--muted);
          font-size: 13px;
        }

        .rx-detail-state.error {
          color: #b42318;
        }

        .rx-detail-state button {
          min-height: 44px;
          padding: 0 18px;
          border: none;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .rx-details-page {
            padding: 25px 16px 40px;
          }

          .rx-details-grid {
            grid-template-columns: 1fr;
          }

          .rx-details-header {
            flex-direction: column;
          }

          .rx-details-header h1 {
            font-size: 29px;
          }
        }
      `}</style>

      <div className="rx-details-page">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="rx-details-back"
          onClick={() =>
            navigate("/complaints")
          }
        >
          <ArrowLeft size={17} />
          Back to My Complaints
        </button>

        {/* HEADER */}

        <div className="rx-details-header">
          <div>
            <span className="rx-details-code">
              {complaint.complaintCode}
            </span>

            <h1>
              {complaint.title}
            </h1>

            <p className="rx-details-subtitle">
              Complaint details and current
              resolution progress.
            </p>
          </div>

          <span className="rx-details-status">
            {formatStatus(
              complaint.status
            )}
          </span>
        </div>

        <div className="rx-details-grid">

          {/* LEFT */}

          <div>

            <div className="rx-details-card">
              <h2>
                Complaint Description
              </h2>

              <p className="rx-description">
                {complaint.description}
              </p>
            </div>

            {/* RESOLUTION */}

            <div className="rx-details-card rx-details-section">
              <h2>
                Resolution
              </h2>

              {complaint.resolutionNote ? (
                <div className="rx-resolution resolved">
                  <CheckCircle2
                    size={18}
                    style={{
                      marginBottom: "8px",
                    }}
                  />

                  <div>
                    {
                      complaint.resolutionNote
                    }
                  </div>
                </div>
              ) : (
                <div className="rx-resolution">
                  The complaint has not been
                  resolved yet. Resolution
                  information will appear here
                  when the service team updates
                  the complaint.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT */}

          <div className="rx-details-card">
            <h2>
              Complaint Information
            </h2>

            <div className="rx-info-list">

              <InfoRow
                icon={<Tag size={17} />}
                label="Category"
                value={complaint.category}
              />

              <InfoRow
                icon={
                  <MapPin size={17} />
                }
                label="Location"
                value={complaint.location}
              />

              <InfoRow
                icon={<Flag size={17} />}
                label="Priority"
                value={complaint.priority}
              />

              <InfoRow
                icon={<Clock size={17} />}
                label="Status"
                value={formatStatus(
                  complaint.status
                )}
              />

              <InfoRow
                icon={
                  <Building2 size={17} />
                }
                label="Assigned To"
                value={
                  complaint.assignedTo ||
                  "Not assigned yet"
                }
              />

              <InfoRow
                icon={
                  <Calendar size={17} />
                }
                label="Created"
                value={formatDate(
                  complaint.createdAt
                )}
              />

              <InfoRow
                icon={
                  <Calendar size={17} />
                }
                label="Last Updated"
                value={formatDate(
                  complaint.updatedAt
                )}
              />

              {complaint.resolvedAt && (
                <InfoRow
                  icon={
                    <CheckCircle2
                      size={17}
                    />
                  }
                  label="Resolved"
                  value={formatDate(
                    complaint.resolvedAt
                  )}
                />
              )}

            </div>
          </div>

        </div>

        {/* USER */}

        {complaint.user && (
          <div className="rx-details-card rx-details-section">
            <h2>
              Submitted By
            </h2>

            <div className="rx-info-list">

              <InfoRow
                icon={<User size={17} />}
                label="Name"
                value={
                  complaint.user.name
                }
              />

              <InfoRow
                icon={
                  <FileText size={17} />
                }
                label="PRN / University ID"
                value={
                  complaint.user
                    .universityId
                }
              />

              <InfoRow
                icon={
                  <Building2 size={17} />
                }
                label="Department"
                value={
                  complaint.user
                    .department ||
                  "Not specified"
                }
              />

            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ==========================================================
// INFORMATION ROW
// ==========================================================

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="rx-info-row">

      <div className="rx-info-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {value || "Not available"}
        </strong>
      </div>

    </div>
  );
}

export default ComplaintDetails;