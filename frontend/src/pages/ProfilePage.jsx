import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Pages.css';

const ProfilePage = () => {
  const { logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получение информации о пользователе (если есть эндпоинт)
    const fetchUserInfo = async () => {
      try {
        // const response = await api.get('/auth/me/');
        // setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div className='loading'>Загрузка...</div>;

  return (
    <div className='profile-page'>
      <h2>Личный кабинет</h2>

      <div className='profile-card'>
{/*         <h3>Информация о пользователе</h3> */}
{/*         <p> */}
{/*           <strong>Имя пользователя:</strong> {userInfo?.username || 'Неизвестно'} */}
{/*         </p> */}

        <button onClick={logout} className='btn-logout'>
          Выйти из системы
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
