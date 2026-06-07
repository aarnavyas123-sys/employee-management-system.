import { FaUsers, FaBuilding, FaTools, FaImage } from "react-icons/fa";

function StatsCard({ title, value, color }) {
  const getIcon = () => {
    switch (title) {
      case "Total Employees":
        return <FaUsers size={28} />;
      case "Departments":
        return <FaBuilding size={28} />;
      case "Total Skills":
        return <FaTools size={28} />;
      case "Total Images":
        return <FaImage size={28} />;
      default:
        return <FaUsers size={28} />;
    }
  };

  return (
    <div className={`dashboard-card ${color}`}>
      {" "}
      <div className="card-top">
        {" "}
        <div>
          {" "}
          <h6>{title}</h6> <h1>{value}</h1>{" "}
        </div>
        <div className="card-icon">{getIcon()}</div>
      </div>
      <p className="card-footer-text">Updated Today</p>
    </div>
  );
}

export default StatsCard;
