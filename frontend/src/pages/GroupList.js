import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './GroupList.css';

const GroupList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchAllGroups();
    if (user) fetchMyGroups();
    else setLoading(false);
  }, [user]);

  const fetchAllGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`);
      setAllGroups(res.data);
    } catch (error) {
      console.error('Fetch all groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups/my-groups`);
      setMyGroups(res.data);
    } catch (error) {
      console.error('Fetch my groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/invite/${joinCode.trim()}/join`);
      navigate(`/groups/${res.data.groupId}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid code';
      if (msg === 'Already a member') {
        navigate(`/groups/${error.response.data.groupId}`);
      } else {
        alert(msg);
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="group-list-page">
      <div className="hero-section">
        <h1>College Connect</h1>
        <p className="hero-subtitle">Collaborate. Schedule. Compete.</p>
      </div>

      <div className="home-grid">
        {/* Join by Code */}
        <div className="home-card join-card">
          <div className="home-card-icon">🔑</div>
          <h2>Join a Group</h2>
          <p>Enter the invite code shared by your mentor or group admin.</p>
          <form onSubmit={handleJoinByCode} className="join-code-form">
            <input
              type="text"
              placeholder="Enter group code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="join-code-input"
              maxLength={8}
            />
            <button type="submit" className="btn btn-primary" disabled={joining}>
              {joining ? 'Joining...' : 'Join'}
            </button>
          </form>
        </div>

        {/* Create Group */}
        <div className="home-card create-card">
          <div className="home-card-icon">➕</div>
          <h2>Create a Group</h2>
          <p>Start a new study group, set tasks, and invite your peers.</p>
          {user ? (
            <Link to="/create-group" className="btn btn-primary">Create Group</Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Login to Create</Link>
          )}
        </div>
      </div>

      {/* My Groups */}
      <div className="my-groups-section">
        <h2>My Groups</h2>
        {!user ? (
          <div className="empty-state">
            <p><Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link> to see your groups</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading...</div>
        ) : myGroups.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined any groups yet. Enter a code or create one above.</p>
          </div>
        ) : (
          <div className="groups-grid">
            {myGroups.map(group => (
              <div key={group._id} className="group-card" onClick={() => navigate(`/groups/${group._id}`)}>
                <div className="group-header">
                  <h3>{group.name}</h3>
                </div>
                <p className="group-description">{group.description}</p>
                {group.skills && group.skills.length > 0 && (
                  <div className="skills-tags">
                    {group.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="group-stats">
                  <span className="stat">
                    <span className="stat-icon">👥</span>
                    {group.members?.length || 0} members
                  </span>
                  <span className="stat">
                    <span className="stat-icon">👤</span>
                    {group.creatorId?.name || 'Unknown'}
                  </span>
                </div>
                <div className="group-actions">
                  <Link
                    to={`/groups/${group._id}`}
                    className="btn btn-primary"
                    onClick={e => e.stopPropagation()}
                  >
                    Open Group
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Groups */}
      <div className="all-groups-section">
        <h2>All Groups</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : allGroups.length === 0 ? (
          <div className="empty-state">
            <p>No groups created yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="groups-grid">
            {allGroups.map(group => {
              const isMember = user && myGroups.some(g => g._id === group._id);
              return (
                <div key={group._id} className="group-card" onClick={() => navigate(`/groups/${group._id}`)}>
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    {isMember && <span className="member-badge">Member</span>}
                  </div>
                  <p className="group-description">{group.description}</p>
                  {group.skills && group.skills.length > 0 && (
                    <div className="skills-tags">
                      {group.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
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
                    <Link
                      to={`/groups/${group._id}`}
                      className="btn btn-secondary"
                      onClick={e => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;
