import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="dashboard">
      {/* sidebar */}
      <div className="sidebar">
        <div className="logo-area">
          <div className="logo-icon"><i className="fas fa-car-side"></i></div>
          <span className="logo-text">DARKDRIVE</span>
        </div>
        <div className="nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <i className="fas fa-th-large"></i> <span>Overview</span>
          </Link>
          <Link to="/sales" className={`nav-item ${location.pathname.includes('/sales') && !location.pathname.includes('/admin') ? 'active' : ''}`}>
            <i className="fas fa-tag"></i> <span>Sales</span> <span className="badge-vehicle">New</span>
          </Link>
          <Link to="/admin/inquiries" className={`nav-item ${location.pathname.includes('/admin') ? 'active' : ''}`}>
            <i className="fas fa-envelope"></i> <span>Inquiries</span>
          </Link>
        </div>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar"></div>
            <div className="user-info">
              <h4>System User</h4>
              <span>user@darkdrive</span>
            </div>
            <i className="fas fa-ellipsis-v" style={{ color: '#555e77', fontSize: '0.9rem', marginLeft: 'auto' }}></i>
          </div>
        </div>
      </div>

      {/* content of page */}
      <div className="main">
        {/* Top Header */}
        <div className="header-bar">
          <div className="page-title">
            <h1>Vehicle Sales</h1>
            <p>Browse, negotiate, and purchase your dream vehicle</p>
          </div>
          <div className="search-area">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search model, brand..." />
            </div>
            <div className="action-icons">
              <div><i className="far fa-bell"></i></div>
            </div>
          </div>
        </div>

        {/* page content browsing */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;