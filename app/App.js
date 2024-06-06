import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import CodePush from 'react-native-code-push';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProvider from '../contexts/AppContext';
import AppNavigation from './navigation/AppNavigation';

let codePushOptions = {checkFrequency: CodePush.CheckFrequency.MANUAL};

const App = () => {
  const [progress, setProgress] = useState(false);

  useEffect(() => {
    CodePush.sync(
      {
        updateDialog: true,
        installMode: CodePush.InstallMode.IMMEDIATE,
      },
      statusChangedCallback,
      downloadProgressCallback,
    );
  }, []);

  const statusChangedCallback = status => {
    switch (status) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        break;
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        setProgress(false);
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        setProgress(false);
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        setProgress(false);
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        setProgress(false);
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        setProgress(false);
        break;
    }
  };

  const downloadProgressCallback = progress => {
    setPercent(progress);
  };

  const showProgressView = () => {
    return (
      <Modal visible={true} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
            }}>
            <Text>In Progress.......</Text>

            <View style={{alignItems: 'center'}}>
              <Text style={{marginTop: 16}}>{`${(
                Number(progress?.receivedBytes) / 1048576
              ).toFixed(2)}MB/${(
                Number(progress?.totalBytes) / 1048576
              ).toFixed(2)}`}</Text>
              <ActivityIndicator style={{marginVertical: 8}} color={'blue'} />
              <Text>
                {(
                  (Number(progress?.receivedBytes) /
                    Number(progress?.totalBytes)) *
                  100
                ).toFixed(0)}
                %
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <AppProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigation />
        {progress ? showProgressView() : null}
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default CodePush(codePushOptions)(App);
