import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Anq from './components/Anq';
import AnswerSurvey from './components/AnswerSurvey';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
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
