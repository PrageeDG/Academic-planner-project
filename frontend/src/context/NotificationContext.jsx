import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { collisionAPI, taskAPI } from '../services/api';
import { buildNotifications } from '../utils/dashboardHelpers';
import { AuthContext } from './AuthContext';

const STORAGE_KEY = 'notification-read-map';

export const NotificationContext = createContext();

const getStoredReadMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to parse notification state:', error);
    return {};
  }
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readMap, setReadMap] = useState(getStoredReadMap);
  const readMapRef = useRef(readMap);

  useEffect(() => {
    readMapRef.current = readMap;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readMap));
  }, [readMap]);

  useEffect(() => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: Boolean(readMap[item.id]),
      }))
    );
  }, [readMap]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setError('');
      return undefined;
    }

    let active = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const [tasksResult, collisionsResult] = await Promise.allSettled([
          taskAPI.getTasks(),
          collisionAPI.analyzeCollisions(),
        ]);

        if (!active) return;

        const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data.tasks || [] : [];
        const collisionData = collisionsResult.status === 'fulfilled' ? collisionsResult.value.data : null;
        const nextNotifications = buildNotifications(tasks, collisionData).map((item) => ({
          ...item,
          read: Boolean(readMapRef.current[item.id]),
        }));

        setNotifications(nextNotifications);

        if (tasksResult.status === 'rejected' && collisionsResult.status === 'rejected') {
          setError('Unable to load notifications right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const markAsRead = (id) => {
    setReadMap((current) => ({
      ...current,
      [id]: true,
    }));
  };

  const markAsUnread = (id) => {
    setReadMap((current) => ({
      ...current,
      [id]: false,
    }));
  };

  const toggleRead = (id) => {
    setReadMap((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const markAllAsRead = () => {
    setReadMap((current) =>
      notifications.reduce(
        (accumulator, item) => ({
          ...accumulator,
          [item.id]: true,
        }),
        { ...current }
      )
    );
  };

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksResponse, collisionsResponse] = await Promise.all([
        taskAPI.getTasks(),
        collisionAPI.analyzeCollisions(),
      ]);

      const nextNotifications = buildNotifications(
        tasksResponse.data.tasks || [],
        collisionsResponse.data
      ).map((item) => ({
        ...item,
        read: Boolean(readMapRef.current[item.id]),
      }));

      setNotifications(nextNotifications);
    } catch (refreshError) {
      setError(refreshError.response?.data?.message || 'Unable to refresh notifications.');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        toggleRead,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
