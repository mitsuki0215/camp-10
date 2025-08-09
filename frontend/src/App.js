import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Anq from './components/Anq';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import EmailVerificationSuccess from './components/EmailVerificationSuccess';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/email-verified" element={<EmailVerificationSuccess />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <ProfileEdit />
            </PrivateRoute>
          } />
          <Route path="/anq" element={
            <PrivateRoute>
              <Anq />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
