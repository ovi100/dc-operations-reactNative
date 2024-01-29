import React, { createContext } from 'react';
import useAuth from '../hooks/useAuth';

export const AppContext = createContext({});

const AppProvider = ({children}) => {
  const authInfo = useAuth();
  console.log('App Context token', authInfo);
  const contextValues = {
    authInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
