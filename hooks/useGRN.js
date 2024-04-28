import { useState } from 'react';
import { toast } from '../utils';

const useGRN = () => {
  const [grnItems, setGrnItems] = useState([]);

  const addToGRN = article => {
    const index = grnItems.findIndex(
      item => item.po === article.po && item.material === article.material,
    );

    if (index === -1) {
      let message = 'Item added to GRN list';
      setGrnItems([...grnItems, article]);
      toast(message);
    } else {
      let message = 'Item updated in GRN list';
      const newItems = [...grnItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setGrnItems(newItems);
      toast(message);
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
