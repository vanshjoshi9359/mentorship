import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import GroupList from './pages/GroupList';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
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
                  <Route path="/" element={<Navigate to="/groups" replace />} />
                  <Route path="/groups" element={<GroupList />} />
                  <Route path="/groups/:id" element={<GroupDetail />} />
                  <Route path="/create-group" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/groups" />} />
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
