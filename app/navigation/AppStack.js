import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
// screens
import useAppContext from '../../hooks/useAppContext';
import Home from '../screens/dashboard';
import Audit from '../screens/dashboard/audit/Audit';
import DeliveryNote from '../screens/dashboard/deliveryNote/DeliveryNote';
import DeliveryPlan from '../screens/dashboard/deliveryPlan/DeliveryPlan';
import OutletArticleDetails from '../screens/dashboard/outlet/receiving/OutletArticleDetails';
import OutletPoStoDetails from '../screens/dashboard/outlet/receiving/OutletPoStoDetails';
import OutletReceiving from '../screens/dashboard/outlet/receiving/OutletReceiving';
import ChildPacking from '../screens/dashboard/packing/ChildPacking';
import MasterPacking from '../screens/dashboard/packing/MasterPacking';
import QualityCheck from '../screens/dashboard/packing/qualityCheck/QualityCheck';
import Picking from '../screens/dashboard/picking/Picking';
import PickingStoArticleBinDetails from '../screens/dashboard/picking/PickingStoArticleBinDetails';
import PickedSto from '../screens/dashboard/picking/pickedSTO/PickedSto';
import PickingSto from '../screens/dashboard/picking/pickingSTO/PickingSto';
import PickingStoArticle from '../screens/dashboard/picking/pickingStoArticle/PickingStoArticle';
import Print from '../screens/dashboard/print/Print';
import PoArticle from '../screens/dashboard/receiving/PoArticle';
import PurchaseOrder from '../screens/dashboard/receiving/PurchaseOrder';
import Receiving from '../screens/dashboard/receiving/Receiving';
import Return from '../screens/dashboard/return/Return';
import ReturnDetails from '../screens/dashboard/return/returnDetails/ReturnDetails';
import AssignToBin from '../screens/dashboard/shelving/AssignToBin';
import BinDetails from '../screens/dashboard/shelving/BinDetails';
import ShelveArticle from '../screens/dashboard/shelving/ShelveArticle';
import Shelving from '../screens/dashboard/shelving/Shelving';
import SiteChoose from '../screens/dashboard/site/SiteChoose';
import PickerPackerTaskAssign from '../screens/dashboard/taskAssign/PickerPackerTaskAssign/PickerPackerTaskAssign';
import TaskAssign from '../screens/dashboard/taskAssign/TaskAssign';
import ChangePassword from '../screens/dashboard/userProfile/ChangePassword';
import Profile from '../screens/dashboard/userProfile/Profile';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const {authInfo} = useAppContext();
  const {user} = authInfo;

  const screens = [
    {id: 'home', name: 'Home', component: Home},
    {id: 'audit', name: 'Audit', component: Audit},
    {id: 'profile', name: 'Profile', component: Profile},
    {id: 'change-password', name: 'ChangePassword', component: ChangePassword},
    {id: 'receiving', name: 'Receiving', component: Receiving},
    {id: 'purchase-order', name: 'PurchaseOrder', component: PurchaseOrder},
    {id: 'po-article', name: 'PoArticle', component: PoArticle},
    {
      id: 'outlet-receiving',
      name: 'OutletReceiving',
      component: OutletReceiving,
    },
    {
      id: 'outlet-po-sto-details',
      name: 'OutletPoStoDetails',
      component: OutletPoStoDetails,
    },
    {
      id: 'outlet-article-details',
      name: 'OutletArticleDetails',
      component: OutletArticleDetails,
    },
    {id: 'shelving', name: 'Shelving', component: Shelving},
    {id: 'bin-details', name: 'BinDetails', component: BinDetails},
    {id: 'assign-bin', name: 'AssignToBin', component: AssignToBin},
    {id: 'shelve-article', name: 'ShelveArticle', component: ShelveArticle},
    {id: 'delivery-plan', name: 'DeliveryPlan', component: DeliveryPlan},
    {id: 'task-assign', name: 'TaskAssign', component: TaskAssign},
    {
      id: 'picker-packer-assign',
      name: 'PickerPackerTaskAssign',
      component: PickerPackerTaskAssign,
    },
    {id: 'picking', name: 'Picking', component: Picking},
    {id: 'picking-sto', name: 'PickingSto', component: PickingSto},
    {id: 'picked-sto', name: 'PickedSto', component: PickedSto},
    {
      id: 'picking-sto-article',
      name: 'PickingStoArticle',
      component: PickingStoArticle,
    },
    {
      id: 'picking-sto-article-bins',
      name: 'PickingStoArticleBinDetails',
      component: PickingStoArticleBinDetails,
    },
    {id: 'child-packing', name: 'ChildPacking', component: ChildPacking},
    {id: 'quality-check', name: 'QualityCheck', component: QualityCheck},
    {id: 'master-packing', name: 'MasterPacking', component: MasterPacking},
    {id: 'delivery-note', name: 'DeliveryNote', component: DeliveryNote},
    {id: 'return', name: 'Return', component: Return},
    {id: 'return-details', name: 'ReturnDetails', component: ReturnDetails},
    {id: 'print', name: 'Print', component: Print},
  ];

  return (
    <Stack.Navigator initialRouteName="SiteChoose">
      {user && typeof user.site !== 'string' && (
        <Stack.Group screenOptions={{headerShown: false}}>
          <Stack.Screen name="SiteChoose" component={SiteChoose} />
        </Stack.Group>
      )}
      <Stack.Group screenOptions={{headerShown: false}}>
        {screens.map(screen => (
          <Stack.Screen
            key={screen.id}
            name={screen.name}
            component={screen.component}
            options={{
              headerShown: false,
            }}
          />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppStack;
