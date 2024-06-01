import {useEffect, useState} from 'react';
import {toast} from '../utils';
import {getStorage, setStorage} from './useStorage';

const useTPN = () => {
  const [tpnItems, setTpnItems] = useState([]);
  const [isUpdatingTpn, setIsUpdatingTpn] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('tpnItems', setTpnItems, 'array');
    };
    getAsyncStorage();
    setIsUpdatingTpn(false);
  }, [isUpdatingTpn]);

  const addToTPN = article => {
    const index = tpnItems.findIndex(
      item => item.po === article.po && item.material === article.material,
    );

    if (index === -1) {
      let message = 'Item added to TPN list';
      const newItems = [...tpnItems, article];
      setStorage('tpnItems', newItems);
      setTpnItems(newItems);
      setIsUpdatingTpn(true);
      toast(message);
    } else {
      let message = 'Item updated in TPN list';
      const newItems = [...tpnItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setStorage('tpnItems', newItems);
      setTpnItems(newItems);
      setIsUpdatingTpn(true);
      toast(message);
    }

    setIsUpdatingTpn(false);
  };

  const TPNInfo = {
    tpnItems,
    setTpnItems,
    addToTPN,
    setIsUpdatingTpn,
  };

  return TPNInfo;
};

export default useTPN;
