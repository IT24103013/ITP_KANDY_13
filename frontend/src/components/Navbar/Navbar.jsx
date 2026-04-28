import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-logo">Samarasinghe Motors</Link>
            </div>
            <ul className="nav-links">

                {user && user.token ? (
                    <>

                        <li>
                            <Link to={user.role?.toUpperCase() === 'ADMIN' ? '/admin-dashboard' : '/customer-dashboard'} className="nav-item">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="login-btn nav-logout-btn">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/login" className="login-btn">
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;