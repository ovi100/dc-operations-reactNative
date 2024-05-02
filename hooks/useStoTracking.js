import { useEffect, useState } from 'react';
import { toast } from '../utils';
import { getStorage, setStorage } from './useStorage';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [totalSKU, setTotalSKU] = useState([]);
  const [trackTotalSku, setTrackTotalSku] = useState([]);
  const [stoTrackingInfo, setStoTrackingInfo] = useState(null);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('stoTrackingInfo', setStoTrackingInfo, 'object');
      await getStorage('trackTotalSku', setTrackTotalSku, 'object');
    };
    getAsyncStorage();
  }, [stoItems, totalSKU]);

  useEffect(() => {
    const cachedData = {stoItems, totalSKU};
    const result = totalSKU.map(item => calculateSku(item));
    setStorage('stoTrackingInfo', cachedData);
    setStorage('trackTotalSku', result);
    setStoTrackingInfo(cachedData);
    setTrackTotalSku(result);
  }, [stoItems, totalSKU]);

  const addToSTO = article => {
    const index = stoItems.findIndex(
      item => item.sto === article.sto && item.material === article.material,
    );

    if (index === -1) {
      let message = 'Item added to STO list';
      setStoItems([...stoItems, article]);
      toast(message);
    } else {
      let message = 'Item updated in STO list';
      const newItems = [...stoItems];
      newItems[index].pickedQuantity =
        newItems[index].pickedQuantity + article.pickedQuantity;
      setStoItems(newItems);
      toast(message);
    }
  };

  const addToTotalSku = stoItem => {
    const index = totalSKU.findIndex(item => item.sto === stoItem.sto);
    if (index === -1) {
      setTotalSKU([...totalSKU, stoItem]);
    } else {
      const newItems = [...totalSKU];
      newItems[index].totalSku = stoItem.totalSku;
      setTotalSKU(newItems);
    }
  };

  const calculateSku = stoItem => {
    const filteredSto = stoItems.filter(
      item => item.sto === stoItem.sto && item.quantity !== item.pickedQuantity,
    );
    const result = {
      ...stoItem,
      remainingSku:
        filteredSto.length === stoItem.totalSku || filteredSto.length === 0
          ? filteredSto.length
          : stoItem.totalSku - filteredSto.length,
    };

    return result;
  };

  const STOInfo = {
    stoItems,
    setStoItems,
    addToSTO,
    totalSKU,
    setTotalSKU,
    addToTotalSku,
    stoTrackingInfo,
    setStoTrackingInfo,
    trackTotalSku,
  };

  return STOInfo;
};

export default useStoTracking;
