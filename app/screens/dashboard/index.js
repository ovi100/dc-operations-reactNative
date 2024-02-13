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
      screen: 'Receiving',
      access: ['all'],
    },
    {
      name: 'Shelving',
      icon: ShelvingIcon,
      screen: 'Shelving',
      access: ['all'],
    },
    {
      name: 'Delivery Plan',
      icon: DeliveryPlanIcon,
      screen: 'DeliveryPlan',
      access: ['all'],
    },
    {
      name: 'Task Assign',
      icon: TaskAssignIcon,
      screen: 'TaskAssign',
      access: ['all'],
    },
    {
      name: 'Picking',
      icon: PickingIcon,
      screen: 'Picking',
      access: ['all'],
    },
    {
      name: 'Child Packing',
      icon: ChildPackingIcon,
      screen: 'ChildPacking',
      access: ['all'],
    },
    {
      name: 'Master Packing',
      icon: MasterPackingIcon,
      screen: 'MasterPacking',
      access: ['private'],
    },
    {
      name: 'Final Delivery Note',
      icon: DeliveryNoteIcon,
      screen: 'DeliveryNote',
      access: ['all'],
    },
    {
      name: 'Return',
      icon: ReturnIcon,
      screen: 'Return',
      access: ['all'],
    },
    {
      name: 'Print',
      icon: PrinterIcon,
      screen: 'Print',
      access: ['all'],
    },
    {
      name: 'Scan Barcode',
      icon: ScannerIcon,
      screen: 'ScanBarcode',
      access: ['private'],
    },
  ];

  const filteredLinks = navLinks.filter(link => link.access.includes('all'));

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="screen-header flex-row items-center justify-between mb-5 px-6">
          <Text className="text-lg text-[#060239] text-center font-semibold capitalize">
            home
          </Text>
          <ButtonProfile onPress={() => navigation.push('Profile')} />
        </View>
        <View className="flex-row flex-wrap items-center justify-between px-3">
          {filteredLinks.map(item => (
            <View
              className="menu-box items-center w-1/3 mt-8"
              key={item.screen}>
              <Link to={{screen: item.screen}}>
                <View className="flex-col items-center">
                  <View className="icon">
                    <Image className="w-24 h-24" source={item.icon} />
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
