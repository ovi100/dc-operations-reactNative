import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import { getStorage } from '../../hooks/useStorage';
import Login from '../screens/Login';
import Dashboard from './Dashboard';

const Stack = createNativeStackNavigator();

const Root = () => {
  const {authInfo} = useAppContext();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (authInfo.token) {
      setToken(authInfo.token);
    } else {
      getStorage('token', setToken, 'string');
    }
  }, [authInfo.token]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        {token ? (
          <Stack.Screen name="Dashboard" component={Dashboard} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Root;
