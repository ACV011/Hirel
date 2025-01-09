import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Operation from "./Operation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentActivities, setRecentActivity] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchActivities();
    fetchRecentScans(); // Fetch recent scans data
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://192.168.1.172:5000/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error in fetching users", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://192.168.1.172:5000/activities");
      setActivities(response.data);
      setRecentActivity(response.data.slice(-10));
    } catch (error) {
      console.error("Error in fetching Activities");
    }
  };

  const fetchRecentScans = async () => {
    try {
      const response = await axios.get(
        "http://192.168.1.172:5000/recent-scans"
      );
      setRecentScans(response.data);
    } catch (error) {
      console.error("Error fetching recent scans:", error);
    }
  };

  const ActiveUsers = users.filter((user) => user.status === "Active").length;
  const InactiveUsers = users.length - ActiveUsers;

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://192.168.1.172:5000/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("userRole");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const chartData = {
    labels: activities.map((activity) => activity.activity_type),
    datasets: [
      {
        label: "Activities Count",
        data: activities.map((activity) => activity.count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Count: ${tooltipItem.raw}`,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <header className="home-header">
        <img src={logo} alt="logo" style={{ height: "45px" }} />
        <div className="nav-bar">
          <a href="/Home" className="nav-btn">
            User Management
          </a>
          <a href="/Activity" className="nav-btn">
            Activity Management
          </a>
          <a href="/Dashboard" className="nav-btn">
            Dashboard
          </a>
          <a
            href="#"
            className="nav-btn"
            onClick={() => setModalIsOpen(true)}
            style={{ color: "#0056b3" }}
          >
            Activity
          </a>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
        </button>
      </header>
      <h1>Dashboard</h1>

      <div className="dashboard-section">
        <h2 style={{ color: "#0056b3" }}>USER OVERVIEW</h2>
        <div className="stats">
          <div className="stat">
            <p>TOTAL USERS</p>
            <h3>{users.length}</h3>
          </div>
          <div className="stat">
            <p>ACTIVE USERS</p>
            <h3>{ActiveUsers}</h3>
          </div>
          <div className="stat">
            <p>INACTIVE USERS</p>
            <h3>{InactiveUsers}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 style={{ color: "#0056b3" }}>ACTIVITY OVERVIEW</h2>
        <div className="stats">
          <div className="stat">
            <p>TOTAL ACTIVITY</p>
            <h3>{activities.length}</h3>
          </div>
          <div className="stat">
            <p>RECENT ACTIVITIES</p>
            <ul>
              {recentActivities.map((activity) => (
                <li key={activity.id}>
                  {activity.activity_type} - Target/day({activity.target_day})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* New table for recent scans */}
      <div className="dashboard-section">
        <h2 style={{ color: "#0056b3" }}>ACTIVITIES</h2>
        <table className="scans-table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>DEPARTMENT</th>
              <th>LOGIN TIME</th>
              <th>BARCODE</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((scan, index) => (
              <tr key={index}>
                <td>{scan.username}</td>
                <td>{scan.department}</td>
                <td>{new Date(scan.login_time).toLocaleString()}</td>
                <td>{scan.barcode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <div className="dashboard-section">
                <h2 style={{ color: "#0056b3" }}>ACTIVITY CHART</h2>
                <Bar data={chartData} options={chartOptions} />
            </div>


      <Operation
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
