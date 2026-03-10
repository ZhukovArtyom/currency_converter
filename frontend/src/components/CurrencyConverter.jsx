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

  // Состояния для блока с курсами
  const [rates, setRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState('');

  // Популярные валюты для отображения
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

  useEffect(() => {
    loadCurrencies();
    loadRatesToRUB();
  }, []);

  const loadCurrencies = async () => {
    try {
      const response = await getCurrencies();
      setCurrencies(response.data.supported_currencies || []);
    } catch (err) {
      console.error('Error loading currencies:', err);
    }
  };

  const loadRatesToRUB = async () => {
    try {
      setRatesLoading(true);

      // Получаем курсы относительно USD через ваш бэкенд
      const response = await getExchangeRates('USD');
      const data = response.data;

      console.log('API Response (USD base):', data);

      if (data && data.rates) {
        const allRates = data.rates;
        const usdToRub = allRates['RUB']; // Сколько рублей в 1 долларе

        console.log('USD to RUB:', usdToRub);

        if (usdToRub) {
          const rubRates = {};

          popularCurrencies.forEach(currency => {
            if (currency === 'USD') {
              // 1 USD = usdToRub RUB
              rubRates['USD'] = usdToRub;
            } else {
              const rateFromApi = allRates[currency]; // Сколько единиц валюты в 1 USD
              if (rateFromApi) {
                // Правильная формула:
                // 1 USD = rateFromApi currency
                // Значит: 1 currency = 1/rateFromApi USD
                // А 1 USD = usdToRub RUB
                // Поэтому: 1 currency = (1/rateFromApi) * usdToRub RUB
                rubRates[currency] = (1 / rateFromApi) * usdToRub;
              }
            }
          });

          console.log('Final RUB rates:', rubRates);
          setRates(rubRates);
          setRatesError('');
        } else {
          throw new Error('Курс RUB не найден');
        }
      } else {
        throw new Error('Неверный формат ответа');
      }
    } catch (err) {
      console.error('Error loading rates:', err);
      setRatesError('Не удалось загрузить курсы валют');

      // Запасной вариант с примерными курсами на случай ошибки
      setRates({
        'USD': 92.50,
        'EUR': 100.20,
        'GBP': 117.80,
        'JPY': 0.62,
        'CNY': 12.85
      });
    } finally {
      setRatesLoading(false);
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

  const getCurrencyName = (currency) => {
    const names = {
      'USD': 'Доллар США',
      'EUR': 'Евро',
      'GBP': 'Фунт стерлингов',
      'JPY': 'Японская иена',
      'CNY': 'Китайский юань'
    };
    return names[currency] || currency;
  };

  const formatRate = (rate) => {
    if (!rate) return '—';
    if (rate < 0.1) {
      return rate.toFixed(4);
    }
    return rate.toFixed(2);
  };

  return (
    <div className="converter-page">
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
      </div>

      {/* Блок с популярными курсами */}
      <section className="popular-rates">
        <div className="container">
          <h3>Популярные курсы</h3>


          {ratesLoading && (
            <div className="rates-loading">
              <div className="loading-spinner-small"></div>
              <span>Загрузка актуальных курсов...</span>
            </div>
          )}

          {ratesError && (
            <div className="rates-error">
              {ratesError}
            </div>
          )}

          {!ratesLoading && !ratesError && (
            <div className="rates-grid">
              {popularCurrencies.map(currency => {
                const rate = rates[currency];
                return (
                  <div key={currency} className="rate-card">
                    <div className="rate-header">
                      <span className="currency-code">{currency}</span>
                      <span className="currency-name">
                        {getCurrencyName(currency)}
                      </span>
                    </div>
                    <div className="rate-value">
                      {rate ? formatRate(rate) : '—'} ₽
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          <div className="rates-note">
            * Курсы обновляются в реальном времени
          </div>
        </div>
      </section>
    </div>
  );
};

export default CurrencyConverter;