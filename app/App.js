import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import CodePush from 'react-native-code-push';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Modal from '../components/Modal';
// import OurGlass from '../components/animations/OurGlass';
import AppProvider from '../contexts/AppContext';
// import { version } from '../package.json';
import AppNavigation from './navigation/AppNavigation';

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL,
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  // const [checkModal, setCheckModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
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
      // case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
      //   setCheckModal(true);
      //   setMessage('Checking for updates');
      //   break;
      // case CodePush.SyncStatus.UP_TO_DATE:
      //   setCheckModal(true);
      //   setMessage('App is up to date');
      //   break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        setModalVisible(true);
        // setCheckModal(false);
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
        break;
      default:
        setMessage(null);
        setModalVisible(false);
        // setCheckModal(false);
        break;
    }
  };

  const codePushDownloadProgress = downloadProgress =>
    setProgress(downloadProgress);

  const percent = (
    (Number(progress?.receivedBytes) / Number(progress?.totalBytes)) *
    100
  ).toFixed(0);

  // console.log('code push message', message);

  return (
    <AppProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigation />
        {progress && (
          <Modal
            isOpen={modalVisible}
            modalHeader="Live update in progress"
            onPress={() => setModalVisible(false)}>
            <Text className="text-base text-black text-center font-semibold mt-3">
              Applying the live update ensures you will get the latest version
              of the application.
            </Text>
            <Text className="text-base text-black text-center font-semibold mb-3">
              {message}
              {percent ? `(${percent}%)` : null}
            </Text>
            <View className="relative flex-row items-center gap-3">
              <View className="progress relative bg-gray-300 w-full h-1.5 rounded-full mt-4">
                <View
                  className="absolute top-0 bg-blue-600 h-1.5 rounded-full"
                  style={{width: `${percent}%`}}
                />
              </View>
            </View>
          </Modal>
        )}
        {/* {checkModal && !progress && (
          <Modal
            isOpen={checkModal}
            modalHeader={
              message === 'App is up to date'
                ? 'App is up to date'
                : 'Checking for update'
            }
            onPress={() => setCheckModal(false)}>
            {message === 'App is up to date' ? (
              <>
                <Text className="w-[85%] mx-auto text-base text-center text-black font-semibold">
                  You are already using the latest version of the app.
                </Text>
                <Text className="text-sm text-center text-gray-400 font-semibold">
                  V{version}
                </Text>
              </>
            ) : (
              <OurGlass width="w-24" height="h-24" />
            )}
          </Modal>
        )} */}
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default CodePush(codePushOptions)(App);
