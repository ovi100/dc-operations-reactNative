import React, { createContext } from 'react';
import useAuth from '../hooks/useAuth';
import useStoTracking from '../hooks/useStoTracking';

export const AppContext = createContext({});

const AppProvider = ({children}) => {
  const authInfo = useAuth();
  const StoInfo = useStoTracking();
  const contextValues = {
    authInfo,
    StoInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
