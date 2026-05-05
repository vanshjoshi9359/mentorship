import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Stories.css";

const BATCH_FILTERS = ["All", "2024", "2025", "2026", "2027"];

const CompanyLogo = ({ story }) => {
  const [src, setSrc] = React.useState(story.logoUrl || "");
  const letter = story.company?.[0]?.toUpperCase();
  const handleError = () => {
    if (story.logoUrl && src === story.logoUrl) {
      const domain = story.logoUrl.replace("https://logo.clearbit.com/", "");
      setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    } else {
      setSrc("");
    }
  };
  return (
    React.createElement("div", { className: "company-logo" },
      src
        ? React.createElement("img", { src: src, alt: story.company, onError: handleError })
        : React.createElement("span", null, letter)
    )
  );
};

const SkeletonCard = () =>
  React.createElement("div", { className: "story-card-skeleton" },
    React.createElement("div", { className: "skel-top" },
      React.createElement("div", { className: "skel skel-logo" }),
      React.createElement("div", { className: "skel-info" },
        React.createElement("div", { className: "skel skel-title" }),
        React.createElement("div", { className: "skel skel-sub" })
      )
    ),
    React.createElement("div", { className: "skel-badges" },
      React.createElement("div", { className: "skel skel-badge" }),
      React.createElement("div", { className: "skel skel-badge" })
    ),
    React.createElement("div", { className: "skel skel-line" }),
    React.createElement("div", { className: "skel skel-line skel-short" })
  );

const Stories = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (searchQuery) params.company = searchQuery;
      if (batchFilter !== "All") params.batch = batchFilter;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories`, { params });
      setStories(res.data.stories || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      console.error("Failed to fetch stories", e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, batchFilter]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearchQuery(searchInput); };
  const handleBatchFilter = (b) => { setBatchFilter(b); setPage(1); };

  return (
    React.createElement("div", { className: "stories-page" },
      React.createElement("div", { className: "stories-header" },
        React.createElement("div", { className: "stories-header-left" },
          React.createElement("h1", null, "Placement Stories"),
          React.createElement("p", null, "Learn from seniors who have been through it")
        ),
        user && React.createElement("button", { onClick: () => navigate("/post-story"), className: "btn btn-primary" }, "+ Share Your Story")
      ),
      React.createElement("div", { className: "search-section" },
        React.createElement("form", { onSubmit: handleSearch, className: "search-bar-wrap" },
          React.createElement("span", { className: "search-icon" }, "🔍"),
          React.createElement("input", { type: "text", value: searchInput, onChange: e => setSearchInput(e.target.value), placeholder: "Search by company name..." }),
          React.createElement("button", { type: "submit", className: "search-btn" }, "Search")
        ),
        React.createElement("div", { className: "filter-chips" },
          BATCH_FILTERS.map(b =>
            React.createElement("button", { key: b, className: `filter-chip ${batchFilter === b ? "active" : ""}`, onClick: () => handleBatchFilter(b) },
              b === "All" ? "All Batches" : `Batch ${b}`
            )
          )
        )
      ),
      loading
        ? React.createElement("div", { className: "stories-grid" }, Array.from({ length: 6 }).map((_, i) => React.createElement(SkeletonCard, { key: i })))
        : stories.length === 0
          ? React.createElement("div", { className: "empty-state" },
              React.createElement("div", { className: "empty-icon" }, "📭"),
              React.createElement("h3", null, "No stories found"),
              React.createElement("p", null, searchQuery ? `No placement stories for "${searchQuery}" yet.` : "Be the first to share your placement journey!"),
              user && React.createElement("button", { onClick: () => navigate("/post-story"), className: "btn btn-primary", style: { marginTop: 16 } }, "Share Your Story")
            )
          : React.createElement(React.Fragment, null,
              React.createElement("div", { className: "stories-grid" },
                stories.map(story =>
                  React.createElement(Link, { to: `/stories/${story._id}`, key: story._id, className: "story-card" },
                    React.createElement("div", { className: "story-card-top" },
                      React.createElement(CompanyLogo, { story }),
                      React.createElement("div", { className: "story-card-meta" },
                        React.createElement("div", { className: "company-name-row" },
                          React.createElement("span", { className: "company-name" }, story.company),
                          story.linkedIn && React.createElement("a", { href: story.linkedIn, target: "_blank", rel: "noopener noreferrer", className: "li-btn", onClick: e => e.stopPropagation() }, "in")
                        ),
                        React.createElement("div", { className: "story-role" }, story.role),
                        React.createElement("div", { className: "story-badges" },
                          story.package && React.createElement("span", { className: "badge-salary" }, `💰 ${story.package}`),
                          React.createElement("span", { className: "badge-batch" }, `�� ${story.batch}`),
                          story.branch && React.createElement("span", { className: "badge-branch" }, story.branch)
                        )
                      )
                    ),
                    React.createElement("div", { className: "story-card-divider" }),
                    React.createElement("div", { className: "story-card-footer" },
                      React.createElement("div", { className: "story-author-avatar" }, story.authorId?.name?.[0]?.toUpperCase()),
                      React.createElement("span", { className: "story-author-name" }, story.authorId?.name),
                      React.createElement("span", { className: "story-likes" }, `👍 ${story.upvotes || 0}`),
                      React.createElement("span", { className: "story-date" }, new Date(story.createdAt).toLocaleDateString())
                    )
                  )
                )
              ),
              totalPages > 1 && React.createElement("div", { className: "pagination" },
                React.createElement("button", { className: "page-btn", disabled: page === 1, onClick: () => setPage(p => p - 1) }, "← Prev"),
                React.createElement("span", { className: "page-info" }, `Page ${page} of ${totalPages}`),
                React.createElement("button", { className: "page-btn", disabled: page === totalPages, onClick: () => setPage(p => p + 1) }, "Next →")
              )
            )
    )
  );
};

export default Stories;
