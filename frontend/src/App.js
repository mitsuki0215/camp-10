import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Anq from './components/Anq';
import AnswerSurvey from './components/AnswerSurvey';
import SignIn from './components/SignIn';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />

            {/* ログイン必須ページ */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <PrivateRoute>
                  <ProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/anq"
              element={
                <PrivateRoute>
                  <Anq />
                </PrivateRoute>
              }
            />
            <Route
              path="/survey/:id"
              element={
                <PrivateRoute>
                  <AnswerSurvey />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;





