import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Activity.css';
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Operation from "./Operation";

function Activity() {
    const [activities, setActivities] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formData, setFormData] = useState({
        activity_type: '',
        assigned_user: [], 
        target_day: '',
        target_cycle_time: '',
    });

    useEffect(() => {
        fetchActivities();
        fetchUsers();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get('http://192.168.1.172:5000/activities');
           
            const sortedActivities = response.data.sort((a, b) => 
                a.activity_type.localeCompare(b.activity_type)
            );
            setActivities(sortedActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://192.168.1.172:5000/users');
            setUsers(response.data.map(user => ({
                value: user.full_name,
                label: user.full_name
            })));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingActivity(null);
        setFormData({
            activity_type: '',
            assigned_user: [],
            target_day: '',
            target_cycle_time: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleUserChange = (selectedOptions) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            assigned_user: selectedOptions.map(option => option.value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingActivity) {
                await axios.put(`http://192.168.1.172:5000/activities/${editingActivity}`, formData);
                alert('Activity updated successfully');
            } else {
                await axios.post('http://192.168.1.172:5000/activities', formData);
                alert('Activity added successfully');
            }

            fetchActivities();
            closeModal();
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Failed to save activity. Please try again.');
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity.id);
        setFormData({
            activity_type: activity.activity_type,
            assigned_user: activity.assigned_user,
            target_day: activity.target_day,
            target_cycle_time: activity.target_cycle_time,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await axios.delete(`http://192.168.1.172:5000/activities/${id}`);
                fetchActivities();
                alert('Activity deleted successfully');
            } catch (error) {
                console.error('Error deleting activity:', error);
                alert('Failed to delete activity. Please try again.');
            }
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://192.168.1.172:5000/logout', {}, { withCredentials: true });
            localStorage.removeItem('userRole');      
            window.location.href = '/';  
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <div className="activity-page">
            <header className="home-header">
                <img src={logo} alt="logo" style={{height:"45px"}}/>
                
                <div className="nav-bar">
                    <a href="/Home" className="nav-btn">User Management</a>
                    <a href="/Activity" className="nav-btn">Activity Management</a>
                    <a href="/Dashboard" className="nav-btn">Dashboard</a>
                    <a href="#" className="nav-btn" onClick={() => setModalIsOpen(true)} style={{color: "#0056b3"}}>Activity</a>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                </button>
            </header>
            <h2 style={{color:"#0056b3"}}>Activity Management</h2>
            <button onClick={openModal} className="btn-new-activity">Add Activity</button>
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Activity Type</th>
                        <th>Assigned User</th>
                        <th>Target/Day</th>
                        <th>Target Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr key={activity.id}>
                            <td>{activity.activity_type}</td>
                            <td>
                                {Array.isArray(activity.assigned_user)
                                    ? activity.assigned_user.join(', ')
                                    : activity.assigned_user}
                            </td>
                            <td>{activity.target_day}</td>
                            <td>{activity.target_cycle_time}</td>
                            <td>
                                <button onClick={() => handleEdit(activity)} className="btn-edit">Edit</button>
                                <button onClick={() => handleDelete(activity.id)} className="btn-delete">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="popup">
                    <div className="popup_content">
                        <h2>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="activity_type"
                                value={formData.activity_type}
                                onChange={handleChange}
                                placeholder="Activity Type"
                                required
                            />
                            <Select
                                isMulti
                                name="assigned_user"
                                options={users}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                value={users.filter(user => formData.assigned_user.includes(user.value))}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                type="text"
                                name="target_day"
                                value={formData.target_day}
                                onChange={handleChange}
                                placeholder="Target/Day" 
                                required
                            />
                            <input
                                type="text"
                                name="target_cycle_time"
                                value={formData.target_cycle_time}
                                onChange={handleChange}
                                placeholder="Target Time"
                                required
                            />
                            <div className="form-actions">
                                <button type="submit" className="btn-save">{editingActivity ? 'Update' : 'Save'}</button>
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <Operation
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
            />
        </div>
    );
}

export default Activity;