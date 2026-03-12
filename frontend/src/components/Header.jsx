import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
                <li>
                  <Link to='/profile'>Профиль</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className='btn-logout'>
                    Выйти
                  </button>
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
