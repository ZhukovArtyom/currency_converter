import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Добро пожаловать!</h1>
        <div className="cta-buttons">

          <Link to="/converter" className="btn-secondary">Начать конвертировать</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;