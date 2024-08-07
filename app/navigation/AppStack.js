import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import useAppContext from '../../hooks/useAppContext';
// screens components
import Home from '../screens/dashboard';
import Audit from '../screens/dashboard/audit/Audit';
import AuditArticleDetails from '../screens/dashboard/audit/AuditArticleDetails';
import AuditBatchDetails from '../screens/dashboard/audit/AuditBatchDetails';
import AuditBatchList from '../screens/dashboard/audit/AuditBatchList';
import AuditBinDetails from '../screens/dashboard/audit/AuditBinDetails';
import AuditBinList from '../screens/dashboard/audit/AuditBinList';
import Damage from '../screens/dashboard/damage/Damage';
import DamageList from '../screens/dashboard/damage/DamageList';
import DcPoArticleDetails from '../screens/dashboard/dcReceiving/DcPoArticleDetails';
import DcPoDetails from '../screens/dashboard/dcReceiving/DcPoDetails';
import DcReceiving from '../screens/dashboard/dcReceiving/DcReceiving';
import DeliveryNote from '../screens/dashboard/deliveryNote/DeliveryNote';
import DeliveryPlan from '../screens/dashboard/deliveryPlan/DeliveryPlan';
import ChildPacking from '../screens/dashboard/packing/ChildPacking';
import MasterPacking from '../screens/dashboard/packing/MasterPacking';
import QualityCheck from '../screens/dashboard/packing/qualityCheck/QualityCheck';
import Picking from '../screens/dashboard/picking/Picking';
import PickingArticleBinDetails from '../screens/dashboard/picking/PickingArticleBinDetails';
import PickingArticleDetails from '../screens/dashboard/picking/PickingArticleDetails';
import PickedSto from '../screens/dashboard/picking/pickedSto/PickedSto';
import PickingSto from '../screens/dashboard/picking/pickingSto/PickingSto';
import ChangePassword from '../screens/dashboard/profile/ChangePassword';
import ChangeSite from '../screens/dashboard/profile/ChangeSite';
import Profile from '../screens/dashboard/profile/Profile';
import UpdateProfileInfo from '../screens/dashboard/profile/UpdateProfileInfo';
import ArticleDetails from '../screens/dashboard/receiving/ArticleDetails';
import ArticleReport from '../screens/dashboard/receiving/ArticleReport';
import PoStoDetails from '../screens/dashboard/receiving/PoStoDetails';
import Receiving from '../screens/dashboard/receiving/Receiving';
import Return from '../screens/dashboard/return/Return';
import ReturnDetails from '../screens/dashboard/return/returnDetails/ReturnDetails';
import ShelveArticleDetails from '../screens/dashboard/shelving/ShelveArticleDetails';
import ShelveBinList from '../screens/dashboard/shelving/ShelveBinList';
import Shelving from '../screens/dashboard/shelving/Shelving';
import SiteChoose from '../screens/dashboard/site/SiteChoose';
import PickerPackerTaskAssign from '../screens/dashboard/taskAssign/PickerPackerTaskAssign/PickerPackerTaskAssign';
import TaskAssign from '../screens/dashboard/taskAssign/TaskAssign';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const {authInfo} = useAppContext();
  const {user} = authInfo;

  const screens = [
    {
      id: 'home',
      name: 'Home',
      component: Home,
      icon: '',
      settings: {
        title: 'Home',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'left',
      },
    },
    {
      id: 'damage',
      name: 'Damage',
      component: Damage,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'damage-list',
      name: 'DamageList',
      component: DamageList,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit',
      name: 'Audit',
      component: Audit,
      icon: null,
      settings: {
        title: 'Audit',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit-article-details',
      name: 'AuditArticleDetails',
      component: AuditArticleDetails,
      icon: null,
      settings: {
        title: 'Audit Article Details',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit-bin-list',
      name: 'AuditBinList',
      component: AuditBinList,
      icon: null,
      settings: {
        title: 'Audit Bin List',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit-bin-details',
      name: 'AuditBinDetails',
      component: AuditBinDetails,
      icon: null,
      settings: {
        title: 'Audit Bin Details',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit-batch-list',
      name: 'AuditBatchList',
      component: AuditBatchList,
      icon: null,
      settings: {
        title: 'Audit Batch List',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'audit-batch-details',
      name: 'AuditBatchDetails',
      component: AuditBatchDetails,
      icon: null,
      settings: {
        title: 'Audit Batch Details',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'profile',
      name: 'Profile',
      component: Profile,
      icon: null,
      settings: {
        title: 'Profile',
        showHeader: true,
        showBackButton: true,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'change-site',
      name: 'ChangeSite',
      component: ChangeSite,
      icon: null,
      settings: {
        title: 'Change Site',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'change-password',
      name: 'ChangePassword',
      component: ChangePassword,
      icon: null,
      settings: {
        title: 'Change Password',
        showHeader: true,
        showBackButton: true,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'update-profile-info',
      name: 'UpdateProfileInfo',
      component: UpdateProfileInfo,
      icon: null,
      settings: {
        title: 'Update Info',
        showHeader: true,
        showBackButton: true,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'dc-receiving',
      name: 'DcReceiving',
      component: DcReceiving,
      icon: null,
      settings: {
        title: 'DC Receiving',
        showHeader: true,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'dc-op-details',
      name: 'DcPoDetails',
      component: DcPoDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'dc-po-article-details',
      name: 'DcPoArticleDetails',
      component: DcPoArticleDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'receiving',
      name: 'Receiving',
      component: Receiving,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'po-sto-details',
      name: 'PoStoDetails',
      component: PoStoDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'article-details',
      name: 'ArticleDetails',
      component: ArticleDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'article-report',
      name: 'ArticleReport',
      component: ArticleReport,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'shelving',
      name: 'Shelving',
      component: Shelving,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'shelve-article-bin-details',
      name: 'ShelveBinList',
      component: ShelveBinList,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'shelve-article-details',
      name: 'ShelveArticleDetails',
      component: ShelveArticleDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'delivery-plan',
      name: 'DeliveryPlan',
      component: DeliveryPlan,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'task-assign',
      name: 'TaskAssign',
      component: TaskAssign,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picker-packer-assign',
      name: 'PickerPackerTaskAssign',
      component: PickerPackerTaskAssign,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picking',
      name: 'Picking',
      component: Picking,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picking-sto',
      name: 'PickingSto',
      component: PickingSto,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picked-sto',
      name: 'PickedSto',
      component: PickedSto,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picking-sto-article',
      name: 'PickingArticleDetails',
      component: PickingArticleDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'picking-sto-article-bins',
      name: 'PickingArticleBinDetails',
      component: PickingArticleBinDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'child-packing',
      name: 'ChildPacking',
      component: ChildPacking,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'quality-check',
      name: 'QualityCheck',
      component: QualityCheck,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'master-packing',
      name: 'MasterPacking',
      component: MasterPacking,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'delivery-note',
      name: 'DeliveryNote',
      component: DeliveryNote,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'return',
      name: 'Return',
      component: Return,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
    {
      id: 'return-details',
      name: 'ReturnDetails',
      component: ReturnDetails,
      icon: null,
      settings: {
        title: '',
        showHeader: false,
        showBackButton: false,
        showIcon: false,
        textAlign: 'center',
      },
    },
  ];

  return (
    <Stack.Navigator initialRouteName="SiteChoose">
      {user?.name && Array.isArray(user?.site) && (
        <Stack.Group>
          <Stack.Screen
            name="SiteChoose"
            component={SiteChoose}
            options={{
              headerShown: true,
              headerShadowVisible: false,
              headerBackVisible: false,
              headerTitleStyle: {
                fontSize: 18,
              },
            }}
          />
        </Stack.Group>
      )}
      <Stack.Group>
        {screens.map(screen => (
          <Stack.Screen
            key={screen.id}
            name={screen.name}
            component={screen.component}
            options={{
              headerShown: true,
              headerShadowVisible: false,
              headerBackVisible: false,
              headerTitleStyle: {
                fontSize: 18,
              },
            }}
          />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppStack;
