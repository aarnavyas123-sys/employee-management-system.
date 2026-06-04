function StatsCard({ title, value, color }) {
  return (
    <div className={`card stat-card text-white ${color}`}>
      <div className="card-body">
        <h6>{title}</h6>

        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default StatsCard;
