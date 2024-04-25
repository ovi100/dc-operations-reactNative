import { useState } from 'react';
import { toast } from '../utils';

const useStoTracking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [countSKU, setCountSKU] = useState([]);
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
      setCountSKU([...countSKU, {sto: article.sto, totalSKU: count++}]);
      setIsFirstStoItem(false);
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
    isFirstStoItem,
    setIsFirstStoItem,
  };
};

export default useStoTracking;
