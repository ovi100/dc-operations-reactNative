import React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProvider from '../contexts/AppContext';
import AppNavigation from './navigation/AppNavigation';

const App = () => {
  return (
    <AppProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigation />
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default App;
