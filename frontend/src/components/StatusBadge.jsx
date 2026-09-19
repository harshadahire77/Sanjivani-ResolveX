const statusClasses = {
  SUBMITTED: "submitted",
  OPEN: "submitted",
  ASSIGNED: "assigned",
  "IN PROGRESS": "progress",
  IN_PROGRESS: "progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  REJECTED: "rejected",
};

function StatusBadge({ status = "Submitted" }) {
  const normalized = status
    .toString()
    .trim()
    .toUpperCase();

  const cssClass =
    statusClasses[normalized] || "submitted";

  const label = normalized
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );

  return (
    <span
      className={`status-badge status-${cssClass}`}
    >
      <span className="status-dot" />

      {label}
    </span>
  );
}

export default StatusBadge;