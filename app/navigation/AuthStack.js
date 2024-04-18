import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Login from '../screens/Login';
import Register from '../screens/Register';

const AuthStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Login" id="auth">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          title: 'Registration',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          // headerStyle: {
          //   backgroundColor: '#edf2fa',
          // },
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
