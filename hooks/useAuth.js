import { API_URL } from '@env';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { version } from '../package.json';
import useActivity from './useActivity';
import { getStorage, removeAll, setStorage } from './useStorage';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userSites, setUserSites] = useState([]);
  const [token, setToken] = useState(null);
  const {createActivity} = useActivity();

  console.log('CURRENT API URL', API_URL);

  useEffect(() => {
    isLoggedIn();
  }, []);

  const login = async (userId, password) => {
    try {
      setIsLoading(true);
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
        //update user app version
        await fetch(API_URL + `api/user/${data.user._id}`, {
          method: 'PATCH',
          headers: {
            authorization: data.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({appVersion: version}),
        })
          .then(response => response.json())
          .then(result => {
            setUser({...data.user, appVersion: result.user.appVersion});
            setToken(data.token);
            setUserSites(data.user.site);
            setStorage('token', data.token);
            setStorage('user', {
              ...data.user,
              appVersion: result.user.appVersion,
            });
          })
          .catch(error => {
            Toast.show({
              type: 'customError',
              text1: error.message,
            });
          });
        // activity
        await createActivity(
          data.user._id,
          'login',
          `${data.user.name} logged in with version ${version.toUpperCase()}`,
        );
      } else {
        Toast.show({
          type: 'customError',
          text1: data.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    } finally {
      setIsLoading(false);
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
    version,
  };

  return authInfo;
};

export default useAuth;
