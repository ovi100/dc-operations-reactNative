import { useState } from 'react';

const useActivity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL =
    'https://shelves-backend-1-kcgr.onrender.com/api/activity/create';

  const createActivity = async (userId, type, activity) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user: userId, type, activity}),
      });

      if (response.ok) {
        const responseData = await response.json();
      } else {
        console.error('Failed to submit form');
        setError('There is a problem with the server!');
      }
    } catch (error) {
      setError('There is a problem with the server!');
    } finally {
      setLoading(false);
    }
  };

  return {createActivity, loading, error};
};

export default useActivity;
