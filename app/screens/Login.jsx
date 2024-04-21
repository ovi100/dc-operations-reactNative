import React, { useState } from 'react';
import {
  Image,
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
    <View className="bg-white h-full w-full">
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Image className="h-full w-full absolute -top-8" source={LoginBGImage} />

      {/* title and form */}
      <View className={`h-full w-full flex justify-around pt-40`}>
        {/* title */}
        <View className={'flex items-center'}>
          <Text className="text-white font-bold tracking-wider text-5xl">
            Login
          </Text>
        </View>

        {/* form */}
        <View className={`flex items-center mx-5`}>
          <View className="w-full rounded-2xl px-3 mb-4">
            <View className="email relative">
              <TextInput
                className={`border ${emailError ? 'border-red-500' : 'border-[#bcbcbc]'
                  } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
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
          </View>
          <View className="w-full rounded-2xl px-3 mb-4">
            <View className="password relative">
              <TextInput
                className={`border ${passwordError ? 'border-red-500' : 'border-[#bcbcbc]'
                  } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
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
          </View>

          <View className="w-full px-3">
            <ButtonLogin
              title="Login"
              buttonStyles={styles.buttonLogin}
              textStyles={styles.lgText}
              onPress={emailError || passwordError ? null : handleLogin}
            />
            <View className="text-center mt-5">
              <TouchableWithoutFeedback onPress={() => navigation.push('Register')}>
                <Text className="text-center text-blue-600 text-lg">Don't have account?</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </View>
      <CustomToast />
    </View>
  );
};

export default Login;
