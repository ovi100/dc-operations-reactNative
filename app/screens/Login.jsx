import React, {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ButtonLoading, ButtonLogin} from '../../components/buttons';
import {
  EyeInvisibleIcon,
  EyeVisibleIcon,
  LoginBGImage,
} from '../../constant/icons';
import useAppContext from '../../hooks/useAppContext';
import {setStorage} from '../../hooks/useStorage';
import styles from '../../styles/button';
import {validateInput} from '../../utils';

const Login = ({navigation}) => {
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {authInfo} = useAppContext();
  const {setUser, setToken} = authInfo;
  const [inputType, setInputType] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    const showKeyboard = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideKeyboard = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showKeyboard.remove();
      hideKeyboard.remove();
    };
  }, []);

  const toggleType = () => {
    setInputType(current => !current);
  };

  const handleLogin = () => {
    setEmailError(validateInput('email', email));
    setPasswordError(validateInput('password', password));
    if (email && password) {
      setIsLoading(true);
      try {
        let user = {email, password};
        fetch(API_URL + 'user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        })
          .then(response => response.json())
          .then(data => {
            if (data.status) {
              const token = data.token;
              const user = data.user;
              setUser(user);
              setToken(token);
              setStorage('user', user);
              setStorage('token', token);
              if (token) {
                navigation.push('home');
              } else {
                navigation.push('Login');
              }
            } else {
              alert(data.message);
            }
            setIsLoading(false);
          })
          .catch(error => {
            alert(error);
            setIsLoading(false);
          });
      } catch (error) {
        alert(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <View className="bg-white h-full w-full">
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Image className="h-full w-full absolute" source={LoginBGImage} />

      {/* title and form */}
      <View
        className={`h-full w-full flex justify-around pt-40 ${
          keyboardStatus ? 'pb-0' : 'pb-10'
        }`}>
        {/* title */}
        <View className={'flex items-center'}>
          <Text className="text-white font-bold tracking-wider text-5xl">
            Login
          </Text>
        </View>

        {/* form */}
        <View
          className={`flex items-center mx-5 ${keyboardStatus ? 'mt-5' : ''}`}>
          <View className="w-full rounded-2xl px-3 mb-4">
            <View className="email relative">
              <TextInput
                className={`border ${
                  emailError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
                placeholder="Email"
                selectionColor="#bcbcbc"
                inputMode="email"
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
                className={`border ${
                  passwordError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[55px] text-[#a9a9a9] rounded-[5px] px-4`}
                placeholder="Password"
                selectionColor="#bcbcbc"
                secureTextEntry={!inputType}
                onChangeText={value => {
                  setPassword(value);
                  setPasswordError(validateInput('password', value));
                }}
              />
              {password ? (
                <TouchableOpacity
                  className="absolute right-3 top-4"
                  onPress={toggleType}>
                  <Image
                    className="w-6 h-6"
                    source={inputType ? EyeInvisibleIcon : EyeVisibleIcon}
                  />
                </TouchableOpacity>
              ) : null}

              {passwordError && (
                <Text className="absolute right-2 top-3 text-red-500 mt-1">
                  {passwordError}
                </Text>
              )}
            </View>
          </View>

          <View className="w-full px-3">
            {isLoading ? (
              <ButtonLoading buttonStyles={styles.buttonLoginLoading} />
            ) : (
              <ButtonLogin
                title="Login"
                buttonStyles={styles.buttonLogin}
                textStyles={styles.lgText}
                onPress={emailError || passwordError ? null : handleLogin}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Login;
