import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ItemList from './pages/ItemList';
import ItemDetail from './pages/ItemDetail';
import PostItem from './pages/PostItem';
import MyItems from './pages/MyItems';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ItemList />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/post" element={<PrivateRoute><PostItem /></PrivateRoute>} />
              <Route path="/my-items" element={<PrivateRoute><MyItems /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
