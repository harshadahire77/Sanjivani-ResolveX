function StatCard({
  icon,
  title,
  value,
  subtitle,
  type = "default",
}) {
  return (
    <article
      className={`dashboard-stat-card stat-${type}`}
    >
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-info">
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        {subtitle && (
          <small>
            {subtitle}
          </small>
        )}
      </div>
    </article>
  );
}

export default StatCard;