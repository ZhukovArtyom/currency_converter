import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Currency Converter</h1>
        <p>Конвертируйте валюты по актуальным курсам в реальном времени</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn-primary">Начать сейчас</Link>
          <Link to="/converter" className="btn-secondary">Попробовать конвертер</Link>
        </div>
      </section>

      <section className="features">
        <h2>Почему выбирают нас</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Актуальные курсы</h3>
            <p>Получайте свежие данные из надежных источников</p>
          </div>
          <div className="feature-card">
            <h3>Безопасность</h3>
            <p>Ваши данные защищены JWT аутентификацией</p>
          </div>
          <div className="feature-card">
            <h3>Простота использования</h3>
            <p>Интуитивно понятный интерфейс для всех пользователей</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;