import { useState } from 'react';
import { toast } from '../utils';

const useGRN = () => {
  const [grnItems, setGrnItems] = useState([]);


  const addToGRN = poItem => {
    const index = grnItems.findIndex(
      item => item.po && item.material === poItem.po && poItem.material,
    );

    if (index === -1) {
      let message = 'Item added successfully';

      toast(message);
      setGrnItems([...grnItems, poItem]);
    } else {
      let message = 'Item updated successfully';
      toast(message);
      const newItems = [...grnItems];
      newItems[index] = {...poItem};
      setGrnItems(newItems);
    }
  };

  console.log('GRN items', grnItems, grnItems.length);

  const GRNInfo = {
    grnItems,
    setGrnItems,
    addToGRN,
  };

  return GRNInfo;
};

export default useGRN;
