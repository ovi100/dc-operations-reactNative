import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';

const useGRN = () => {
  const [grnPo, setGrnPo] = useState('');
  const [grn, setGrn] = useState({});
  const [grnItems, setGrnItems] = useState([]);

  useEffect(() => {
    const finalGRN = {
      GRNHeader: [
        {
          REF_DOC_NO: grnPo,
        },
      ],
      GRNData: grnItems,
      AuthData: [
        {
          UserID: 'rupom',
          Password: 'bd1975',
        },
      ],
    };
    setGrn(finalGRN);
  }, [grnPo, setGrnItems]);

  const addToGRN = poItem => {
    const index = grnItems.findIndex(
      item => item.po && item.material === poItem.po && poItem.material,
    );

    if (index === -1) {
      let message = 'Item added successfully';

      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );
      setGrnItems([...grnItems, poItem]);
    } else {
      let message = 'Item updated successfully';
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );
      const newItems = [...grnItems];
      newItems[index] = {...poItem};
      setGrnItems(newItems);
    }
  };

  // console.log('From GRN Hook', grn);
  // console.log('From GRN Hook', grnItems);

  const GRNInfo = {
    setGrnPo,
    grn,
    grnItems,
    setGrnItems,
    addToGRN,
  };

  return GRNInfo;
};

export default useGRN;
