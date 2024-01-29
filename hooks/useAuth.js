import { useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(null);

  const authInfo = {
    user,
    setUser,
    token,
    setToken,
  };

  return authInfo;
};

export default useAuth;
