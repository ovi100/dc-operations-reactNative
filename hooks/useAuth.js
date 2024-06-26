import { API_URL } from '@env';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import useActivity from './useActivity';
import { getStorage, removeAll, setStorage } from './useStorage';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userSites, setUserSites] = useState([]);
  const [token, setToken] = useState(null);
  const {createActivity} = useActivity();

  useEffect(() => {
    isLoggedIn();
  }, []);

  const login = async (userId, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL + 'api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, password}),
      });

      if (!response.ok) {
        setIsLoading(false);
        Toast.show({
          type: 'customError',
          text1: 'Check your internet connection',
        });
      }

      const data = await response.json();

      if (data.status) {
        setUser(data.user);
        setToken(data.token);
        setUserSites(data.site);
        setStorage('token', data.token);
        setStorage('user', data.user);
        // activity
        await createActivity(
          data.user._id,
          'login',
          `${data.user.name} logged in`,
        );
      } else {
        Toast.show({
          type: 'customError',
          text1: data.message,
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeAll();
    setIsLoading(false);
  };

  const isLoggedIn = () => {
    try {
      setIsLoading(true);
      let storedUser = getStorage('user', setUser, 'object');
      let storedToken = getStorage('token', setToken);

      if (storedUser?.user) {
        setUser(storedUser);
        setToken(storedToken);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
      setIsLoading(false);
    }
  };

  const authInfo = {
    login,
    logout,
    isLoading,
    user,
    setUser,
    userSites,
    setUserSites,
    token,
  };

  return authInfo;
};

export default useAuth;
