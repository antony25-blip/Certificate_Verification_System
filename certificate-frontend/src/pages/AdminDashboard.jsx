import { useEffect, useState } from "react";
import api from "../services/api";
import { FaFileAlt, FaDatabase, FaLayerGroup } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get("/certificate/admin-stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(res => setStats(res.data));
  }, []);

  const cards = [
    {
      title: "Templates",
      desc: "Manage certificate templates",
      icon: <FaFileAlt size={40} />,
      link: "/admin/templates",
      gradient: "linear-gradient(135deg, #4f46e5, #6366f1)",
    },
    {
      title: "Excel Files",
      desc: "Upload and manage Excel data",
      icon: <FaDatabase size={40} />,
      link: "/admin/excel",
      gradient: "linear-gradient(135deg, #059669, #10b981)",
    },
    {
      title: "Layout Config",
      desc: "Adjust positions & fonts",
      icon: <FaLayerGroup size={40} />,
      link: "/admin/layout",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Admin Dashboard</h2>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalCertificates || 0}</h3>
            <p>Total Certificates</p>
          </div>

          <div className="stat-card">
            <h3>{stats.totalTemplates || 0}</h3>
            <p>Total Templates</p>
          </div>

          <div className="stat-card">
            <h3>{stats.activeTemplate || "None"}</h3>
            <p>Active Template</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="dashboard-grid">
          {cards.map((card, index) => (
            <Link to={card.link} key={index} className="dashboard-card">
              <div className="card-top" style={{ background: card.gradient }}>
                {card.icon}
              </div>
              <div className="card-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}