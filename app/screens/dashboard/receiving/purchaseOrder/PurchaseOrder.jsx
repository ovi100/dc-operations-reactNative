import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, SafeAreaView, Text, View} from 'react-native';
import DataNotFound from '../../../../../components/DataNotFound';
import {ButtonBack} from '../../../../../components/buttons';
import Table from '../../../../../components/table';
import {getStorage} from '../../../../../hooks/useStorage';

const PurchaseOrder = ({navigation, route}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const dataFields = ['material', 'description', 'quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/po/display';

  const {id} = route.params;

  console.log('receiving--> po id', id);

  getStorage('token', setToken, 'string');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const fetchPO = async () => {
        await fetch(API_URL, {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({po: id.toString()}),
        })
          .then(response => response.json())
          .then(result => {
            fetch(
              'https://shwapnooperation.onrender.com/api/product-shelving/ready',
              {
                method: 'GET',
                headers: {
                  authorization: token,
                },
              },
            )
              .then(res => res.json())
              .then(shelveData => {
                if (result.status) {
                  const poItems = result.data.items;
                  const shItems = shelveData.items;
                  let remainingPoItems = poItems.filter(
                    poItem =>
                      !shItems.some(
                        shItem =>
                          shItem.po === poItem.po &&
                          shItem.code === poItem.material,
                      ),
                  );
                  setArticles(remainingPoItems);
                  setIsLoading(false);
                }
              })
              .catch(error => console.log('Fetch catch', error));
          })
          .catch(error => {
            console.log(error);
          });
      };
      fetchPO();
    }, [token, id]),
  );

  console.log('PO Articles', articles);

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            purchase order {id}
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              {articles.length ? (
                <Table
                  header={tableHeader}
                  data={articles}
                  dataFields={dataFields}
                  navigation={navigation}
                  routeName="PoArticles"
                />
              ) : (
                <View className="h-[90%] justify-center ">
                  <DataNotFound message="No purchase order left" />
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PurchaseOrder;
