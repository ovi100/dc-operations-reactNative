import {useEffect, useState} from 'react';
import {toast} from '../utils';
import {getStorage, setStorage} from './useStorage';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [isUpdatingSto, setIsUpdatingSto] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('stoItems', setStoItems, 'array');
    };
    getAsyncStorage();
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

  const STOInfo = {
    stoItems,
    setStoItems,
    addToSTO,
    setIsUpdatingSto,
  };

  return STOInfo;
};

export default useStoTracking;
