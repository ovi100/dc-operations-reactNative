import React, { useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Text, TextInput, TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../components/CustomToast';
import { ButtonLogin } from '../../components/buttons';
import { EyeInvisibleIcon, EyeVisibleIcon } from '../../constant/icons';
import styles from '../../styles/button';
import { validateInput } from '../../utils';

const Register = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const API_URL = 'https://shwapnooperation.onrender.com/api/user';

  const toggleType = () => {
    setInputType(current => !current);
  };

  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        Toast.show({
          type: 'customError',
          text1: 'Check your internet connection',
        });
        setIsLoading(false);
      }

      const data = await response.json();
      if (data.status) {
        Toast.show({
          type: 'customSuccess',
          text1: data.message,
        });
        const user = data.user;

        //log user activity
        await createActivity(
          user._id,
          'register',
          `${user.name} register with email ${user.email}`,
        );

        setTimeout(() => {
          setIsLoading(false);
          navigation.push('Login');
        }, 1500);
      } else {
        Toast.show({
          type: 'customError',
          text1: data.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'customInfo',
        text1: error.message,
      });
    }
  };

  const handleRegister = () => {
    setNameError(validateInput('name', name));
    setEmailError(validateInput('email', email));
    setPasswordError(validateInput('password', password));
    if (name && email && password) {
      register(name, email, password);
    }
  };

  return (
    <KeyboardAvoidingView className="bg-white flex-1 justify-center py-2.5" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="register-content px-5">
        <View className="name relative mb-4">
          <TextInput
            className={`border ${nameError ? 'border-red-500' : 'border-[#bcbcbc]'
              } h-[60px] text-[#a9a9a9] rounded-md px-4`}
            placeholder="Enter name"
            placeholderTextColor='#bcbcbc'
            selectionColor="#bcbcbc"
            onChangeText={value => {
              setName(value);
              setNameError(validateInput('name', value));
            }}
          />
          {nameError && (
            <Text className="absolute right-2 top-3 text-red-500 mt-1">
              {nameError}
            </Text>
          )}
        </View>
        <View className="email relative mb-4">
          <TextInput
            className={`border ${emailError ? 'border-red-500' : 'border-[#bcbcbc]'
              } h-[60px] text-[#a9a9a9] rounded-md px-4`}
            placeholder="Enter email"
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
        <View className="password relative mb-4">
          <TextInput
            className={`border ${passwordError ? 'border-red-500' : 'border-[#bcbcbc]'
              } h-[60px] text-[#a9a9a9] rounded-md px-4`}
            placeholder="Enter password"
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
          {isLoading ? (
            <TouchableWithoutFeedback>
              <View className="h-[60px] items-center justify-center bg-[#AC3232] rounded-md">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            </TouchableWithoutFeedback>
          ) : (
            <>
              <ButtonLogin
                title="Register"
                buttonStyles={styles.buttonLogin}
                textStyles={styles.lgText}
                onPress={nameError || emailError || passwordError ? null : handleRegister}
              />
              <View className="text-center mt-5">
                <TouchableWithoutFeedback onPress={() => navigation.push('Login')}>
                  <Text className="text-center text-blue-600 text-lg">Have an account?</Text>
                </TouchableWithoutFeedback>
              </View>
            </>
          )}
        </View>
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  )
}

export default Register;
