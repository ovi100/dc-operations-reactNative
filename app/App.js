import React, { useEffect, useState } from 'react';
import CodePush from 'react-native-code-push';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CodePushModal from '../components/CodePushModal';
import AppProvider from '../contexts/AppContext';
import AppNavigation from './navigation/AppNavigation';

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL,
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
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
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        setModalVisible(true);
        setMessage('Downloading update');
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        setModalVisible(true);
        setMessage('Installing update');
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        setMessage('Restarting application ');
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        setMessage('An error occurred during the update');
        break;
      default:
        setMessage(null);
        break;
    }
  };

  const codePushDownloadProgress = downloadProgress =>
    setProgress(downloadProgress);

  return (
    <AppProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigation />
        {progress ? (
          <CodePushModal
            visible={modalVisible}
            header="Live update in progress"
            subHeader="Applying the live update ensures you will get the latest version of the application."
            progress={progress}
            message={message}
          />
        ) : null}
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default CodePush(codePushOptions)(App);
