import React, { useState } from 'react';
import {
  Image, KeyboardAvoidingView,
  SafeAreaView, ScrollView, Text, View
} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { BatchIcon, BoxIcon, MrpIcon, StopWatchGreenIcon, StopWatchRedIcon } from '../../../../constant/icons';
import { calculateShelfLife } from '../../../../utils';
// import { ButtonLg, ButtonLoading } from '../../../../components/buttons';

const AuditBatchDetails = ({ navigation, route }) => {
  const { material, description, bin, batch, expiryDate, mfgDate, mrp, quantity } = route.params;
  // const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [newMfgDate, setNewMfgDate] = useState({ date: new Date(mfgDate), text: '' });
  const [newExpDate, setNewExpDate] = useState({ date: new Date(expiryDate), text: '' });
  const [newBatch, setNewBatch] = useState(batch);
  const [newMrp, setNewMrp] = useState(mrp);


  // const updateBatch = () => {
  //   setIsButtonLoading(true);
  //   setTimeout(() => {
  //     setIsButtonLoading(false);
  //     useBackHandler('AuditBatchList');
  //   }, 2000);
  // };

  const shelfLife = calculateShelfLife(newMfgDate?.date, newExpDate?.date);

  // console.log('batch details', batch, expiryDate, mfgDate, mrp, quantity);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 h-full px-4">
            <View className="screen-header mb-4">
              <Text className="text-base text-sh text-center font-medium capitalize">
                article{' ' + material}
              </Text>
              <Text className="text-sm text-sh text-center font-medium capitalize">
                {description}
              </Text>
              <Text className="text-sm text-sh text-center font-medium">
                {bin}
              </Text>
            </View>
            <View className="content flex-1 justify-between pb-2">
              <View className="input-boxes">
                {/* Quantity Box */}
                <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded px-5 py-2">
                  <View className="box-header flex-row items-center gap-3">
                    <View className="icon">
                      <Image className="w-10 h-10" source={BoxIcon} />
                    </View>
                    <View className="text">
                      <Text className="text-xs text-[#2E2C3B] font-medium capitalize">
                        quantity
                      </Text>
                      <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                        {newQuantity}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="w-full flex-row mt-3">
                  {/* Product Batch */}
                  <View className="w-1/2 product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header flex-row items-center gap-3">
                      <View className="icon">
                        <Image className="w-10 h-10" source={BatchIcon} />
                      </View>
                      <View className="text">
                        <Text className="text-xs text-[#2E2C3B] font-medium capitalize">
                          batch no.
                        </Text>
                        <Text className="text-sm text-[#2E2C3B] font-bold capitalize">
                          {newBatch}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Product MRP */}
                  <View className="w-1/2 product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header flex-row items-center gap-3">
                      <View className="icon">
                        <Image className="w-10 h-10" source={MrpIcon} />
                      </View>
                      <View className="text">
                        <Text className="text-xs text-[#2E2C3B] font-medium">
                          MRP
                        </Text>
                        <Text className="text-sm text-[#2E2C3B] font-bold">
                          {newMrp ? newMrp : 'MRP not found'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="w-full relative flex-row items-center bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2  mt-3">
                  <View className="w-1/2">
                    {/* Product Manufacturing Date */}
                    <View className="mfg-date">
                      <View className="box-header flex-row items-center gap-3">
                        <View className="icon">
                          <Image className="w-10 h-10" source={StopWatchGreenIcon} />
                        </View>
                        <View className="text">
                          <Text className="text-xs text-[#2E2C3B] font-medium">
                            MFG Date
                          </Text>
                          <Text className="text-sm text-[#2E2C3B] font-bold capitalize">
                            {mfgDate ? newMfgDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' }) : 'No date found'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Product Expiry Date */}
                    <View className="exp-date mt-2">
                      <View className="box-header flex-row items-center gap-3">
                        <View className="icon">
                          <Image className="w-10 h-10" source={StopWatchRedIcon} />
                        </View>
                        <View className="text">
                          <Text className="text-xs text-[#2E2C3B] font-medium capitalize">
                            expiry Date
                          </Text>
                          <Text className="text-sm text-[#2E2C3B] font-bold capitalize">
                            {expiryDate ? newExpDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' }) : 'No date found'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="bg-gray-400 w-[0.5px] h-4/5" />
                  <View className="w-1/2 flex-col items-center">
                    <Text className="text-sm text-[#2E2C3B] text-center font-medium capitalize">
                      shelf life
                    </Text>
                    <CircularProgress
                      radius={30}
                      value={shelfLife}
                      progressValueColor={shelfLife >= 50 ? 'green' : shelfLife >= 11 ? 'orange' : 'red'}
                      valueSuffix={'%'}
                      duration={2000}
                      strokeColorConfig={[
                        { color: 'red', value: 10 },
                        { color: 'orange', value: 49 },
                        { color: 'green', value: 50 },
                      ]} />
                  </View>
                </View>
              </View>
              {/* <View className="button">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg title="Update" onPress={() => updateBatch()} />
                }
              </View> */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

export default AuditBatchDetails;




