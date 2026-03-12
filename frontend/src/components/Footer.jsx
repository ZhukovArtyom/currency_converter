import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer-content'>
          <div className='footer-section'>
            <h4>Currency Converter</h4>
          </div>

          <div className='footer-section'>
            <h4>Контакты</h4>
            <p>Email: support@currencyconverter.com</p>
            <p>Телефон: +7 (999) 123-45-67</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
