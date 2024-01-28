import React, { useEffect, useState } from 'react';
import AppProvider from '../contexts/AppContext';
import { getStorage } from '../hooks/useStorage';
import Dashboard from './navigation/Dashboard';
import Root from './navigation/Root';

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  console.log(token);

  return <AppProvider>{token ? <Dashboard /> : <Root />}</AppProvider>;
};

export default App;
