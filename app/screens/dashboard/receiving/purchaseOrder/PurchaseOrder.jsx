import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReadyForShelving from '../../../../../components/animations/ReadyForShelving';
import SearchAnimation from '../../../../../components/animations/Search';
import ServerError from '../../../../../components/animations/ServerError';
import { ButtonBack } from '../../../../../components/buttons';
import Table from '../../../../../components/table';
import useAppContext from '../../../../../hooks/useAppContext';
import { getStorage } from '../../../../../hooks/useStorage';

const PurchaseOrder = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [barcode, setBarcode] = useState('');
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const dataFields = ['material', 'description', 'quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/';

  const { po_id } = route.params;

  const { GRNInfo } = useAppContext();
  const { grn, setGrnPo, grnItems, setGrnItems } = GRNInfo;

  // console.log('receiving--> po id', po_id);

  // console.log('GRN -->', grn);
  // console.log('GRN Items -->', grnItems);

  getStorage('token', setToken, 'string');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const fetchPO = async () => {
        await fetch(API_URL + 'bapi/po/display', {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ po: po_id }),
        })
          .then(response => response.json())
          .then(async result => {
            // console.log('po display', result)
            if (result.status) {
              await fetch(API_URL + 'api/product-shelving/ready',
                {
                  method: 'GET',
                  headers: {
                    authorization: token,
                  },
                },
              )
                .then(res => res.json())
                .then(async shelveData => {
                  if (shelveData.status) {
                    // console.log('shelve data', shelveData)
                    const poItems = result.data.items;
                    const shItems = shelveData.items;
                    let remainingPoItems = await poItems.filter(
                      poItem =>
                        !shItems.some(
                          shItem =>
                            shItem.po === poItem.po &&
                            shItem.code === poItem.material,
                        ),
                    );
                    setArticles(remainingPoItems);
                    setIsLoading(false);
                    setServerError('');
                  }
                  else {
                    const poItems = result.data.items;
                    setArticles(poItems);
                    setIsLoading(false);
                  }
                })
                .catch(error => console.log('Fetch catch', error));
            } else {
              setIsLoading(false);
              setServerError(result.message);
            }
          })
          .catch(error => {
            console.log(error);
          });
      };
      if (token) {
        fetchPO();
        return
      }
    }, [token, po_id]),
  );

  if (barcode.length == 7) {
    const poItem = articles.find(item => item.barcode === barcode);
    if (poItem) {
      navigation.push('PoArticles', poItem);
      setBarcode('')
    } else {
      alert('Items not found!')
    }
  }

  const GRNByPo = grnItems.filter(grnItem => grnItem.PO_NUMBER == po_id);

  // console.log('PO Articles', articles);

  const createGRN = async () => {
    console.log('GRNByPo', GRNByPo);
    console.log('GRN', grn);
    try {
      await fetch(API_URL + 'bapi/grn/create', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(grn),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.status) {
            setGrnPo('');
            setGrnItems([])
            setTimeout(() => {
              navigation.goBack();
            }, 1000);
          }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold uppercase">
            po {po_id}
          </Text>
          {GRNByPo.length ? (<TouchableOpacity className="bg-theme rounded-md p-2.5" onPress={() => createGRN()}>
            <Text className="text-white text-sm text-center font-medium">Create GRN</Text>
          </TouchableOpacity>) : null}

        </View>
        <View className="content flex-1 justify-between py-5">
          {
            isLoading ? (
              <SearchAnimation />
            )
              : (
                <>
                  {
                    serverError ?
                      (<ServerError message={serverError} />)
                      : (
                        <>
                          {
                            articles.length ?
                              (
                                <>
                                  <Table
                                    header={tableHeader}
                                    data={articles}
                                    dataFields={dataFields}
                                    navigation={navigation}
                                  // routeName="PoArticles"
                                  />
                                  <TextInput
                                    className="h-0 border-0 text-center"
                                    caretHidden={true}
                                    autoFocus={true}
                                    value={barcode}
                                    onChangeText={data => setBarcode(data)}
                                  />
                                </>
                              )
                              : (
                                <View className="h-[90%] justify-center">
                                  <ReadyForShelving />
                                </View>
                              )}
                        </>
                      )}
                </>
              )}
        </View>
      </View>
    </SafeAreaView >
  );
};

export default PurchaseOrder;
