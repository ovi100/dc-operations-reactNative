import { API_URL } from '@env';
import { toast } from '.';

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
      .then(data => {
        if (data.status) {
          toast(data.message);
        } else {
          toast(data.message);
        }
      })
      .catch(error => {
        toast(data.message);
      });
  } catch (error) {
    toast(data.message);
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
      .then(data => {
        toast(data.message);
      })
      .catch(error => {
        toast(error.message);
      });
  } catch (error) {
    toast(error.message);
  }
};

export { addTempData, deleteTempData };

