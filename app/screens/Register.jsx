import React, { useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { ButtonLogin } from '../../components/buttons';
import { EyeInvisibleIcon, EyeVisibleIcon } from '../../constant/icons';
import styles from '../../styles/button';
import { validateInput } from '../../utils';
import Toast from 'react-native-toast-message';
import CustomToast from '../../components/CustomToast';

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
    <SafeAreaView className="bg-white h-full">
      <View className="mx-5 mt-20">
        <View className="w-full rounded-2xl px-3 mb-4">
          <View className="name relative">
            <TextInput
              className={`border ${nameError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
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
        </View>
        <View className="w-full rounded-2xl px-3 mb-4">
          <View className="email relative">
            <TextInput
              className={`border ${emailError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
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
        </View>
        <View className="w-full rounded-2xl px-3 mb-4">
          <View className="password relative">
            <TextInput
              className={`border ${passwordError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
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
        </View>

        <View className="buttons w-full px-3">
          {isLoading ? (
            <TouchableWithoutFeedback>
              <View className="h-[55px] items-center justify-center bg-[#AC3232] rounded-md">
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
    </SafeAreaView>
  )
}

export default Register;
