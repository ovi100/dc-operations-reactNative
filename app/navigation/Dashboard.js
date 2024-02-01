import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Home from '../screens/dashboard';
import PoArticles from '../screens/dashboard/receiving/PoArticles/PoArticles';
import Receiving from '../screens/dashboard/receiving/Receiving';
import PurchaseOrder from '../screens/dashboard/receiving/purchaseOrder/PurchaseOrder';
import ScanBarCode from '../screens/dashboard/scanbarcode/ScanBarCode';
import Shelving from '../screens/dashboard/shelving/Shelving';
import ShelveArticle from '../screens/dashboard/shelving/article/ShelveArticle';
import Profile from '../screens/dashboard/userProfile/Profile';

const Stack = createNativeStackNavigator();

const Dashboard = () => {
  const routes = [
    {id: 'home', name: 'Home', component: Home},
    {id: 'profile', name: 'Profile', component: Profile},
    {id: 'receiving', name: 'Receiving', component: Receiving},
    {id: 'purchase-order', name: 'PurchaseOrder', component: PurchaseOrder},
    {id: 'po-articles', name: 'PoArticles', component: PoArticles},
    {id: 'shelving', name: 'Shelving', component: Shelving},
    {id: 'shelve-article', name: 'ShelveArticle', component: ShelveArticle},
    {id: 'delivery-plan', name: 'DeliveryPlan', component: Receiving},
    {id: 'task-assign', name: 'TaskAssign', component: Receiving},
    {id: 'Picking', name: 'Picking', component: Receiving},
    {id: 'child-packing', name: 'ChildPacking', component: Receiving},
    {id: 'master-packing', name: 'MasterPacking', component: Receiving},
    {id: 'delivery-note', name: 'DeliveryNote', component: Receiving},
    {id: 'return', name: 'Return', component: Receiving},
    {id: 'print', name: 'Print', component: Receiving},
    {id: 'scan-barcode', name: 'ScanBarcode', component: ScanBarCode},
  ];
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
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
