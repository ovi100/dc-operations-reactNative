import {useEffect, useState} from 'react';
import {toast} from '../utils';
import {setStorage} from './useStorage';

const useGRN = () => {
  const [grnItems, setGrnItems] = useState([]);

  useEffect(() => {
    setStorage('grnItems', grnItems);
  }, [setGrnItems]);

  const addToGRN = article => {
    const index = grnItems.findIndex(
      item => item.po && item.material === article.po && article.material,
    );

    if (index === -1) {
      let message = 'Item added to GRN list';
      toast(message);
      setGrnItems([...grnItems, article]);
    } else {
      let message = 'Item updated in GRN list';
      toast(message);
      const newItems = [...grnItems];
      newItems[index] = {...article};
      setGrnItems(newItems);
    }
  };

  const GRNInfo = {
    grnItems,
    setGrnItems,
    addToGRN,
  };

  return GRNInfo;
};

export default useGRN;
