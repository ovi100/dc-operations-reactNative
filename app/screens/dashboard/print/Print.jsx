import React, { useEffect } from 'react';
import { DeviceEventEmitter, SafeAreaView, Text, View } from 'react-native';
import { ButtonBack, ButtonLg } from '../../../../components/buttons';
import SunmiPrinter from '../../../../utils/sunmi/printer';
import SunmiScanner from '../../../../utils/sunmi/scanner';


const Print = ({ navigation }) => {
  const { startScan, stopScan } = SunmiScanner;
  const { printBarCode, printerText, lineWrap, sendRAWData, setAlignment } = SunmiPrinter;

  const productList = [
    { code: '213234', itemName: 'Item ABC', quantity: 12 },
    { code: '1234235', itemName: 'Item ABC', quantity: 12 },
    { code: '1242342', itemName: 'Item ABC', quantity: 12 },
    { code: '234234', itemName: 'Item ABC', quantity: 12 },
    { code: '234234', itemName: 'Item ABC', quantity: 12 },
    { code: '3423424', itemName: 'Item ABC', quantity: 12 },
    { code: '234234', itemName: 'Item ABC', quantity: 12 },
    { code: '234234', itemName: 'Item ABC', quantity: 12 },
  ];


  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      console.log(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, []);

  const printReceipt = () => {
    printerText('<h2 class="text-center capitalize text-blue-600">demo print</h2>')
    // printerText('From Site: DK11\n');
    // printerText('Destination Site: F049\n');
    // printerText('Product List\n', { fontSize: 24, align: 'center' });
    // productList.forEach(item => {
    //   printerText(`${item.code} ${item.itemName} ${item.quantity}\n`);
    // });
    // printerText('\n');
    // printerText('STO Id: 684621\n');

    // setAlignment('center');
    printBarCode('3529212', 8, 380, 4, 2);
    // printerText('\n');
    lineWrap(5);
  };
  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            sunmi printer
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <ButtonLg title="PRINT NOW" onPress={printReceipt} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Print;