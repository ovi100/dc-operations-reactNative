import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import { toast } from '.';

const checkBarcode = async (
  token,
  barcode,
  articles,
  route,
  fnBarcode,
  fnIsChecking,
) => {
  console.log(token, barcode, route, articles.length);
  try {
    fnIsChecking(true);
    await fetch(
      'https://api.shwapno.net/shelvesu/api/barcodes/barcode/' + barcode,
      {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(result => {
        if (result.status) {
          const isValidBarcode = result.data.barcode.includes(barcode);
          const isScannable = articles.some(
            article =>
              article.material === barcode &&
              !(article.material.startsWith('24') && article.unit === 'KG'),
          );
          const article = articles.find(
            item => item.material === result.data.material,
          );
          if (!isScannable && article) {
            Toast.show({
              type: 'customInfo',
              text1: `Please receive ${barcode} by taping on the product`,
            });
          } else if (isScannable && article && isValidBarcode) {
            navigation.replace(route, article);
          } else {
            Toast.show({
              type: 'customInfo',
              text1: 'Article not found!',
            });
          }
        } else {
          Toast.show({
            type: 'customError',
            text1: result.message,
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
  } finally {
    fnBarcode('');
    fnIsChecking(false);
  }
};

const addTempData = async (token, grnItem) => {
  try {
    await fetch(API_URL + 'api/tempData/upsert', {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(grnItem),
    })
      .then(response => response.json())
      .then(data => toast(data.message))
      .catch(error => toast(error.message));
  } catch (error) {
    toast(error.message);
  }
};

const deleteTempData = async (token, id) => {
  try {
    await fetch(API_URL + `api/tempData/${id}`, {
      method: 'DELETE',
      headers: {
        authorization: token,
      },
    })
      .then(response => response.json())
      .then(data => toast(data.message))
      .catch(error => toast(error.message));
  } catch (error) {
    toast(error.message);
  }
};

export { addTempData, checkBarcode, deleteTempData };

