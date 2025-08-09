import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Anq from './components/Anq';
import AnswerSurvey from './components/AnswerSurvey';
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
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/anq" element={<Anq />} />
          <Route path="/survey/:id" element={<AnswerSurvey />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
