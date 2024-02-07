import { useEffect, useState } from 'react';

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
  }, []);

  console.log(grn);

  const GRNInfo = {
    setGrnPo,
    grn,
    grnItems,
    setGrnItems,
  };

  return GRNInfo;
};

export default useGRN;
