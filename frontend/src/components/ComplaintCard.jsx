import {
  ArrowRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import StatusBadge from "./StatusBadge";

function ComplaintCard({
  complaint,
}) {
  const navigate = useNavigate();

  return (
    <article className="complaint-card">
      <div className="complaint-card-top">
        <div>
          <span className="complaint-code">
            {complaint.id}
          </span>

          <h3>
            {complaint.title}
          </h3>
        </div>

        <StatusBadge
          status={complaint.status}
        />
      </div>

      <p className="complaint-description">
        {complaint.description}
      </p>

      <div className="complaint-meta">
        <span>
          <MapPin size={14} />

          {complaint.location}
        </span>

        <span>
          <CalendarDays size={14} />

          {complaint.createdAt}
        </span>
      </div>

      <div className="complaint-card-footer">
        <div>
          <span className="complaint-category">
            {complaint.category}
          </span>

          <span
            className={`priority priority-${complaint.priority.toLowerCase()}`}
          >
            {complaint.priority}
          </span>
        </div>

        <button
          onClick={() =>
            navigate(
              `/complaints/${complaint.id}`
            )
          }
        >
          View Details

          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

export default ComplaintCard;