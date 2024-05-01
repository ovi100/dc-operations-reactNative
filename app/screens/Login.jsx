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
import CustomToast from '../../components/CustomToast';
import { ButtonLogin } from '../../components/buttons';
import {
  EyeInvisibleIcon,
  EyeVisibleIcon,
  LoginBGImage,
  LogoImage,
} from '../../constant/icons';
import useAppContext from '../../hooks/useAppContext';
import styles from '../../styles/button';
import { validateInput } from '../../utils';

const Login = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { login } = authInfo;
  const [inputType, setInputType] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const toggleType = () => {
    setInputType(current => !current);
  };

  const handleLogin = () => {
    setEmailError(validateInput('email', email));
    setPasswordError(validateInput('password', password));
    if (email && password) {
      login(email, password);
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
          <View className="email relative mb-4">
            <TextInput
              className={`border ${emailError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[60px] text-[#a9a9a9] rounded-md px-4`}
              placeholder="Email"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              keyboardType="email-address"
              onChangeText={value => {
                setEmail(value);
                setEmailError(validateInput('email', value));
              }}
            />
            {emailError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {emailError}
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
              secureTextEntry={!inputType}
              onChangeText={value => {
                setPassword(value);
                setPasswordError(validateInput('password', value));
              }}
            />
            {password && (
              <TouchableWithoutFeedback onPress={toggleType}>
                <Image
                  className="w-6 h-6 absolute right-3 top-4"
                  source={inputType ? EyeInvisibleIcon : EyeVisibleIcon}
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
              onPress={emailError || passwordError ? null : handleLogin}
            />
            <View className="mt-5">
              <TouchableWithoutFeedback onPress={() => navigation.push('Register')}>
                <Text className="text-center text-blue-600 text-lg">Don't have account?</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
        <View className="version-info w-full absolute -bottom-44">
          <Text className="text-gray-400 text-center font-bold capitalize">
            shwapno operations app
          </Text>
          <Text className="text-gray-400 text-center font-bold capitalize">
            v 1.0.1
          </Text>
        </View>
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Login;
