import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, DeviceEventEmitter, SafeAreaView, Text, View } from 'react-native';
import Ready from '../../../../components/animations/Ready';
import Scan from '../../../../components/animations/Scan';
import { ButtonLg } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const AssignToBin = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { code, description } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [bin, setBin] = useState(null);
  const [isBinExist, setIsBinExist] = useState(false);
  const [token, setToken] = useState('');
  const { startScan, stopScan } = SunmiScanner;
  const API_URL = 'https://shelves-backend.onrender.com/api/bins/';

  useEffect(() => {
    getStorage('token', setToken);
  }, []);

  const getBin = async (code) => {
    setIsLoading(true);
    await fetch(API_URL + `${code}`)
      .then(res => res.json())
      .then(result => {
        console.log(result)
        if (result.status) {
          setBin(result.bin);
          setIsBinExist(result.status);
          setIsLoading(false);
        } else {
          setIsBinExist(result.status);
          toast('Bin not exist!');
          setIsLoading(false);
        }
      });
  }

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      if (data.code) {
        console.log('Barcode', data.code);
        getBin(data.code);
      }
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [isFocused]);

  const postArticleToBin = async () => {
    const assignToBinObject = {
      binID: bin.bin_ID,
      newProducts: [
        {
          article_code: code,
          article_name: description
        }
      ]
    };

    await fetch(API_URL + 'addProducts', {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignToBinObject),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status) {
          toast(data.message);
          navigation.replace('ShelveArticle', { ...route.params, bins: { bin_id: bin.bin_ID, gondola_id: bin.gondola_ID } })
        } else {
          toast(data.message);
        }
      })
      .catch(error => {
        toast(error.message);
      });
  }

  const assignToBin = () => {
    Alert.alert('Are you sure?', 'Assign article to bin', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'OK', onPress: () => postArticleToBin() },
    ]);
  }

  if (isLoading) {
    return (
      <View className="w-full h-4/5 justify-center px-3">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  console.log('Bin assign screen');

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          <Text className="text-xl text-sh text-right font-medium capitalize">
            assign article to bin
          </Text>
        </View>

        <View className="content flex-1 justify-center py-5">
          {!isBinExist ?
            (
              <View className="h-full justify-center pb-2">
                <Scan />
                <Text className="text-xl font-bold text-center mt-5">
                  Please scan a bin barcode
                </Text>
              </View>

            )
            : (
              <View>
                <Ready />
                <View className="mt-5">
                  <ButtonLg title="Assign" onPress={() => assignToBin()} />
                </View>
              </View>
            )
          }
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AssignToBin
