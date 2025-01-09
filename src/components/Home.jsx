import React, { useState, useEffect } from "react";
import axios from 'axios';
import './Home.css';
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Operation from "./Operation";

function Home() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        mobile_number: '',
        email: '',
        role: '',
        department: '',
        status: 'Active',
        password: '' 
    });

    const [userRole, setUserRole] = useState(''); 

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole') || ''; 
        setUserRole(storedRole);

        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://192.168.1.172:5000/users');
            console.log(response.data); 
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const openModal = () => {
        if (userRole !== 'admin') {
            alert('Only admins can add new users.');
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { 
        setIsModalOpen(false);
    };

    const openEditModal = (user) => {
        if (userRole !== 'admin') {
            alert('Only admins can edit users.');
            return;
        }

        setEditingUser(user.id);
        setFormData({
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            email: user.email,
            role: user.role,
            department: user.department,
            status: user.status
        });

        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleNewUserSubmit = async (e) => {
        e.preventDefault();
    
        if (userRole !== 'admin') {
            alert('Only admins can add users.');
            return;
        }
    
        try {
            await axios.post(`http://192.168.1.172:5000/users`, formData);
            await fetchUsers();
            setIsModalOpen(false); 
            alert('User added successfully');
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user. Please try again.');
        }
    };

    const handleDelete = async (userId) => {
        if (userRole !== 'admin') {
            alert('Only admins can delete users.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://192.168.1.172:5000/users/${userId}`);
                fetchUsers();
                alert('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://192.168.1.172:5000/users/${editingUser}`, formData);
            alert('User updated successfully');
            closeEditModal(); // Close edit modal after successful update
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
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
        <div className="body">
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
              
            <main>
                <div className="user-management">
                    <h2 style={{color:"#0056b3"}}>User Management</h2>
                    <div className="user-stats">
                        <span style={{marginRight:"20px"}}>Users: {users.length}</span>
                        <span>Departments: 10</span>
                        <div className="actions">
                            <button className="btn-new-user" onClick={openModal}>New User</button>
                        </div>
                    </div>

                    <table className="user-table"> 
                        <thead>
                            <tr>
                                <th><input type="checkbox" /></th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td><input type="checkbox" /></td>
                                    <td>{user.full_name}</td>
                                    <td>{user.role}</td>
                                    <td>{user.department}</td>
                                    <td>{user.email}</td>
                                    <td className={user.status === 'Active' ? 'status-active' : 'status-inactive'}>
                                        {user.status}
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openEditModal(user)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(user.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {isEditModalOpen && (
                        <div className="popup">
                            <div className="popup_content">
                                <h2>Edit User</h2>
                                <form onSubmit={handleEditSubmit}>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" required />
                                    <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Mobile Number" required />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                                    <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Role" />
                                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-update">Update</button>
                                        <button type="button" className="btn-cancel" onClick={closeEditModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isModalOpen && (
                        <div className="popup">
                            <div className="popup_content">
                                <h2>Add New User</h2>
                                <form onSubmit={handleNewUserSubmit}>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" required />
                                    <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Mobile Number" required />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                                    <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Role" />
                                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-save">Save</button>
                                        <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Operation
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
            />
        </div>
    );
}

export default Home;
