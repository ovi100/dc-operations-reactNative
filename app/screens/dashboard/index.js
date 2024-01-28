import { Link } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';
import { ButtonProfile } from '../../../components/buttons';
import {
  ChildPackingIcon,
  DeliveryNoteIcon,
  DeliveryPlanIcon,
  MasterPackingIcon,
  PickingIcon,
  PrinterIcon,
  ReceivingIcon,
  ReturnIcon,
  ScannerIcon,
  ShelvingIcon,
  TaskAssignIcon,
} from '../../../constant/icons';

const Home = ({navigation}) => {
  const navLinks = [
    {
      name: 'Receiving',
      icon: ReceivingIcon,
      path: 'receiving',
      access: ['all'],
    },
    {
      name: 'Shelving',
      icon: ShelvingIcon,
      path: 'shelving',
      access: ['all'],
    },
    {
      name: 'Delivery Plan',
      icon: DeliveryPlanIcon,
      path: 'delivery-plan',
      access: ['all'],
    },
    {
      name: 'Task Assign',
      icon: TaskAssignIcon,
      path: 'task-assign',
      access: ['all'],
    },
    {
      name: 'Picking',
      icon: PickingIcon,
      path: 'picking',
      access: ['all'],
    },
    {
      name: 'Child Packing',
      icon: ChildPackingIcon,
      path: 'child-packing',
      access: ['all'],
    },
    {
      name: 'Master Packing',
      icon: MasterPackingIcon,
      path: 'master-packing',
      access: ['all'],
    },
    {
      name: 'Delivery Note',
      icon: DeliveryNoteIcon,
      path: 'delivery-note',
      access: ['all'],
    },
    {
      name: 'Return',
      icon: ReturnIcon,
      path: 'return',
      access: ['all'],
    },
    {
      name: 'Print',
      icon: PrinterIcon,
      path: 'printer',
      access: ['all'],
    },
    {
      name: 'Scan Barcode',
      icon: ScannerIcon,
      path: 'scanner',
      access: 'private',
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="screen-header flex-row items-center justify-between mb-5 px-6">
          <Text className="text-lg text-[#060239] text-center font-semibold capitalize">
            home
          </Text>
          <ButtonProfile onPress={() => navigation.push('profile')} />
        </View>
        <View className="flex-row flex-wrap items-center justify-between">
          {navLinks.map(item => (
            <View className="menu-box items-center w-1/3 mt-8" key={item.path}>
              <Link to={{screen: item.path}}>
                <View className="flex-col items-center">
                  <View className="icon">
                    <Image className="w-24 h-24" source={item.icon} />
                  </View>
                  <Text className="text mt-3">{item.name}</Text>
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
