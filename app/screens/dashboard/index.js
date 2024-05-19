import { Link } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import NoAccess from '../../../components/animations/NoAccess';
import { ButtonProfile } from '../../../components/buttons';
import {
  AuditIcon,
  DeliveryNoteIcon,
  DeliveryPlanIcon,
  PackingIcon,
  PickingIcon,
  PrinterIcon,
  ReceivingIcon,
  ShelvingIcon,
  TaskAssignIcon,
} from '../../../constant/icons';
import useAppContext from '../../../hooks/useAppContext';

const Home = ({navigation}) => {
  const {authInfo} = useAppContext();
  const {user, logout} = authInfo;
  let filteredLinks;

  const navLinks = [
    {
      name: 'Receiving',
      icon: ReceivingIcon,
      screen: 'Receiving',
      role: 'receiver',
      access: 'receiving-access',
    },
    {
      name: 'Outlet Receiving',
      icon: ReceivingIcon,
      screen: 'OutletReceiving',
      role: 'receiver',
      access: 'outlet-receiving-access',
    },
    {
      name: 'Shelving',
      icon: ShelvingIcon,
      screen: 'Shelving',
      role: 'shelver',
      access: 'shelving-access',
    },
    {
      name: 'Delivery Plan',
      icon: DeliveryPlanIcon,
      screen: 'DeliveryPlan',
      role: 'delivery-planner',
      access: 'delivery-plan-access',
    },
    {
      name: 'Task Assign',
      icon: TaskAssignIcon,
      screen: 'TaskAssign',
      role: 'task-assigner',
      access: 'task-assign-access',
    },
    {
      name: 'Picking',
      icon: PickingIcon,
      screen: 'Picking',
      role: 'picker',
      access: 'picking-access',
    },
    {
      name: 'Child Packing',
      icon: PackingIcon,
      screen: 'ChildPacking',
      role: 'packer',
      access: 'packing-access',
    },
    {
      name: 'Final Delivery Note',
      icon: DeliveryNoteIcon,
      screen: 'DeliveryNote',
      role: 'DN charge',
      access: 'delivery-note-access',
    },
    {
      name: 'Audit',
      icon: AuditIcon,
      screen: 'Audit',
      role: 'audit',
      access: 'audit-access',
    },
    // {
    //   name: 'Return',
    //   icon: ReturnIcon,
    //   screen: 'Return',
    //   role: 'returner',
    //   access: 'return-access',
    // },
    {
      name: 'Print',
      icon: PrinterIcon,
      screen: 'Print',
      role: 'printer',
      access: 'printing-access',
    },
  ];

  if (user?.hasPermission.includes('*')) {
    filteredLinks = navLinks;
  } else {
    filteredLinks = navLinks.filter(link =>
      user?.hasPermission.some(item => item === link.access),
    );
  }

  if (!user) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Checking user permission. Please wait......
        </Text>
      </View>
    );
  }

  if (filteredLinks.length === 0)
    return (
      <SafeAreaView className="flex-1 bg-white pt-8">
        <View className="flex-1">
          <View className="h-full items-center justify-center px-3">
            <View className="photo">
              <NoAccess />
            </View>
            <View className="mt-3">
              <Text className="text text-blue-600 text-2xl font-semibold capitalize">
                hello, {user.name}
              </Text>
            </View>
            <View className="w-4/5 mt-3">
              <Text className="text text-center text-gray-400 text-lg">
                You don't have any permission. Please contact with admin
              </Text>
            </View>
            <View className="mt-5">
              <TouchableWithoutFeedback onPress={() => logout()}>
                <Text className="bg-[#AC3232] text-center text-white text-lg rounded-md px-3 py-1.5">
                  Logout
                </Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="screen-header flex-row items-center justify-between mb-5 px-6">
          <Text className="text-lg text-[#060239] text-center font-semibold capitalize">
            home
          </Text>
          <ButtonProfile onPress={() => navigation.push('Profile')} />
        </View>
        <View className="flex-row flex-wrap items-center px-3">
          {filteredLinks.map(item => (
            <View
              className="menu-box items-center w-1/3 mt-8"
              key={item.screen}>
              <Link to={{screen: item.screen}}>
                <View className="flex-col items-center">
                  <View className="icon">
                    <Image
                      className="w-24 h-24 rounded-[14px]"
                      source={item.icon}
                    />
                  </View>
                  <Text className="text text-black mt-3">{item.name}</Text>
                </View>
              </Link>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
