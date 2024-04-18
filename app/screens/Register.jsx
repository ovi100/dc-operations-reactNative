import React, { useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ButtonLoading, ButtonLogin } from '../../components/buttons';
import { EyeInvisibleIcon, EyeVisibleIcon } from '../../constant/icons';
import useAppContext from '../../hooks/useAppContext';
import styles from '../../styles/button';
import { validateInput } from '../../utils';

const Register = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { register, isLoading } = authInfo;
  const [inputType, setInputType] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);


  const toggleType = () => {
    setInputType(current => !current);
  };

  const handleRegister = () => {
    setNameError(validateInput('name', name));
    setEmailError(validateInput('email', email));
    setPasswordError(validateInput('password', password));
    if (name && email && password) {
      register(name, email, password);
      navigation.push('Login');
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="flex-1 items-center justify-center m-5">
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
              <TouchableOpacity
                className="absolute right-3 top-4"
                onPress={toggleType}>
                <Image
                  className="w-6 h-6"
                  source={inputType ? EyeInvisibleIcon : EyeVisibleIcon}
                />
              </TouchableOpacity>
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
            <ButtonLoading buttonStyles={styles.buttonLoginLoading} />
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
    </SafeAreaView>
  )
}

export default Register;
