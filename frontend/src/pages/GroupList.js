import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './GroupList.css';

const GroupList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchGroups();
    if (user) {
      fetchMyGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Fetch groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups/my-groups`);
      setMyGroups(response.data);
    } catch (error) {
      console.error('Fetch my groups error:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}/join`);
      fetchGroups();
      fetchMyGroups();
    } catch (error) {
      console.error('Join group error:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const displayGroups = activeTab === 'all' ? groups : myGroups;

  if (loading) return <div className="loading">Loading groups...</div>;

  return (
    <div className="group-list-page">
      <div className="hero-section">
        <h1>College Connect</h1>
        <p className="hero-subtitle">Join collaborative learning groups, complete tasks, and compete with peers</p>
        {user && (
          <Link to="/create-group" className="btn btn-primary btn-large">
            + Create New Group
          </Link>
        )}
        {!user && (
          <Link to="/login" className="btn btn-primary btn-large">
            Login to Get Started
          </Link>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Groups ({groups.length})
        </button>
        {user && (
          <button
            className={`tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Groups ({myGroups.length})
          </button>
        )}
      </div>

      {displayGroups.length === 0 ? (
        <div className="empty-state">
          <p>
            {activeTab === 'my'
              ? "You haven't joined any groups yet"
              : 'No groups available'}
          </p>
        </div>
      ) : (
        <div className="groups-grid">
          {displayGroups.map(group => {
            const isMember = user && group.members?.some(
              m => m.userId._id === user._id || m.userId === user._id
            );

            return (
              <div key={group._id} className="group-card">
                <div className="group-header">
                  <h3>{group.name}</h3>
                </div>
                <p className="group-description">{group.description}</p>
                <div className="group-stats">
                  <span className="stat">
                    <span className="stat-icon">👥</span>
                    {group.memberCount || group.members?.length || 0} members
                  </span>
                  <span className="stat">
                    <span className="stat-icon">👤</span>
                    {group.creatorId?.name || 'Unknown'}
                  </span>
                </div>
                <div className="group-actions">
                  <Link to={`/groups/${group._id}`} className="btn btn-secondary">
                    View Details
                  </Link>
                  {!isMember && user && (
                    <button
                      onClick={() => handleJoinGroup(group._id)}
                      className="btn btn-primary"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupList;
