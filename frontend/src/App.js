import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Anq from './components/Anq';
import AnswerSurvey from './components/AnswerSurvey';
import SurveyResults from './components/SurveyResults';
import Prizes from './components/Prizes';
import SignIn from './components/SignIn';
import Welcome from './components/Welcome';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            {/* パブリックページ */}
            <Route path="/welcome" element={<Welcome />} />
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
              path="/prizes"
              element={
                <PrivateRoute>
                  <Prizes />
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
            <Route
              path="/survey-results/:surveyId"
              element={
                <PrivateRoute>
                  <SurveyResults />
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





