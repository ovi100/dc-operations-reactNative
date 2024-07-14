import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import CodePush from 'react-native-code-push';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OurGlass from '../components/animations/OurGlass';
import Modal from '../components/Modal';
import AppProvider from '../contexts/AppContext';
import { toast } from '../utils';
import AppNavigation from './navigation/AppNavigation';

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL,
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState(null);
  const [version, setVersion] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (message === 'Checking for updates') {
      setModalVisible(false);
      setMessage(null);
    }
    CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
      .then(metadata => {
        if (metadata) {
          const label = metadata.label;
          const versionText = 'v' + Number(label.split('v')[1] / 10);
          setVersion(versionText);
        }
      })
      .catch(error => toast(error.message));
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        updateDialog: false,
      },
      codePushStatusChange,
      codePushDownloadProgress,
    );
  }, []);

  const codePushStatusChange = status => {
    switch (status) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        setModalVisible(true);
        setMessage('Checking for updates');
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        setModalVisible(true);
        setMessage('App is up to date');
        setTimeout(() => {
          setModalVisible(false);
        }, 1500);
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        setModalVisible(true);
        setMessage('Downloading updates');
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        setModalVisible(true);
        setMessage('Installing updates');
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        setMessage('Restarting application');
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        setMessage('An error occurred during the update');
        CodePush.rollback();
        break;
      default:
        setModalVisible(false);
        setModalTitle(null);
        setMessage(null);
        break;
    }
  };

  const codePushDownloadProgress = downloadProgress =>
    setProgress(downloadProgress);

  const percent = (
    (Number(progress?.receivedBytes) / Number(progress?.totalBytes)) *
    100
  ).toFixed(0);

  // console.log('code push status', message);
  // console.log('check', message === 'Checking for updates');
  // console.log('isLatest', message === 'App is up to date');

  return (
    <AppProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigation />
        {modalVisible && (
          <Modal
            isOpen={modalVisible}
            withCloseButton={false}
            modalHeader={
              message === 'Checking for updates'
                ? 'Checking for updates'
                : message === 'App is up to date'
                ? 'App is up to date'
                : 'Live update in progress'
            }
            onPress={() => setModalVisible(false)}>
            {message === 'Checking for updates' && (
              <OurGlass width="w-24" height="h-24" />
            )}
            {message === 'App is up to date' && (
              <>
                <Text className="w-[85%] mx-auto text-base text-center text-black font-semibold">
                  You are already using the latest version of the app.
                </Text>
                <Text className="text-base text-center text-gray-400 font-bold capitalize">
                  {version}
                </Text>
              </>
            )}
            {message === 'Downloading updates' && (
              <>
                <Text className="text-base text-black text-center font-semibold mt-3">
                  Applying the live update ensures you will get the latest
                  version of the application.
                </Text>
                <Text className="text-base text-black text-center font-semibold mb-3">
                  {message}
                  {isNaN(percent) ? `(0%)` : `(${percent}%)`}
                </Text>
                <View className="relative flex-row items-center gap-3">
                  <View className="progress relative bg-gray-300 w-full h-1.5 rounded-full mt-4">
                    <View
                      className="absolute top-0 bg-blue-600 h-1.5 rounded-full"
                      style={{width: `${percent}%`}}
                    />
                  </View>
                </View>
              </>
            )}
          </Modal>
        )}
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default CodePush(codePushOptions)(App);
