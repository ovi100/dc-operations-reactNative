import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import SunmiScanner from '../utils/sunmi/scanner';

const useScan = () => {
  const {startScan, stopScan} = SunmiScanner;
  let barcode = null;

  useEffect(() => {
    startScan();
    const handleScanData = data => {
      barcode = data.code;
      // console.log(barcode);
    };

    DeviceEventEmitter.addListener('ScanDataReceived', handleScanData);

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived', handleScanData);
    };
  }, []);

  return barcode;
};

export default useScan;
