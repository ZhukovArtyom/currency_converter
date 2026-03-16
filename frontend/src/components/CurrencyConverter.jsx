import React, { useState, useEffect } from 'react';
import { getCurrencies, convertCurrency } from '../services/api';
import CurrencySearch from './CurrencySearch';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('RUB');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [popularRates, setPopularRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState('');

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

  useEffect(() => {
    loadCurrencies();
    loadAllPopularRates();
  }, []);

  const loadCurrencies = async () => {
  try {
    const response = await getCurrencies();
    // Убираем дубликаты с помощью Set
    const uniqueCurrencies = [...new Set(response.data.supported_currencies || [])];
    // Сортируем для удобства
    uniqueCurrencies.sort();
    setCurrencies(uniqueCurrencies);
    console.log('Уникальные валюты:', uniqueCurrencies.length);
  } catch (err) {
    console.error('Error loading currencies:', err);
  }
};

  const loadAllPopularRates = async () => {
    setRatesLoading(true);
    const rates = {};

    try {
      const promises = popularCurrencies.map(async (currency) => {
        try {
          const response = await convertCurrency(currency, 'RUB', 1);
          rates[currency] = response.data.rate;
        } catch (err) {
          console.error(`Error loading rate for ${currency}:`, err);
          rates[currency] = null;
        }
      });

      await Promise.all(promises);
      setPopularRates(rates);
      setRatesError('');
    } catch (err) {
      console.error('Error loading popular rates:', err);
      setRatesError('Не удалось загрузить курсы валют');
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

      if (toCurrency === 'RUB' && popularCurrencies.includes(fromCurrency)) {
        setPopularRates(prev => ({
          ...prev,
          [fromCurrency]: response.data.rate
        }));
      }
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

  const handleRateCardClick = async (currency) => {
    setFromCurrency(currency);
    setToCurrency('RUB');
  };

  const getCurrencyName = (currency) => {
    const names = {
      USD: 'Доллар США',
      EUR: 'Евро',
      GBP: 'Фунт стерлингов',
      JPY: 'Японская иена',
      CNY: 'Китайский юань',
      RUB: 'Российский рубль',
    };
    return names[currency] || currency;
  };

  return (
    <div className='converter-page'>
      <div className='converter-container'>
        <div className='converter-header'>
          <h2>Конвертер валют</h2>
          <button
            onClick={loadAllPopularRates}
            className='refresh-button'
            title='Обновить курсы'
          >
            🔄 Обновить курсы
          </button>
        </div>

        <form onSubmit={handleConvert} className='converter-form'>
          <div className='form-row'>
            <div className='form-group'>
              <label>Из:</label>
              <CurrencySearch
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                currencies={currencies}
                placeholder="Выберите валюту"
              />
            </div>

            <button
              type='button'
              onClick={handleSwapCurrencies}
              className='swap-button'
              title='Поменять валюты местами'
            >
              ⇄
            </button>

            <div className='form-group'>
              <label>В:</label>
              <CurrencySearch
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                currencies={currencies}
                placeholder="Выберите валюту"
              />
            </div>
          </div>

          <div className='form-group'>
            <label>Сумма:</label>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min='0.01'
              step='any'
              required
              className='amount-input'
            />
          </div>

          <button type='submit' className='convert-button' disabled={loading}>
            {loading ? 'Конвертация...' : 'Конвертировать'}
          </button>
        </form>

        {error && <div className='error-message'>{error}</div>}

        {result && (
          <div className='result-card'>
            <h3>Результат:</h3>
            <div className='conversion-result'>
              <span className='amount'>
                {result.amount} {result.from}
              </span>
              <span className='equals'> = </span>
              <span className='converted'>
                {result.converted_amount} {result.to}
              </span>
            </div>
            <div className='conversion-rate'>
              1 {result.from} = {result.rate.toFixed(2)} {result.to}
            </div>
          </div>
        )}
      </div>

      {/* Блок с популярными курсами */}
      <section className='popular-rates'>
        <div className='container'>
          <div className='rates-header'>
            <h3>Популярные курсы к рублю</h3>
            {ratesLoading && (
              <div className='rates-loading-small'>
                <div className='loading-spinner-small'></div>
                <span>Обновление...</span>
              </div>
            )}
          </div>

          <p className='rates-subtitle'>
            Кликните на валюту для быстрой конвертации
          </p>

          {ratesError && <div className='rates-error'>{ratesError}</div>}

          <div className='rates-grid'>
            {popularCurrencies.map((currency) => {
              const rate = popularRates[currency];
              const isLoading = ratesLoading && !rate;

              return (
                <div
                  key={`popular-${currency}`}
                  className={`rate-card ${fromCurrency === currency && toCurrency === 'RUB' ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
                  onClick={() => !isLoading && handleRateCardClick(currency)}
                  role='button'
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                      handleRateCardClick(currency);
                    }
                  }}
                  title={`Конвертировать ${currency} в рубли`}
                >
                  <div className='rate-header'>
                    <span className='currency-code'>{currency}</span>
                    <span className='currency-name'>{getCurrencyName(currency)}</span>
                  </div>
                  <div className='rate-value'>
                    {isLoading ? (
                      <div className='rate-loading'>...</div>
                    ) : (
                      <>
                        <span className='rate-number'>{rate ? rate.toFixed(2) : '—'}</span>
                        <span className='rate-currency'> ₽</span>
                      </>
                    )}
                  </div>
                  <div className='rate-hint'>
                    {isLoading ? 'Загрузка...' : 'Кликните для конвертации'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='rates-note'>
            * Курсы обновляются в реальном времени
          </div>
        </div>
      </section>
    </div>
  );
};

export default CurrencyConverter;