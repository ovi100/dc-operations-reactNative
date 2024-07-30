import { API_URL } from '@env';
import CheckBox from '@react-native-community/checkbox';
import { HeaderBackButton } from '@react-navigation/elements';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList,
  Keyboard, SafeAreaView, Text,
  TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import FalseHeader from '../../../../components/FalseHeader';
import { ButtonLg, ButtonLoading, ButtonProfile } from '../../../../components/buttons';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';

const DamageList = ({ navigation, route }) => {
  const { dn, articles } = route.params;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [damageList, setDamageList] = useState(articles);
  const [selectedList, setSelectedList] = useState([]);
  const [token, setToken] = useState('');
  const tableHeader = ['Code', 'Report Type', 'Quantity'];

  // Custom hook to navigate screen
  useBackHandler('Damage');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: `DN ${dn}`,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('Damage')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
    }
    getAsyncStorage();
  }, []);

  const handleEndReached = useCallback(() => {
    setFlatListFooterVisible(false);
  }, []);

  const renderFooter = () => {
    if (!flatListFooterVisible) return null;

    return (
      <ActivityIndicator />
    );
  };

  const handelCheckbox = id => {
    let newItems = damageList.map(item =>
      id === item._id ? { ...item, selected: !item.selected } : item,
    );
    setSelectedList(newItems.filter(item => item.selected));
    setDamageList(newItems);
    Keyboard.dismiss();
  };

  const uncheckAll = () => {
    const newItems = damageList.map(item => {
      return { ...item, selected: false };
    });
    setDamageList(newItems);
    setSelectedList([]);
    Keyboard.dismiss();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handelCheckbox(item._id)}>
      <View
        key={item._id}
        className={`flex-row items-center border ${item.selected ? 'border-green-500' : 'border-tb'} rounded-lg mt-2.5 p-4`}
      >
        <View className="w-1/3 flex-row items-center">
          <CheckBox
            tintColors={item.selected ? '#56D342' : '#ffffff'}
            value={item.selected}
            onValueChange={() => handelCheckbox(item._id)}
          />
          <Text className="text-black" numberOfLines={1}>
            {item.tpnData.material}
          </Text>
        </View>
        <Text className="w-1/3 text-black text-sm text-center capitalize" numberOfLines={2}>
          {item.damageType ? item.damageType : item.reportType}
        </Text>
        <Text className="w-1/3 text-black text-sm text-center" numberOfLines={1}>
          {item.tpnData.tpnQuantity}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const approveDamageList = async () => {
    if (selectedList.length > 0 && token) {
      setDialogVisible(false);
      setIsButtonLoading(true);
      try {
        selectedList.map(async item => {
          await fetch(API_URL + 'api/tpn/' + item._id, {
            method: 'PATCH',
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ remarks: 'damage report confirm' }),
          })
            .then(response => response.json())
            .then(async data => {
              if (data.status) {
                Toast.show({
                  type: 'customSuccess',
                  text1: data.message,
                });
                const updateTpnData = damageList.filter(damageItem => damageItem._id !== item._id);
                setDamageList(updateTpnData);
              } else {
                Toast.show({
                  type: 'customError',
                  text1: data.message,
                });
                if (data.message.trim() === 'MIS Logged Off the PC where BAPI is Hosted') {
                  //log user activity
                  await createActivity(user._id, 'error', result.message.trim());
                }
              }
            })
            .catch(error => {
              Toast.show({
                type: 'customError',
                text1: error.message,
              });
            });
        })
      } catch (error) {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      } finally {
        uncheckAll();
        setIsButtonLoading(false);
      };
    } else {
      Toast.show({
        type: 'customError',
        text1: 'No item selected!',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between pb-2">
          <View className="table h-[90%]">
            <View className="table-header flex-row bg-th text-center mb-2 p-2">
              {tableHeader.map(th => (
                <Text className="w-1/3 text-white text-sm text-center font-bold" key={th}>
                  {th}
                </Text>
              ))}
            </View>
            {damageList.length === 0 ? (
              <View className="w-full bg-white px-3">
                <Text className="mt-10 text-gray-400 text-lg text-center">No articles left</Text>
              </View>
            ) : (
              <FlatList
                data={damageList}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                initialNumToRender={10}
                onEndReached={handleEndReached}
                ListFooterComponent={articles.length > 10 ? renderFooter : null}
                ListFooterComponentStyle={{ paddingVertical: 10 }}
              />)}
          </View>
          {selectedList.length > 0 && (
            <View className="button">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg
                  title="Confirm"
                  onPress={() => setDialogVisible(true)}
                />
              }
            </View>
          )}
        </View>
      </View>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="Do you want to agree with damage?"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => approveDamageList()}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
      <CustomToast />
    </SafeAreaView >
  )
}

export default DamageList;




