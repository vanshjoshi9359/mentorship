import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Feed from './pages/Feed';
import ShareStory from './pages/ShareStory';
import StoryDetail from './pages/StoryDetail';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="174400663895-obo6oq541202kei3p3ah8dlurvjp8olp.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="app-layout-full">
              <main className="main-content-full">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Feed />} />
                  <Route path="/stories/:id" element={<StoryDetail />} />
                  <Route path="/share" element={<PrivateRoute><ShareStory /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
