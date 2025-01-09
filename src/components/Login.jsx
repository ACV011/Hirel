import React from "react";
import './Login.css';
import LoginCard from "./LoginCard";

function Login(){
    return(
        <div className="login">
            <div className="login_left">
            
            </div>

            <div className="login_right">
                <LoginCard />
            </div>
        </div>
    );
}

export default Login;