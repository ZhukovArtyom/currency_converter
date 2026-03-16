import React, { useState, useEffect, useRef } from 'react';
import './CurrencySearch.css';

const CurrencySearch = ({
  value,
  onChange,
  currencies,
  placeholder = "Выберите валюту",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef([]);

  // Убеждаемся, что currencies уникальны при монтировании
  useEffect(() => {
    // Проверяем на дубликаты и выводим предупреждение
    const duplicates = currencies.filter((item, index) =>
      currencies.indexOf(item) !== index
    );
    if (duplicates.length > 0) {
      console.warn('Найдены дубликаты валют:', [...new Set(duplicates)]);
    }
  }, [currencies]);

  // Фильтрация валют при изменении поискового запроса
  useEffect(() => {
    if (!currencies || currencies.length === 0) {
      setFilteredCurrencies([]);
      return;
    }

    // Сначала убираем дубликаты из исходного массива (на всякий случай)
    const uniqueCurrencies = [...new Set(currencies)];

    if (searchTerm.trim() === '') {
      setFilteredCurrencies(uniqueCurrencies);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = uniqueCurrencies.filter(currency =>
        currency.toLowerCase().includes(searchLower)
      );
      setFilteredCurrencies(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, currencies]);

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фокус на поле поиска при открытии
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Сброс подсветки при изменении фильтра
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredCurrencies]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleSelectCurrency = (currency) => {
    onChange({ target: { value: currency } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCurrencies.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCurrencies[highlightedIndex]) {
          handleSelectCurrency(filteredCurrencies[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        break;
    }
  };

  // Скролл к выделенному элементу
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  const getCurrencyFullName = (code) => {
    const names = {
      USD: 'Доллар США',
      EUR: 'Евро',
      GBP: 'Фунт стерлингов',
      JPY: 'Японская иена',
      CNY: 'Китайский юань',
      RUB: 'Российский рубль',
      AUD: 'Австралийский доллар',
      CAD: 'Канадский доллар',
      CHF: 'Швейцарский франк',
      HKD: 'Гонконгский доллар',
      NZD: 'Новозеландский доллар',
      SEK: 'Шведская крона',
      KRW: 'Южнокорейская вона',
      SGD: 'Сингапурский доллар',
      NOK: 'Норвежская крона',
      MXN: 'Мексиканское песо',
      INR: 'Индийская рупия',
      BRL: 'Бразильский реал',
      ZAR: 'Южноафриканский рэнд',
      TRY: 'Турецкая лира'
    };
    return names[code] || code;
  };

  // Функция для получения уникального ключа (используем currency + индекс только если есть дубликаты)
  const getItemKey = (currency, index) => {
    // Проверяем, есть ли дубликаты этого значения
    const count = currencies.filter(c => c === currency).length;
    if (count > 1) {
      return `${currency}-${index}`;
    }
    return currency;
  };

  return (
    <div className="currency-search-container">
      {label && <label className="currency-search-label">{label}</label>}

      <div className="currency-search-wrapper">
        {/* Кнопка для открытия/закрытия */}
        <button
          ref={buttonRef}
          type="button"
          className={`currency-select-button ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
        >
          <span className="selected-value">
            {value || placeholder}
          </span>
          <div className="button-icons">
            <span className="arrow-icon">▼</span>

          </div>
        </button>

        {/* Выпадающий список */}
        {isOpen && (
          <div ref={dropdownRef} className="currency-dropdown">
            {/* Поле поиска */}
            <div className="dropdown-search">
              <input
                ref={searchInputRef}
                type="text"
                className="dropdown-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Поиск валюты..."
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Список валют */}
            <div className="dropdown-list">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency, index) => (
                  <div
                    key={getItemKey(currency, index)}
                    ref={el => optionsRef.current[index] = el}
                    className={`dropdown-item ${currency === value ? 'selected' : ''} ${index === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelectCurrency(currency)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="item-code">{currency}</span>
                    <span className="item-name">{getCurrencyFullName(currency)}</span>
                  </div>
                ))
              ) : (
                <div className="dropdown-empty">
                  Ничего не найдено
                </div>
              )}
            </div>

            {/* Подсказка по клавишам */}
            <div className="dropdown-hint">
              ↑↓ для навигации • Enter для выбора • Esc для закрытия
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySearch;