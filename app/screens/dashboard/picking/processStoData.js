import {API_URL} from '@env';
import Toast from 'react-native-toast-message';
import {groupBy, toast} from '../../../../utils';

const stoItemsByBin = (stoItems, inventoryItems) => {
  const binObject = groupBy(inventoryItems, 'bin');
  // const filteredBinObject = {};
  const stoItemsByBin = [];

  for (const bin in binObject) {
    const items = stoItems.map(stoItem => {
      const matchedItem = binObject[bin].find(
        binItem => binItem.material === stoItem.material,
      );

      if (matchedItem) {
        return {...stoItem, binQuantity: matchedItem.quantity};
      }
    });

    if (items.length > 0) {
      stoItemsByBin.push({bin, items});
      // filteredBinObject[bin] = items;
    }
  }

  // return filteredBinObject;
  return stoItemsByBin;
};

const updateStoTracking = async (token, postData) => {
  try {
    await fetch(API_URL + 'api/sto-tracking/update', {
      method: 'PATCH',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .then(data => toast(data.message))
      .catch(error => toast(error.message));
  } catch (error) {
    toast(error.message);
  }
};

const updateArticleTracking = async (token, postData) => {
  try {
    await fetch(API_URL + 'api/article-tracking/update', {
      method: 'PATCH',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .then(data => {
        // console.log('article tracking updated', data);
        if (data.status) {
          Toast.show({
            type: 'customSuccess',
            text1: data.message,
          });
        } else {
          Toast.show({
            type: 'customError',
            text1: data.message,
          });
        }
      })
      .catch(error => {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      });
  } catch (error) {
    Toast.show({
      type: 'customError',
      text1: error.message,
    });
  }
};

export {stoItemsByBin, updateArticleTracking, updateStoTracking};
