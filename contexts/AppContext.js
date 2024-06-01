import React, {createContext} from 'react';
import useAuth from '../hooks/useAuth';
import useGRN from '../hooks/useGRN';
import useStoTracking from '../hooks/useStoTracking';
import useTPN from '../hooks/useTPN';

export const AppContext = createContext({});

const AppProvider = ({children}) => {
  const authInfo = useAuth();
  const GRNInfo = useGRN();
  const TPNInfo = useTPN();
  const StoInfo = useStoTracking();
  const contextValues = {
    authInfo,
    GRNInfo,
    TPNInfo,
    StoInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
