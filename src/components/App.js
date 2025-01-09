import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import './App.css';
import Login from './Login';

import Home from './Home';

import Activity from './Activity';
import Dashboard from "./Dashboard";
import Operation from "./Operation";

function App() {
  const location = useLocation();

  return (
    <div className="app">
      {location.pathname !== '/' && location.pathname !== '/Signup' }
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/home" element={<Home />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Operation" element={<Operation />} /> 
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;