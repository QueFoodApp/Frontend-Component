// general import statments 
import React, { useState } from "react";
import "./Login.css";
import Home from "../Home/Home";

function Login() {

    // define variables to store username and password 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // toggle visibility of the password 
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status

    // function to handle form submission (i.e., login request)
    const handleLogin = (e) => {

        // prevent refreshing the page when submit the form 
        e.preventDefault();
        
        // connect backend API here, the if statement below is used for component testing
        if (username && password) {
            setIsLoggedIn(true); 
        }
    };

    // component testing purpose 
    if (isLoggedIn) {
        return <Home />;
    }

    // user interface for merchant login page 
    return (
        <div className="login-container">
            <div className="login-left">
                <h1>WELCOME</h1>
                <p>TO</p>
                <h2>QUE</h2>
                <p>FOODHALL</p>
            </div>

            <div className="login-right">
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="username"> Enter Username: </label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Phone Number / Email"/>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password"> Enter Password: </label>
                        <div className="password-container">
                            <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                            <button type="button" className="toggle-password" onClick={togglePasswordVisibility}> {showPassword ? "Hide" : "Show"} </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button"> Log In </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
