import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import "./Operation.css";
import { FaTrashAlt } from "react-icons/fa";

Modal.setAppElement("#root");

function Operation({ isOpen, onRequestClose }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [recentBarcodes, setRecentBarcodes] = useState([]);
  const [barcodeCounts, setBarcodeCounts] = useState({});
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    created_at: "",
    target_day: "",
  });
  const [userName, setUserName] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [targetCycleTime, setTargetCycleTime] = useState("");
  const [currentCycleTime, setCurrentCycleTime] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchUserName();
    } else {
      console.error("User ID is not available.");
    }
  }, [userId, fetchUserName]);

  useEffect(() => {
    let interval;
    if (isOpen && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = new Date(now - startTime);
        const hours = String(elapsed.getUTCHours()).padStart(2, "0");
        const minutes = String(elapsed.getUTCMinutes()).padStart(2, "0");
        const seconds = String(elapsed.getUTCSeconds()).padStart(2, "0");
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, startTime]);

  useEffect(() => {
    if (formData.target_day) {
      const targetDay = parseFloat(formData.target_day);
      if (!isNaN(targetDay) && targetDay > 0) {
        const cycleTime = (28880 / targetDay).toFixed(2);
        setTargetCycleTime(cycleTime);
      } else {
        setTargetCycleTime("N/A");
      }
    }
  }, [formData.target_day]);

  useEffect(() => {
    if (scanCount > 0) {
      const [hours, minutes, seconds] = elapsedTime.split(":").map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if (totalSeconds > 0) {
        const cycleTime = (totalSeconds / scanCount).toFixed(2);
        setCurrentCycleTime(cycleTime);
      } else {
        setCurrentCycleTime("N/A");
      }
    } else {
      setCurrentCycleTime("N/A");
    }
  }, [scanCount, elapsedTime]);

  const fetchUserName = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.172:5000/users/${userId}`);
      setUserName(response.data.full_name);
      fetchActivities(response.data.full_name);
    } catch (error) {
      console.error("Error fetching user name:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (userName) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.1.172:5000/assigned-activities/${userName}`
      );
      const sortedActivities = response.data.sort((a, b) =>
        a.activity_type.localeCompare(b.activity_type)
      );
      setActivities(sortedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeChange = (event) => {
    setBarcode(event.target.value);
  };

  const handleScan = async (event) => {
    if (event.key === "Enter") {
      const newCounts = { ...barcodeCounts };
      newCounts[barcode] = (newCounts[barcode] || 0) + 1;
      setBarcodeCounts(newCounts);

      setRecentBarcodes((prevBarcodes) => {
        const newBarcodes = [barcode, ...prevBarcodes];
        return newBarcodes.slice(0, 5);
      });

      setScanCount((prevCount) => prevCount + 1);

      const scanData = {
        username: userName,
        login_time: formData.created_at,
        target_day: formData.target_day,
        barcode: barcode,
      };

      try {
        await axios.post("http://192.168.1.172:5000/save-scan", scanData);
        console.log("Scan data saved successfully");
      } catch (error) {
        alert("Error saving scan data:", error);
      }

      setBarcode("");
      event.preventDefault();
    }
  };

  const handleOpenModal = (activityType) => {
    const selectedActivity = activities.find(
      (activity) => activity.activity_type === activityType
    );
    if (selectedActivity) {
      setFormData({
        ...formData,
        created_at: new Date().toISOString(),
        target_day: selectedActivity.target_day,
      });
      setStartTime(new Date());
    }
    setSelectedOption(activityType);
  };

  // const handleCloseModal = () => {
  //   setSelectedOption(null);
  //   setStartTime(null);
  //   setBarcodeCounts({});
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onRequestClose();
  };

  const handleExit = async () => {
    window.location.href = "/Dashboard";
  };

  const handleDeleteBarcode = async (index) => {
    const barcodeToDelete = recentBarcodes[index];
  
    if (window.confirm(`Are you sure you want to delete barcode: ${barcodeToDelete}?`)) {
      try {
        await axios.delete(`http://192.168.1.172:5000/delete-barcode/${barcodeToDelete}`);
        console.log("Barcode deleted successfully");
  
        setBarcodeCounts((prevCounts) => {
          const newCounts = { ...prevCounts };
          newCounts[barcodeToDelete] = Math.max((newCounts[barcodeToDelete] || 1) - 1, 0);
          return newCounts;
        });
  
        setRecentBarcodes((prevBarcodes) => prevBarcodes.filter((_, i) => i !== index));
  
        setScanCount((prevCount) => Math.max(prevCount - 1, 0));
      } catch (error) {
        alert("Error deleting barcode:", error);
        console.error("Error deleting barcode:", error);
      }
    }
  };
  

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Select the Assigned Activity"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Select the Assigned Activity</h2>
        <form onSubmit={handleSubmit} className="op-button">
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => handleOpenModal(activity.activity_type)}
            >
              {activity.activity_type.toUpperCase()}
            </button>
          ))}
        </form>
      </Modal>

      {selectedOption && (
        <Modal
          isOpen={true}
          contentLabel={`${
            selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)
          } Modal`}
          className="form"
          overlayClassName="overlay"
        >
          <div>
            <h2 style={{ color: "#0056b3" }}>{selectedOption.toUpperCase()}</h2>
            <div className="grid-container">
              <div className="grid-item">
                Username: <strong>{userName.toUpperCase()}</strong>
              </div>
              <div className="grid-item">
                Login Time:{" "}
                <strong>
                  {new Date(formData.created_at).toLocaleTimeString()}
                </strong>
              </div>
              <div className="grid-item">
                Target/day: <strong>{formData.target_day}</strong>
              </div>
              <div className="grid-item">
                Target Cycle Time: <strong>{targetCycleTime}</strong>
              </div>
              <div className="grid-item">
                Current O/P: <strong>{scanCount}</strong>
              </div>
              <div className="grid-item">
                Current Cycle Time: <strong>{currentCycleTime}</strong>
              </div>
              <div className="grid-item">
                Duration: <strong>{elapsedTime}</strong>
              </div>
            </div>
            <div>
              <input
                type="text"
                value={barcode}
                onChange={handleBarcodeChange}
                onKeyDown={handleScan}
                placeholder="Scan Barcode"
                style={{ width: "30%" }}
              />

              {recentBarcodes.map((code, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="text"
                    value={code}
                    disabled
                    style={{
                      marginTop: "10px",
                      width: "30%",
                      alignItems: "flex-start",
                      marginLeft: "389px",
                      color: barcodeCounts[code] > 1 ? "red" : "black",
                    }}
                  />
                  <div>
                    <FaTrashAlt
                      style={{
                        cursor: "pointer",
                        marginRight: "350px",
                        color: "red",
                      }}
                      onClick={() => handleDeleteBarcode(index)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleExit} className="exit-btn">
              BACK
            </button>
            {loading && <div>Loading...</div>} {/* Loading message */}
          </div>
        </Modal>
      )}
    </>
  );
}

export default Operation;
