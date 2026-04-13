import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ItemList.css';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothing', 'ID/Cards', 'Keys', 'Bags', 'Jewellery', 'Sports', 'Stationery', 'Other'];

const categoryIcons = {
  Electronics: '📱', Books: '📚', Clothing: '👕', 'ID/Cards': '🪪',
  Keys: '🔑', Bags: '🎒', Jewellery: '💍', Sports: '⚽',
  Stationery: '✏️', Other: '📦', All: '🔍'
};

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category, search, page]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/stats`);
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (type) params.type = type;
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`, { params });
      setItems(res.data.items);
      setTotalPages(res.data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTypeFilter = (t) => {
    setType(t === type ? '' : t);
    setPage(1);
  };

  const handleCategoryFilter = (c) => {
    setCategory(c);
    setPage(1);
  };

  return (
    <div className="item-list-page">
      {/* Hero */}
      <div className="hero">
        <h1>College Lost & Found</h1>
        <p>AI-powered matching to reunite you with your belongings</p>
        <div className="stats-row">
          <div className="stat-pill lost">🔴 {stats.totalLost} Lost</div>
          <div className="stat-pill found">🟢 {stats.totalFound} Found</div>
          <div className="stat-pill resolved">✅ {stats.resolved} Resolved</div>
        </div>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by item name, location..."
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="type-filters">
          <button
            className={`type-btn lost-btn ${type === 'lost' ? 'active' : ''}`}
            onClick={() => handleTypeFilter('lost')}
          >
            🔴 Lost Items
          </button>
          <button
            className={`type-btn found-btn ${type === 'found' ? 'active' : ''}`}
            onClick={() => handleTypeFilter('found')}
          >
            🟢 Found Items
          </button>
        </div>

        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(cat)}
            >
              {categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="loading">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found. <Link to="/post">Report one?</Link></p>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {items.map(item => (
              <Link to={`/items/${item._id}`} key={item._id} className="item-card">
                <div className={`item-type-badge ${item.type}`}>
                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                </div>
                {item.imageUrl && (
                  <div className="item-image">
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                )}
                <div className="item-body">
                  <div className="item-category">
                    {categoryIcons[item.category]} {item.category}
                  </div>
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-meta">
                    <span>📍 {item.location}</span>
                    <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  {item.matches?.length > 0 && (
                    <div className="ai-match-badge">
                      🤖 {item.matches.length} AI Match{item.matches.length > 1 ? 'es' : ''}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemList;
