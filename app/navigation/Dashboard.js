import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Home from '../screens/dashboard';
import Receiving from '../screens/dashboard/receiving/Receiving';
import Profile from '../screens/dashboard/userProfile/Profile';

const Stack = createNativeStackNavigator();

const Dashboard = () => {
  const routes = [
    {id: 1, name: 'home', component: Home},
    {id: 2, name: 'receiving', component: Receiving},
    {id: 3, name: 'profile', component: Profile},
    {id: 8, name: 'shelving', component: Home},
    {id: 10, name: 'deliveryPlan', component: Home},
    {id: 11, name: 'taskAssign', component: Home},
    {id: 13, name: 'picking', component: Home},
    {id: 16, name: 'childPacking', component: Home},
    {id: 18, name: 'masterPacking', component: Home},
    {id: 19, name: 'deliveryNote', component: Home},
    {id: 20, name: 'return', component: Home},
    {id: 23, name: 'print', component: Home},
    {id: 24, name: 'scanBarcode', component: Home},
  ];
  return (
    <Stack.Navigator>
      {routes.map(route => (
        <Stack.Screen
          key={route.id}
          name={route.name}
          component={route.component}
          options={{
            headerShown: false,
          }}
        />
      ))}
    </Stack.Navigator>
  );
};

export default Dashboard;
