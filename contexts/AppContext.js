import React, {createContext} from 'react';
import useAuth from '../hooks/useAuth';
import useGRN from '../hooks/useGRN';
import useStoTracking from '../hooks/useStoTracking';

export const AppContext = createContext({});

const AppProvider = ({children}) => {
  const authInfo = useAuth();
  const GRNInfo = useGRN();
  const StoInfo = useStoTracking();
  const contextValues = {
    authInfo,
    GRNInfo,
    StoInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
