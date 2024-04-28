import { useState } from 'react';
import { toast } from '../utils';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [totalSKU, setTotalSKU] = useState([]);

  const addToSTO = article => {
    const index = stoItems.findIndex(item => item.sto === article.sto);

    if (index === -1) {
      let message = 'Item added to STO list';
      setStoItems([...stoItems, article]);
      toast(message);
    } else {
      let message = 'Item updated in STO list';
      const newItems = [...stoItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setStoItems(newItems);
      toast(message);
    }
  };

  return {
    stoItems,
    setStoItems,
    addToSTO,
    totalSKU,
    setTotalSKU,
  };
};

export default useStoTracking;
