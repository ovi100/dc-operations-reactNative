import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ButtonLoading, ButtonLogin } from "../../../../components/buttons";
import { EyeInvisibleIcon, EyeVisibleIcon } from "../../../../constant/icons";
import useActivity from "../../../../hooks/useActivity";
import useAppContext from "../../../../hooks/useAppContext";
import { getStorage, setStorage } from "../../../../hooks/useStorage";
import styles from "../../../../styles/button";
import { toast, validateInput } from "../../../../utils";

const ChangePassword = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { setUser } = authInfo;
  const [inputType1, setInputType1] = useState(false);
  const [inputType2, setInputType2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [token, setToken] = useState("");
  const { createActivity } = useActivity();

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: 'Change Password',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.goBack()} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    getStorage("token", setToken);
  }, []);

  const toggleType1 = () => {
    setInputType1((current) => !current);
  };

  const toggleType2 = () => {
    setInputType2((current) => !current);
  };

  const updatePassword = async () => {
    setPasswordError(validateInput("password", currentPassword));
    setPasswordError(validateInput("password", newPassword));
    if (currentPassword && currentPassword) {
      setIsLoading(true);
      try {
        await fetch(API_URL + 'api/user/' + route.params.id, {
          method: "PATCH",
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: currentPassword, newPassword }),
        })
          .then((response) => response.json())
          .then(async data => {
            if (data.status) {
              toast("password changed successfully");
              const user = data.user;
              setUser(user);
              setStorage("user", user);
              //log user activity
              await createActivity(
                user._id,
                'password_changed',
                `${user.name} changed the password`
              );
              navigation.goBack();
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error)
            toast(error.message);
            setIsLoading(false);
          });
      } catch (error) {
        console.log(error)
        toast(error.message);
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <View className="content mt-5 pt-5">
          <View className="password relative mb-4">
            <TextInput
              className={`border ${passwordError ? "border-red-500" : "border-[#bcbcbc]"
                } h-[55px] text-gray-500 rounded-[5px] px-4`}
              placeholder="Enter current password"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              secureTextEntry={!inputType1}
              onChangeText={(value) => {
                setCurrentPassword(value);
                setPasswordError(validateInput("password", value));
              }}
            />
            {currentPassword ? (
              <TouchableOpacity
                className="absolute right-3 top-5"
                onPress={() => toggleType1()}
              >
                <Image
                  className="w-6 h-6"
                  source={inputType1 ? EyeInvisibleIcon : EyeVisibleIcon}
                />
              </TouchableOpacity>
            ) : null}

            {passwordError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {passwordError}
              </Text>
            )}
          </View>
          <View className="password relative">
            <TextInput
              className={`border ${passwordError ? "border-red-500" : "border-[#bcbcbc]"
                } h-[55px] text-gray-500 rounded-[5px] px-4`}
              placeholder="Enter new password"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              secureTextEntry={!inputType2}
              onChangeText={(value) => {
                setNewPassword(value);
                setPasswordError(validateInput("password", value));
              }}
            />
            {newPassword ? (
              <TouchableOpacity
                className="absolute right-3 top-5"
                onPress={() => toggleType2()}
              >
                <Image
                  className="w-6 h-6"
                  source={inputType2 ? EyeInvisibleIcon : EyeVisibleIcon}
                />
              </TouchableOpacity>
            ) : null}

            {passwordError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {passwordError}
              </Text>
            )}
          </View>
          <View className="w-full mt-5">
            {isLoading ? (
              <ButtonLoading styles='bg-[#AC3232] rounded-md py-4' />
            ) : (
              <ButtonLogin
                title="Change"
                buttonStyles={styles.buttonLogin}
                textStyles={styles.lgText}
                onPress={passwordError ? null : updatePassword}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;