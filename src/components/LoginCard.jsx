import React, { useState } from "react";
import './LoginCard.css';
import Inputicon from "./Inputicon";
import mail from "../assets/mail.png";
import pswd from "../assets/pwd.png";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function LoginCard() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!fullName || !password) {
            setError('Invalid Username or passowrd');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://192.168.1.172:5000/login', {
                fullName,
                password
            });

            if (response.status === 200) {
                const { user } = response.data;
                localStorage.setItem('userRole', user.role); 
                localStorage.setItem('userId', user.id); 
                navigate("/Dashboard");
                setError('');
                setFullName('');
                setPassword('');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Invalid full name or password');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();  
        handleLogin(); 
    };

    const handlePasswordVisibilityChange = (event) => {
        setPasswordVisible(event.target.checked);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="logincard">
                <div className="logincard_data">
                    <img src={logo} alt="logo" style={{height:"80px", width:"150px", marginLeft:"150px"}} />

                    <div className="logincard_main">
                        <h4>Login into your account</h4>

                        <Inputicon 
                            text="Username" 
                            image={mail} 
                            placeholder="Enter your Username" 
                            type="text"
                            aria-label="Username"
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                        />

                        <div className="password-container">
                            <Inputicon 
                                text="Password" 
                                image={pswd} 
                                placeholder="Enter your Password" 
                                type={passwordVisible ? "text" : "password"}
                                aria-label="Password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <div className="password-checkbox">
                                <input 
                                    type="checkbox" 
                                    id="showPassword" 
                                    placeholder=""
                                    checked={passwordVisible}
                                    onChange={handlePasswordVisibilityChange}
                                />
                                <label style={{marginLeft:"-423px",marginTop:"0.5px"}} htmlFor="showPassword">Show password</label>
                            </div>
                        </div>

                        <a className="forgot_link" href="#">Forgot Password?</a>

                        <button 
                            type="submit" 
                            className="logincard_loginbtn" 
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login Now'}
                        </button>
                        
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                </div>
            </div>
        </form>
    );
}

export default LoginCard;
