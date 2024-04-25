import { useState } from 'react';
import { toast } from '../utils';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [countStoSKU, setCountStoSKU] = useState([]);
  const [isFirstStoItem, setIsFirstStoItem] = useState(true);

  const addToSTO = article => {
    const index = stoItems.findIndex(
      item => item.sto === article.sto && item.material === article.material,
    );

    if (index === -1) {
      let count = 0;
      let message = 'Item added to STO list';
      toast(message);
      setStoItems([...stoItems, article]);
      // setCountSKU([...countSKU, {sto: article.sto, totalSKU: count++}]);
      setIsFirstStoItem(false);
    } else {
      let message = 'Item updated in STO list';
      toast(message);
      const newItems = [...stoItems];
      newItems[index].quantity = newItems[index].quantity + article.quantity;
      setStoItems(newItems);
    }
  };

  const addToSTOCount = stoItem => {
    const index = countStoSKU.findIndex(item => item.sto === stoItem.sto);

    if (index === -1) {
      let count = 0;
      setCountStoSKU([...countStoSKU, {sto: stoItem.sto, totalSKU: count++}]);
      setIsFirstStoItem(false);
    } else {
      const newItems = [...countStoSKU];
      newItems[index].totalSKU = newItems[index].totalSKU + count++;
      setStoItems(newItems);
    }
  };

  return {
    stoItems,
    setStoItems,
    addToSTO,
    countStoSKU,
    setCountStoSKU,
    addToSTOCount,
    isFirstStoItem,
    setIsFirstStoItem,
  };
};

export default useStoTracking;
