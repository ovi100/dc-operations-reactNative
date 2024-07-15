import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import Dialog from '../../components/Dialog';
import useAppContext from '../../hooks/useAppContext';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const AppNavigation = () => {
  const { authInfo } = useAppContext();
  const { isLoading, user, logout } = authInfo;
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setDialogVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  if (isLoading) {
    return (
      <View className="bg-white flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user !== null ? <AppStack /> : <AuthStack />}
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="Do you want to exit the app?"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => BackHandler.exitApp()}
        leftButtonText="cancel"
        rightButtonText="exit app"
      />
    </NavigationContainer>
  );
};

export default AppNavigation;