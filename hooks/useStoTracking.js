import {useEffect, useState} from 'react';
import {toast} from '../utils';
import {getStorage, setStorage} from './useStorage';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  let [stoInfo, setStoInfo] = useState([]);
  const [isUpdatingSto, setIsUpdatingSto] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('stoItems', setStoItems, 'array');
      await getStorage('stoInfo', setStoInfo, 'array');
    };
    getAsyncStorage();
    setIsUpdatingSto(false);
  }, [isUpdatingSto]);

  const addToSTO = article => {
    const index = stoItems.findIndex(
      item => item.sto === article.sto && item.material === article.material,
    );

    if (index === -1) {
      let message = 'Item added to STO list';
      const newItems = [...stoItems, article];
      setStorage('stoItems', newItems);
      setStoItems(newItems);
      setIsUpdatingSto(true);
      toast(message);
    } else {
      let message = 'Item updated in STO list';
      const newItems = [...stoItems];
      newItems[index].pickedQuantity =
        newItems[index].pickedQuantity + article.pickedQuantity;
      setStorage('stoItems', newItems);
      setStoItems(newItems);
      setIsUpdatingSto(true);
      toast(message);
    }
    setIsUpdatingSto(false);
  };

  const addToStoInfo = stoItem => {
    const index = stoInfo.findIndex(item => item.sto === stoItem.sto);
    if (index === -1) {
      const newItems = [...stoInfo, stoItem];
      setStorage('stoInfo', newItems);
      setStoInfo(newItems);
      setIsUpdatingSto(true);
    } else {
      const newItems = [...stoInfo];
      newItems[index].totalSku = stoItem.totalSku;
      setStorage('stoInfo', newItems);
      setStoInfo(newItems);
      setIsUpdatingSto(true);
    }
    setIsUpdatingSto(false);
  };

  const StoInfo = {
    stoItems,
    setStoItems,
    addToSTO,
    addToStoInfo,
    stoInfo,
    setStoInfo,
    setIsUpdatingSto,
  };

  return StoInfo;
};

export default useStoTracking;
