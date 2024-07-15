import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CustomToast from '../../components/CustomToast';
import { ButtonLogin } from '../../components/buttons';
import {
  EyeInvisibleIcon,
  EyeVisibleIcon
} from '../../constant/icons';
import useAppContext from '../../hooks/useAppContext';
import { version } from '../../package.json';
import styles from '../../styles/button';
import { validateInput } from '../../utils';

const Login = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { login } = authInfo;
  const [toggleInput, setToggleInput] = useState(false);
  const [userId, setUserId] = useState('');
  const [userIdError, setUserIdError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const toggleType = () => {
    setToggleInput(current => !current);
  };

  const handleLogin = () => {
    if (!userId) {
      Toast.show({
        type: 'customError',
        text1: 'please enter an email or a staff id',
      });
      return;
    } else if (!password) {
      Toast.show({
        type: 'customError',
        text1: 'please enter a password',
      });
      return;
    } else {
      login(userId, password);
    }
  };

  return (
    <KeyboardAvoidingView className="bg-white flex-1 justify-center py-2.5" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <View className="login-content relative">
        <View className="login-title flex-col items-center mb-5">
          {/* <Image className="w-32 h-20" source={LogoImage} /> */}
          <Text className="text-black text-center font-bold tracking-wider text-5xl">
            Login
          </Text>
        </View>

        <View className="login-form px-5">
          <View className="email-user-id relative mb-4">
            <TextInput
              className={`border ${userIdError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[60px] text-[#a9a9a9] rounded-md px-4`}
              placeholder="Enter email or user id"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              onChangeText={value => {
                setUserId(value);
                setUserIdError(validateInput(/@/.test(value) ? 'email' : 'staff id', value));
              }}
            />
            {userIdError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {userIdError}
              </Text>
            )}
          </View>

          <View className="password relative mb-8">
            <TextInput
              className={`border ${passwordError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[60px] text-[#a9a9a9] rounded-md px-4`}
              placeholder="Password"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              secureTextEntry={!toggleInput}
              onChangeText={value => {
                setPassword(value);
                setPasswordError(validateInput('password', value));
              }}
            />
            {password && (
              <TouchableWithoutFeedback onPress={toggleType}>
                <Image
                  className="w-6 h-6 absolute right-3 top-4"
                  source={toggleInput ? EyeInvisibleIcon : EyeVisibleIcon}
                />
              </TouchableWithoutFeedback>
            )}

            {passwordError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {passwordError}
              </Text>
            )}
          </View>

          <View className="buttons">
            <ButtonLogin
              title="Login"
              buttonStyles={styles.buttonLogin}
              textStyles={styles.lgText}
              onPress={userIdError || passwordError ? null : handleLogin}
            />
            <View className="mt-5">
              <TouchableOpacity onPress={() => navigation.push('Register')}>
                <Text className="text-center text-blue-600 text-lg">Don't have account?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="version-info w-full absolute -bottom-40">
          <Text className="text-gray-400 text-center font-bold capitalize">
            shwapno operations app
          </Text>
          <Text className="text-gray-400 text-center font-bold">
            DV{version}
          </Text>
        </View>
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Login;
