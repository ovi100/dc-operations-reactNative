import React from 'react';
import AppProvider from '../contexts/AppContext';
import AppNavigation from './navigation/AppNavigation';

const App = () => {
  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
};

export default App;
