import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.username.length < 6) {
      newErrors.username = 'Имя должно содержать минимум 6 символов';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Имя может содержать только буквы, цифры, _ и -';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/[a-zA-Z]/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну букву';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну цифру';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await register(formData.username, formData.password);

    if (result.success) {
      await login(formData.username, formData.password);
      navigate('/converter');
    } else {
      setErrors({ form: result.error });
    }

    setLoading(false);
  };

  return (
    <div className='auth-form-container'>
      <h2>Регистрация</h2>

      {errors.form && <div className='error-message'>{errors.form}</div>}

      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='form-group'>
          <label htmlFor='username'>Имя пользователя:</label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            placeholder='От 6 символов (буквы, цифры, _ и -)'
          />
          {errors.username && <span className='field-error'>{errors.username}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='password'>Пароль:</label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            placeholder='Минимум 8 символов, буквы и цифры'
          />
          {errors.password && <span className='field-error'>{errors.password}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='confirmPassword'>Подтверждение пароля:</label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder='Повторите пароль'
          />
          {errors.confirmPassword && <span className='field-error'>{errors.confirmPassword}</span>}
        </div>

        <button type='submit' className='btn-submit' disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className='auth-link'>
        Уже есть аккаунт? <a href='/login'>Войти</a>
      </p>
    </div>
  );
};

export default RegisterForm;
