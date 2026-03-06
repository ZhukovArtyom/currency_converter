import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Currency Converter</h4>
            <p>Конвертируйте валюты по актуальным курсам</p>
          </div>

          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Email: support@currencyconverter.com</p>
            <p>Телефон: +7 (999) 123-45-67</p>
          </div>

          <div className="footer-section">
            <h4>Социальные сети</h4>
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer">Telegram</a>
              <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Currency Converter. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;