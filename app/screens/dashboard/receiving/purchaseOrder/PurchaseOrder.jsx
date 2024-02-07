import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, Text, TextInput, View } from 'react-native';
import ReadyForShelving from '../../../../../components/animations/ReadyForShelving';
import SearchAnimation from '../../../../../components/animations/Search';
import ServerError from '../../../../../components/animations/ServerError';
import { ButtonBack } from '../../../../../components/buttons';
import Table from '../../../../../components/table';
import { getStorage } from '../../../../../hooks/useStorage';

const PurchaseOrder = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isServerError, setIsServerError] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const dataFields = ['material', 'description', 'quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/';

  const { po_id } = route.params;

  console.log('receiving--> po id', po_id);

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
          .then(result => {
            console.log('po display', result)
            if (result.status) {
              setIsServerError(false);
              fetch(API_URL + 'api/product-shelving/ready',
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
                    console.log('shelve data', shelveData)
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
                    setIsServerError(false);
                  }
                  else {
                    setIsServerError(true);
                  }
                })
                .catch(error => console.log('Fetch catch', error));
            } else {
              setIsLoading(false);
              setIsServerError(true);
            }
          })
          .catch(error => {
            console.log(error);
          });
      };
      fetchPO();
    }, [token, po_id]),
  );

  if (barcode.length == 11) {
    navigation.push('PoArticles', { article_id: barcode });
    setBarcode('')
  }

  console.log(barcode)

  console.log('PO Articles', articles);
  console.log('is loading', isLoading);
  console.log('server error', isServerError);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            purchase order {po_id}
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          {
            isLoading ? (
              <SearchAnimation />
            )
              : (
                <>
                  {
                    isServerError ?
                      (<ServerError />)
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
