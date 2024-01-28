import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppProvider from '../contexts/AppContext';
import {getStorage} from '../hooks/useStorage';
import Login from './screens/Login';
import Dashboard from './navigation/Dashboard';

const Stack = createNativeStackNavigator();

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  console.log(token);

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {token ? (
            <Stack.Screen name="Dashboard" component={Dashboard} />
          ) : (
            <Stack.Screen name="Login" component={Login} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
