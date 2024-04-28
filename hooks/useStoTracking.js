import { useState } from 'react';
import { toast } from '../utils';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [countSKU, setCountSKU] = useState([]);
  const [totalSKU, setTotalSKU] = useState([]);

  const addToSTO = article => {
    const index = stoItems.findIndex(item => item.sto === article.sto);

    if (index === -1) {
      let count = 0;
      let message = 'Item added to STO list';
      toast(message);
      setStoItems([...stoItems, article]);
      console.log('count: ', count + 1);
      setCountSKU([...countSKU, {sto: article.sto, pickedSKU: count + 1}]);
    } else {
      let message = 'Item updated in STO list';
      toast(message);
      const newItems = [...stoItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setStoItems(newItems);
    }
  };

  return {
    stoItems,
    setStoItems,
    addToSTO,
    countSKU,
    setCountSKU,
    totalSKU,
    setTotalSKU,
  };
};

export default useStoTracking;
