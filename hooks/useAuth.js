import {useEffect, useState} from 'react';
import Toast from 'react-native-toast-message';
import {getStorage, removeItem, setStorage} from './useStorage';
import {toast} from '../utils';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  let [outlets, setOutlets] = useState([]);
  const [token, setToken] = useState(null);
  const API_URL = 'https://shwapnooperation.onrender.com/';

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL + 'api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (!response.ok) {
        setIsLoading(false);
        Toast.show({
          type: 'customError',
          text1: 'Check your internet connection',
        });
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      setStorage('token', data.token);
      setStorage('user', data.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'customInfo',
        text1: error.message.toString(),
      });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeItem('user');
    removeItem('token');
    setIsLoading(false);
  };

  const getOutlets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL + 'bapi/outlet');
      const data = await response.json();
      if (data.status) {
        setOutlets(data.outlets);
        setStorage('outlets', JSON.stringify(data.outlets));
        setIsLoading(false);
      } else {
        toast('No outlets found');
        setOutlets([
          {
            code: 'D014',
            name: 'Nrayangonj',
            district: 'Dhaka',
            selected: false,
          },
          {
            code: 'C001',
            name: 'Cumilla',
            district: 'Chittagong',
            selected: false,
          },
        ]);
        setStorage(
          'outlets',
          JSON.stringify([
            {
              code: 'D014',
              name: 'Nrayangonj',
              district: 'Dhaka',
              selected: false,
            },
            {
              code: 'C001',
              name: 'Cumilla',
              district: 'Chittagong',
              selected: false,
            },
          ]),
        );
        setIsLoading(false);
      }
    } catch (error) {
      toast(error.message);
      setIsLoading(false);
    }
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
      Alert.alert(error);
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOutlets();
    isLoggedIn();
  }, []);

  const authInfo = {
    login,
    logout,
    isLoading,
    user,
    setUser,
    token,
    outlets,
  };

  return authInfo;
};

export default useAuth;
