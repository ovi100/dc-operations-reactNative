import React, { useState } from 'react';
import {
  Image, KeyboardAvoidingView, SafeAreaView,
  ScrollView, Text, TextInput, View
} from 'react-native';
import useBackHandler from '../../../../hooks/useBackHandler';
import { calculateShelfLife, handleDate } from '../../../../utils';
import { BoxIcon } from '../../../../constant/icons';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';

const AuditBatchDetails = ({ navigation, route }) => {
  const { code, description, bin, quantity } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [mfgDate, setMfgDate] = useState(new Date());
  const [expDate, setExpDate] = useState(new Date());
  const [batchNo, setBatchNo] = useState(null);
  const [mrp, setMrp] = useState(null);

  // Custom hook to navigate screen
  useBackHandler('AuditBatchList');

  const updateBatch = () => {
    setIsButtonLoading(true);
    setTimeout(() => {
      setIsButtonLoading(false);
      useBackHandler('AuditBatchList');
    }, 2000);
  };

  const shelfLife = calculateShelfLife(mfgDate?.date, expDate?.date);

  console.log('batch details', route.params);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 h-full px-4">
            <View className="screen-header mb-4">
              <Text className="text-lg text-sh text-center font-medium capitalize">
                article{' ' + code}
              </Text>
              <Text className="text-base text-sh text-center font-medium capitalize">
                {description}
              </Text>
              <Text className="text-base text-sh text-center font-medium">
                {bin}
              </Text>
            </View>
            <View className="content flex-1 justify-between pb-2">
              <View className="input-boxes">
                {/* Quantity Box */}
                <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded px-5 py-2">
                  <View className="box-header flex-row items-center justify-between">
                    <View className="text">
                      <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                        received quantity
                      </Text>
                    </View>
                    <View className="quantity flex-row items-center gap-3">
                      <Image source={BoxIcon} />
                      <Text className="font-bold bg-blue-600 text-white rounded-full py-1 px-2">{quantity}</Text>
                    </View>
                  </View>
                  <View className="input-box mt-2">
                    <TextInput
                      className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                      placeholder="Enter received quantity"
                      placeholderTextColor="#5D80C5"
                      selectionColor="#5D80C5"
                      keyboardType="numeric"
                      // value={newQuantity.toString()}
                      onChangeText={value => {
                        setNewQuantity(value);
                      }}
                    />
                  </View>
                </View>

                <View className="w-full flex-row mt-3">
                  {/* Product Batch */}
                  <View className="w-1/2 product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header flex-row items-center justify-between">
                      <View>
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          batch no.
                        </Text>
                      </View>
                    </View>
                    <View className="input-box mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="Enter batch number"
                        placeholderTextColor="#5D80C5"
                        selectionColor="#5D80C5"
                        keyboardType="numeric"
                        value={batchNo}
                        onChangeText={value => setBatchNo(value)}
                      />
                    </View>
                  </View>

                  {/* Product MRP */}
                  <View className="w-1/2 product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header flex-row items-center justify-between">
                      <View>
                        <Text className="text-base text-[#2E2C3B] font-medium">
                          MRP Price
                        </Text>
                      </View>
                    </View>
                    <View className="input-box mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="Enter MRP price"
                        placeholderTextColor="#5D80C5"
                        selectionColor="#5D80C5"
                        keyboardType="numeric"
                        value={mrp}
                        onChangeText={value => setMrp(value)}
                      />
                    </View>
                  </View>
                </View>
                <View className="w-full flex-row mt-3">
                  {/* Product Manufacturing Date */}
                  <View className="w-1/2 mfg-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header">
                      <View className="">
                        <Text className="text-base text-[#2E2C3B] font-medium">
                          MFG Date
                        </Text>
                        {mfgDate?.text?.length === 8 && (
                          <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                            {mfgDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        value={mfgDate?.text}
                        onChangeText={text => setMfgDate(handleDate(text, 'mfg'))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {/* Product Expiry Date */}
                  <View className="w-1/2 exp-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header">
                      <View className="">
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          exp date
                        </Text>
                        {expDate?.text?.length === 8 && (
                          <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                            {expDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        value={expDate?.text}
                        onChangeText={text => setExpDate(handleDate(text, 'exp'))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>
                </View>

                {(mfgDate?.text?.length === 8 && expDate?.text?.length === 8) && (
                  <View className={`w-1/2 mx-auto ${shelfLife >= 50 ? 'bg-green-600' : shelfLife >= 10 ? 'bg-orange-500' : 'bg-red-600'} rounded-md mt-5 py-3`}>
                    <Text className="text-lg text-white text-center font-bold capitalize">shelf life: {shelfLife + '%'}</Text>
                  </View>
                )}
              </View>
              <View className="button">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg title="Update" onPress={() => updateBatch()} />
                }
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

export default AuditBatchDetails;




