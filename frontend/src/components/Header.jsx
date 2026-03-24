import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const getUserInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <header className='header'>
      <div className='container'>
        <div className='logo'>
          <Link to='/'>Currency Converter</Link>
        </div>
        <nav className='nav'>
          <ul className='nav-links'>
            <li>
              <Link to='/'>Главная</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to='/converter'>Конвертер</Link>
                </li>
                <li className='profile-menu-item'>
                  <Link to='/profile' className='profile-link'>
                    <div className='profile-avatar-container'>
                      <div className='profile-initials-avatar'>
                        {getUserInitials()}
                      </div>
                      <span className='profile-username'>{user?.username || 'User'}</span>
                    </div>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to='/login' className='btn-login'>
                    Вход
                  </Link>
                </li>
                <li>
                  <Link to='/register' className='btn-register'>
                    Регистрация
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;