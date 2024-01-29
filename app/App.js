import React from 'react';
import AppProvider from '../contexts/AppContext';
import Root from './navigation/Root';

const App = () => {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
};

export default App;
