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
  }, [user]);

  const fetchAllGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`);
      setAllGroups(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups/my-groups`);
      setMyGroups(res.data);
    } catch (error) {
      console.error(error);
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
      if (msg === 'Already a member') navigate(`/groups/${error.response.data.groupId}`);
      else alert(msg);
    } finally {
      setJoining(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}/join`);
      fetchAllGroups();
      fetchMyGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join');
    }
  };

  const myGroupIds = new Set(myGroups.map(g => g._id));

  return (
    <div className="feed-layout">

      {/* LEFT SIDEBAR */}
      <aside className="feed-sidebar">
        <div className="sidebar-logo">🎓 College Connect</div>

        <nav className="sidebar-nav">
          {user ? (
            <Link to="/create-group" className="sidebar-btn sidebar-btn-primary">
              ➕ Create Group
            </Link>
          ) : (
            <Link to="/login" className="sidebar-btn sidebar-btn-primary">
              🔑 Login to Create
            </Link>
          )}
        </nav>

        <div className="sidebar-section">
          <h3>Join by Code</h3>
          <form onSubmit={handleJoinByCode} className="sidebar-join-form">
            <input
              type="text"
              placeholder="Enter group code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="sidebar-input"
              maxLength={8}
            />
            <button type="submit" className="sidebar-btn sidebar-btn-secondary" disabled={joining}>
              {joining ? 'Joining...' : 'Join'}
            </button>
          </form>
        </div>

        {user && myGroups.length > 0 && (
          <div className="sidebar-section">
            <h3>My Groups</h3>
            <ul className="sidebar-my-groups">
              {myGroups.map(group => (
                <li key={group._id}>
                  <Link to={`/groups/${group._id}`} className="sidebar-group-link">
                    <span className="sidebar-group-dot" />
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* MAIN FEED */}
      <main className="feed-main">
        <div className="feed-header">
          <h1>Discover Study Groups</h1>
          <p>Find groups, learn new skills, and collaborate with peers</p>
        </div>

        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : allGroups.length === 0 ? (
          <div className="empty-state">
            <p>No groups yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="feed-posts">
            {allGroups.map(group => {
              const isMember = myGroupIds.has(group._id);
              return (
                <article key={group._id} className="feed-post">
                  <div className="post-top">
                    <div className="post-avatar">
                      {group.creatorId?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="post-meta">
                      <span className="post-author">{group.creatorId?.name || 'Unknown'}</span>
                      <span className="post-time">
                        {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {isMember && <span className="post-member-badge">✓ Member</span>}
                  </div>

                  <h2 className="post-title">{group.name}</h2>
                  <p className="post-description">{group.description}</p>

                  {group.skills && group.skills.length > 0 && (
                    <div className="post-skills">
                      <span className="skills-label">🎯 Skills you'll learn:</span>
                      <div className="skills-tags">
                        {group.skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="post-footer">
                    <div className="post-stats">
                      <span>👥 {group.memberCount || group.members?.length || 0} members</span>
                    </div>
                    <div className="post-actions">
                      <Link to={`/groups/${group._id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                      {isMember ? (
                        <Link to={`/groups/${group._id}`} className="btn btn-primary btn-sm">
                          Open Group →
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group._id)}
                          className="btn btn-primary btn-sm"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupList;
