import React, { useState, useEffect } from 'react';
import { getCurrencies, convertCurrency, getExchangeRates } from '../services/api';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rates, setRates] = useState({});

  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      const response = await getCurrencies();
      setCurrencies(response.data.supported_currencies || []);
    } catch (err) {
      console.error('Error loading currencies:', err);
    }
  };

  const loadExchangeRates = async (base = 'USD') => {
    try {
      const response = await getExchangeRates(base);
      setRates(response.data.rates || {});
    } catch (err) {
      console.error('Error loading rates:', err);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await convertCurrency(fromCurrency, toCurrency, amount);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка конвертации');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="converter-container">
      <h2>Конвертер валют</h2>

      <form onSubmit={handleConvert} className="converter-form">
        <div className="form-row">
          <div className="form-group">
            <label>Из:</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwapCurrencies}
            className="swap-button"
            title="Поменять валюты местами"
          >
            ⇄
          </button>

          <div className="form-group">
            <label>В:</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Сумма:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0.01"
            step="any"
            required
            className="amount-input"
          />
        </div>

        <button type="submit" className="convert-button" disabled={loading}>
          {loading ? 'Конвертация...' : 'Конвертировать'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-card">
          <h3>Результат:</h3>
          <div className="conversion-result">
            <span className="amount">{result.amount} {result.from}</span>
            <span className="equals"> = </span>
            <span className="converted">{result.converted_amount} {result.to}</span>
          </div>
          <div className="conversion-rate">
            1 {result.from} = {result.rate} {result.to}
          </div>
        </div>
      )}

      <div className="rates-section">
        <h3>Популярные курсы (USD)</h3>
        <div className="rates-grid">
          {rates && Object.entries(rates)
            .filter(([currency]) => ['EUR', 'GBP', 'JPY', 'RUB', 'CNY'].includes(currency))
            .map(([currency, rate]) => (
              <div key={currency} className="rate-item">
                <span className="rate-currency">{currency}</span>
                <span className="rate-value">{rate.toFixed(4)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;