import {useEffect, useState} from 'react';
import {toast} from '../utils';
import {getStorage, setStorage} from './useStorage';

const useGRN = () => {
  const [grnItems, setGrnItems] = useState([]);
  const [isUpdatingGrn, setIsUpdatingGrn] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('grnItems', setGrnItems, 'array');
    };
    getAsyncStorage();
    setIsUpdatingGrn(false);
  }, [isUpdatingGrn]);

  const addToGRN = article => {
    const index = grnItems.findIndex(
      item => item.po === article.po && item.material === article.material,
    );

    if (index === -1) {
      let message = 'Item added to GRN list';
      const newItems = [...grnItems, article];
      setStorage('grnItems', newItems);
      setGrnItems(newItems);
      setIsUpdatingGrn(true);
      toast(message);
    } else {
      let message = 'Item updated in GRN list';
      const newItems = [...grnItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setStorage('grnItems', newItems);
      setGrnItems(newItems);
      setIsUpdatingGrn(true);
      toast(message);
    }

    setIsUpdatingGrn(false);
  };

  const GRNInfo = {
    grnItems,
    setGrnItems,
    addToGRN,
    setIsUpdatingGrn,
  };

  return GRNInfo;
};

export default useGRN;
