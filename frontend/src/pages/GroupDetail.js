import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import './GroupDetail.css';

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({ whatTried: '', problem: '' });
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [resolutionInputs, setResolutionInputs] = useState({});
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 10
  });

  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, tasksRes, leaderboardRes, messagesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/groups/${id}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/group/${id}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/groups/${id}/leaderboard`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/messages/group/${id}`)
      ]);
      setGroup(groupRes.data);
      setTasks(tasksRes.data);
      setLeaderboard(leaderboardRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${id}/join`);
      // Refresh the page to update membership status
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${id}/leave`);
      navigate('/groups');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleCopyInvite = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${id}/invite`);
      const inviteUrl = `${window.location.origin}/join/${res.data.inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      alert('Invite link copied to clipboard!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate invite link');
    }
  };

  const [showCode, setShowCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const fetchJoinRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups/${id}/join-requests`);
      setJoinRequests(res.data);
    } catch (error) {
      console.error('Fetch requests error:', error);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${id}/handle-request`, {
        requestId, action
      });
      setJoinRequests(res.data.pending);
      if (action === 'accept') fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to handle request');
    }
  };

  const handleShowCode = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/${id}/invite`);
      setInviteCode(res.data.inviteCode);
      setShowCode(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate code');
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/invite/${joinCode.trim()}/join`);
      alert('Joined successfully!');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid code');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        ...taskForm,
        groupId: id
      });
      setTaskForm({ title: '', description: '', dueDate: '', points: 10 });
      setShowTaskForm(false);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/complete`);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleUncompleteTask = async (taskId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/uncomplete`);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to uncomplete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!discussionForm.whatTried.trim() || !discussionForm.problem.trim()) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, {
        groupId: id,
        whatTried: discussionForm.whatTried,
        problem: discussionForm.problem
      });
      setDiscussionForm({ whatTried: '', problem: '' });
      setShowDiscussionForm(false);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to post discussion');
    }
  };

  const handleResolveMessage = async (messageId) => {
    const resolution = resolutionInputs[messageId];
    if (!resolution?.trim()) {
      alert('Please enter a resolution');
      return;
    }
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/messages/${messageId}/resolve`, {
        resolution
      });
      setResolutionInputs(prev => ({ ...prev, [messageId]: '' }));
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve discussion');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/messages/${messageId}`);
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete message');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!group) return <div className="error">Group not found</div>;

  // Check membership
  let isMember = false;
  let isAdmin = false;
  
  if (user && group.members && group.members.length > 0) {
    isMember = group.members.some(member => {
      const memberId = member.userId?._id || member.userId;
      const userId = user._id || user.id;
      return String(memberId) === String(userId);
    });
    
    if (isMember) {
      isAdmin = group.members.some(member => {
        const memberId = member.userId?._id || member.userId;
        const userId = user._id || user.id;
        return String(memberId) === String(userId) && member.role === 'admin';
      });
    }
  }

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 31);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="group-detail-page">
      <div className="group-header-section">
        <div className="group-info">
          <h1>{group.name}</h1>
          <p className="group-description">{group.description}</p>
          <div className="group-meta">
            <span className="meta-item">
              <span className="meta-icon">👥</span>
              {group.members.length} / {group.maxMembers} members
            </span>
            <span className="meta-item">
              <span className="meta-icon">👤</span>
              Created by {group.creatorId.name}
            </span>
          </div>
        </div>
        <div className="group-actions">
          {!user && (
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Login to Join
            </button>
          )}
          {user && !isMember && (
            <span className="not-member-hint">Request to join from the home page</span>
          )}
          {isMember && !isAdmin && (
            <button onClick={handleLeaveGroup} className="btn btn-secondary">
              Leave Group
            </button>
          )}
          {isAdmin && (
            <button onClick={handleShowCode} className="btn btn-secondary">
              🔑 Group Code
            </button>
          )}
        </div>
      </div>

      {!isMember && user && (
        <div className="join-prompt">
          <div className="join-prompt-content">
            <h2>👋 Join this group to get started!</h2>
            <p>Have an invite code? Enter it below to join instantly.</p>
            <form onSubmit={handleJoinByCode} className="join-code-form">
              <input
                type="text"
                placeholder="Enter group code (e.g. a3f8c2d1)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="join-code-input"
                maxLength={8}
              />
              <button type="submit" className="btn btn-primary">Join with Code</button>
            </form>
          </div>
        </div>
      )}

      {showCode && (
        <div className="task-modal-overlay" onClick={() => setShowCode(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h3>🔑 Group Invite Code</h3>
              <button className="modal-close-btn" onClick={() => setShowCode(false)}>✕</button>
            </div>
            <div className="task-modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Share this code with people you want to invite. They can enter it on the group page to join.
              </p>
              <div className="invite-code-display">
                {inviteCode}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => { navigator.clipboard.writeText(inviteCode); alert('Code copied!'); }}
              >
                📋 Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {isMember && (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              📋 Tasks ({tasks.length})
            </button>
            <button
              className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              📅 Calendar
            </button>
            <button
              className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              🏆 Leaderboard
            </button>
            <button
              className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              💬 Discussion ({messages.length})
            </button>
            <button
              className={`tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👥 Members ({group.members.length})
            </button>
            {isAdmin && (
              <button
                className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => { setActiveTab('requests'); fetchJoinRequests(); }}
              >
                📬 Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
              </button>
            )}
          </div>

          {activeTab === 'tasks' && (
            <div className="tasks-section">
              <div className="section-header">
                <h2>Tasks</h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="btn btn-primary btn-sm"
                  >
                    {showTaskForm ? 'Cancel' : '+ Add Task'}
                  </button>
                )}
              </div>

              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="task-form">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    required
                    rows="3"
                  />
                  <div className="form-row">
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Points"
                      value={taskForm.points}
                      onChange={(e) => setTaskForm({ ...taskForm, points: e.target.value })}
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </form>
              )}

              {tasks.length === 0 ? (
                <div className="empty-state">No tasks yet. Create one to get started!</div>
              ) : (
                <div className="tasks-list">
                  {tasks.map(task => {
                    const isCompleted = task.completions.some(c => c.userId._id === user._id);
                    const dueDate = new Date(task.dueDate);
                    const isOverdue = dueDate < new Date() && !isCompleted;

                    return (
                      <div key={task._id} className={`task-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                        <div className="task-header">
                          <h3>{task.title}</h3>
                          <div className="task-actions">
                            <span className="points-badge">{task.points} pts</span>
                            {(isAdmin || task.createdBy._id === user._id) && (
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="btn-icon"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className="due-date">
                            📅 Due: {dueDate.toLocaleDateString()}
                          </span>
                          <span className="completions">
                            ✅ {task.completions.length} completed
                          </span>
                        </div>
                        <div className="task-action-btn">
                          {isCompleted ? (
                            <button
                              onClick={() => handleUncompleteTask(task._id)}
                              className="btn btn-secondary btn-sm"
                            >
                              Mark Incomplete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCompleteTask(task._id)}
                              className="btn btn-primary btn-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="calendar-section">
              <h2>📅 Task Calendar</h2>
              <Calendar
                tasks={tasks}
                onDateClick={(date) => {
                  const dateTasks = tasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return (
                      taskDate.getDate() === date.getDate() &&
                      taskDate.getMonth() === date.getMonth() &&
                      taskDate.getFullYear() === date.getFullYear()
                    );
                  });
                  if (dateTasks.length > 0) {
                    setSelectedTask(dateTasks[0]);
                    setShowTaskModal(true);
                  }
                }}
                onTaskClick={(task) => {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }}
              />
              
              {showTaskModal && selectedTask && (
                <div className="task-modal-overlay" onClick={() => setShowTaskModal(false)}>
                  <div className="task-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="task-modal-header">
                      <h3>{selectedTask.title}</h3>
                      <button
                        className="modal-close-btn"
                        onClick={() => setShowTaskModal(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="task-modal-body">
                      <p className="task-modal-description">{selectedTask.description}</p>
                      <div className="task-modal-meta">
                        <div className="meta-row">
                          <span className="meta-label">Due Date:</span>
                          <span className="meta-value">
                            {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-label">Points:</span>
                          <span className="meta-value">{selectedTask.points} pts</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-label">Completed by:</span>
                          <span className="meta-value">
                            {selectedTask.completions.length} member{selectedTask.completions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="task-modal-actions">
                        {selectedTask.completions.some(c => c.userId._id === user._id) ? (
                          <button
                            onClick={() => {
                              handleUncompleteTask(selectedTask._id);
                              setShowTaskModal(false);
                            }}
                            className="btn btn-secondary"
                          >
                            Mark Incomplete
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleCompleteTask(selectedTask._id);
                              setShowTaskModal(false);
                            }}
                            className="btn btn-primary"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="leaderboard-section">
              <h2>🏆 Leaderboard</h2>
              {leaderboard.length === 0 ? (
                <div className="empty-state">No activity yet. Complete tasks to earn points!</div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.userId} className={`leaderboard-item rank-${index + 1}`}>
                      <div className="rank">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{entry.user.name}</span>
                        <span className="user-stats">
                          {entry.tasksCompleted} tasks completed
                        </span>
                      </div>
                      <div className="points">{entry.points} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="discussion-section">
              <div className="section-header">
                <h2>💬 Discussions</h2>
                {isMember && (
                  <button
                    onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                    className="btn btn-primary btn-sm"
                  >
                    {showDiscussionForm ? 'Cancel' : '+ New Discussion'}
                  </button>
                )}
              </div>

              {showDiscussionForm && (
                <form onSubmit={handleSendMessage} className="discussion-form">
                  <div className="discussion-form-header">
                    <span className="form-label-icon">📋</span>
                    <h3>Post a Discussion</h3>
                  </div>
                  <div className="form-group">
                    <label>What did you try?</label>
                    <textarea
                      placeholder="Describe what you have already tried to solve this..."
                      value={discussionForm.whatTried}
                      onChange={(e) => setDiscussionForm({ ...discussionForm, whatTried: e.target.value })}
                      required
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>What problem are you facing?</label>
                    <textarea
                      placeholder="Describe the problem clearly..."
                      value={discussionForm.problem}
                      onChange={(e) => setDiscussionForm({ ...discussionForm, problem: e.target.value })}
                      required
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Post Discussion</button>
                </form>
              )}

              <div className="discussions-list">
                {!messages || messages.length === 0 ? (
                  <div className="empty-state">No discussions yet. Be the first to post!</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className={`discussion-card ${msg.isResolved ? 'resolved' : 'open'}`}>
                      <div className="discussion-card-header">
                        <div className="discussion-meta">
                          <span className="discussion-author">{msg.userId?.name}</span>
                          <span className="discussion-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="discussion-status">
                          {msg.isResolved ? (
                            <span className="status-badge resolved">✅ Resolved</span>
                          ) : (
                            <span className="status-badge open">🔓 Open</span>
                          )}
                          {user && msg.userId?._id === user._id && !msg.isResolved && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="btn-icon"
                              title="Delete"
                            >🗑️</button>
                          )}
                        </div>
                      </div>

                      <div className="discussion-body">
                        <div className="discussion-field">
                          <span className="field-label">🔧 What I tried:</span>
                          <p>{msg.whatTried}</p>
                        </div>
                        <div className="discussion-field">
                          <span className="field-label">❓ Problem:</span>
                          <p>{msg.problem}</p>
                        </div>
                      </div>

                      {msg.isResolved && (
                        <div className="resolution-box">
                          <span className="field-label">✅ Resolution by {msg.resolvedBy?.name}:</span>
                          <p>{msg.resolution}</p>
                          <span className="resolution-date">
                            Resolved on {new Date(msg.resolvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {isAdmin && !msg.isResolved && (
                        <div className="resolve-form">
                          <textarea
                            placeholder="Write your resolution here..."
                            value={resolutionInputs[msg._id] || ''}
                            onChange={(e) => setResolutionInputs(prev => ({ ...prev, [msg._id]: e.target.value }))}
                            rows="2"
                          />
                          <button
                            onClick={() => handleResolveMessage(msg._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="members-section">
              <h2>👥 Members</h2>
              <div className="members-list">
                {group.members.map(member => (
                  <div key={member.userId._id} className="member-item">
                    <div className="member-info">
                      <span className="member-name">{member.userId.name}</span>
                      {member.role === 'admin' && (
                        <span className="admin-badge">Admin</span>
                      )}
                    </div>
                    <span className="join-date">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'requests' && isAdmin && (
            <div className="requests-section">
              <h2>📬 Join Requests</h2>
              {joinRequests.length === 0 ? (
                <div className="empty-state">No pending join requests.</div>
              ) : (
                <div className="requests-list">
                  {joinRequests.map(req => (
                    <div key={req._id} className="request-item">
                      <div className="request-info">
                        <div className="request-avatar">
                          {req.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="request-name">{req.userId?.name}</div>
                          <div className="request-email">{req.userId?.email}</div>
                          <div className="request-time">
                            {new Date(req.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleJoinRequest(req._id, 'accept')}
                          className="btn btn-primary btn-sm"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleJoinRequest(req._id, 'reject')}
                          className="btn btn-secondary btn-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupDetail;
