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
    AED: 'Дирхам ОАЭ',
    AFN: 'Афганский афгани',
    ALL: 'Албанский лек',
    AMD: 'Армянский драм',
    ANG: 'Нидерландский антильский гульден',
    AOA: 'Ангольская кванза',
    ARS: 'Аргентинское песо',
    AUD: 'Австралийский доллар',
    AWG: 'Арубанский флорин',
    AZN: 'Азербайджанский манат',
    BAM: 'Конвертируемая марка Боснии и Герцеговины',
    BBD: 'Барбадосский доллар',
    BDT: 'Бангладешская така',
    BGN: 'Болгарский лев',
    BHD: 'Бахрейнский динар',
    BIF: 'Бурундийский франк',
    BMD: 'Бермудский доллар',
    BND: 'Брунейский доллар',
    BOB: 'Боливийский боливиано',
    BRL: 'Бразильский реал',
    BSD: 'Багамский доллар',
    BTN: 'Бутанский нгултрум',
    BWP: 'Ботсванская пула',
    BYN: 'Белорусский рубль',
    BZD: 'Белизский доллар',
    CAD: 'Канадский доллар',
    CDF: 'Конголезский франк',
    CHF: 'Швейцарский франк',
    CLF: 'Условная расчетная единица Чили',
    CLP: 'Чилийское песо',
    CNH: 'Оффшорный юань',
    CNY: 'Китайский юань',
    COP: 'Колумбийское песо',
    CRC: 'Коста-риканский колон',
    CUP: 'Кубинское песо',
    CVE: 'Эскудо Кабо-Верде',
    CZK: 'Чешская крона',
    DJF: 'Франк Джибути',
    DKK: 'Датская крона',
    DOP: 'Доминиканское песо',
    DZD: 'Алжирский динар',
    EGP: 'Египетский фунт',
    ERN: 'Эритрейская накфа',
    ETB: 'Эфиопский быр',
    EUR: 'Евро',
    FJD: 'Фиджийский доллар',
    FKP: 'Фунт Фолклендских островов',
    FOK: 'Фарерская крона',
    GBP: 'Фунт стерлингов',
    GEL: 'Грузинский лари',
    GGP: 'Гернсийский фунт',
    GHS: 'Ганский седи',
    GIP: 'Гибралтарский фунт',
    GMD: 'Гамбийский даласи',
    GNF: 'Гвинейский франк',
    GTQ: 'Гватемальский кетсаль',
    GYD: 'Гайанский доллар',
    HKD: 'Гонконгский доллар',
    HNL: 'Гондурасская лемпира',
    HRK: 'Хорватская куна',
    HTG: 'Гаитянский гурд',
    HUF: 'Венгерский форинт',
    IDR: 'Индонезийская рупия',
    ILS: 'Новый израильский шекель',
    IMP: 'Фунт острова Мэн',
    INR: 'Индийская рупия',
    IQD: 'Иракский динар',
    IRR: 'Иранский риал',
    ISK: 'Исландская крона',
    JEP: 'Фунт Джерси',
    JMD: 'Ямайский доллар',
    JOD: 'Иорданский динар',
    JPY: 'Японская иена',
    KES: 'Кенийский шиллинг',
    KGS: 'Киргизский сом',
    KHR: 'Камбоджийский риель',
    KID: 'Доллар Кирибати',
    KMF: 'Коморский франк',
    KRW: 'Южнокорейская вона',
    KWD: 'Кувейтский динар',
    KYD: 'Доллар Каймановых островов',
    KZT: 'Казахстанский тенге',
    LAK: 'Лаосский кип',
    LBP: 'Ливанский фунт',
    LKR: 'Шри-ланкийская рупия',
    LRD: 'Либерийский доллар',
    LSL: 'Лоти Лесото',
    LYD: 'Ливийский динар',
    MAD: 'Марокканский дирхам',
    MDL: 'Молдавский лей',
    MGA: 'Малагасийский ариари',
    MKD: 'Македонский денар',
    MMK: 'Мьянманский кьят',
    MNT: 'Монгольский тугрик',
    MOP: 'Патака Макао',
    MRU: 'Мавританская угия',
    MUR: 'Маврикийская рупия',
    MVR: 'Мальдивская руфия',
    MWK: 'Малавийская квача',
    MXN: 'Мексиканское песо',
    MYR: 'Малайзийский ринггит',
    MZN: 'Мозамбикский метикал',
    NAD: 'Намибийский доллар',
    NGN: 'Нигерийская найра',
    NIO: 'Никарагуанская кордоба',
    NOK: 'Норвежская крона',
    NPR: 'Непальская рупия',
    NZD: 'Новозеландский доллар',
    OMR: 'Оманский риал',
    PAB: 'Панамский бальбоа',
    PEN: 'Перуанский соль',
    PGK: 'Кина Папуа-Новой Гвинеи',
    PHP: 'Филиппинское песо',
    PKR: 'Пакистанская рупия',
    PLN: 'Польский злотый',
    PYG: 'Парагвайский гуарани',
    QAR: 'Катарский риал',
    RON: 'Румынский лей',
    RSD: 'Сербский динар',
    RUB: 'Российский рубль',
    RWF: 'Франк Руанды',
    SAR: 'Саудовский риял',
    SBD: 'Доллар Соломоновых островов',
    SCR: 'Сейшельская рупия',
    SDG: 'Суданский фунт',
    SEK: 'Шведская крона',
    SGD: 'Сингапурский доллар',
    SHP: 'Фунт Святой Елены',
    SLE: 'Сьерра-леонский леоне',
    SLL: 'Сьерра-леонский леоне (старый)',
    SOS: 'Сомалийский шиллинг',
    SRD: 'Суринамский доллар',
    SSP: 'Южносуданский фунт',
    STN: 'Добра Сан-Томе и Принсипи',
    SYP: 'Сирийский фунт',
    SZL: 'Лилангени Эсватини',
    THB: 'Таиландский бат',
    TJS: 'Таджикский сомони',
    TMT: 'Туркменский манат',
    TND: 'Тунисский динар',
    TOP: 'Тонганская паанга',
    TRY: 'Турецкая лира',
    TTD: 'Доллар Тринидада и Тобаго',
    TVD: 'Доллар Тувалу',
    TWD: 'Новый тайваньский доллар',
    TZS: 'Танзанийский шиллинг',
    UAH: 'Украинская гривна',
    UGX: 'Угандийский шиллинг',
    USD: 'Доллар США',
    UYU: 'Уругвайское песо',
    UZS: 'Узбекский сум',
    VES: 'Венесуэльский боливар',
    VND: 'Вьетнамский донг',
    VUV: 'Вануатский вату',
    WST: 'Самоанская тала',
    XAF: 'Центральноафриканский франк',
    XCD: 'Восточно-карибский доллар',
    XCG: 'Карибский гульден',
    XDR: 'СДР (специальные права заимствования)',
    XOF: 'Западноафриканский франк',
    XPF: 'Французский тихоокеанский франк',
    YER: 'Йеменский риал',
    ZAR: 'Южноафриканский рэнд',
    ZMW: 'Замбийская квача',
    ZWG: 'Зимбабвийский золотой',
    ZWL: 'Зимбабвийский доллар'
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
          <div className="selected-value-wrapper">
            <span className="selected-code">{value || placeholder}</span>
            {value && (
              <span className="selected-name">{getCurrencyFullName(value)}</span>
            )}
          </div>
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