
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useAppContext from "../../../../hooks/useAppContext";
import { toast, validateInput } from "../../../../utils";
import { ButtonBack, ButtonLoading, ButtonLogin } from "../../../../components/buttons";
import styles from "../../../../styles/button";
import { getStorage, setStorage } from "../../../../hooks/useStorage";
import { EyeInvisibleIcon, EyeVisibleIcon } from "../../../../constant/icons";

const ChangePassword = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { setUser } = authInfo;
  const [inputType, setInputType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const API_URL = "https://shwapnooperations.onrender.com/api/user/";
  const [token, setToken] = useState("");

  useEffect(() => {
    getStorage("token", setToken, "string");
  }, []);

  const toggleType = () => {
    setInputType((current) => !current);
  };

  const updatePassword = () => {
    setPasswordError(validateInput("password", password));
    if (password) {
      setIsLoading(true);
      try {
        fetch(API_URL + `${route.params.id}`, {
          method: "PATCH",
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: password }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status) {
              toast("password changed successfully");
              const user = data.user;
              setUser(user);
              setStorage("user", user);
              navigation.push('Profile');
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            change password
          </Text>
        </View>
        <View className="content mt-5 pt-5">
          <View className="password relative">
            <TextInput
              className={`border ${passwordError ? "border-red-500" : "border-[#bcbcbc]"
                } h-[55px] text-gray-500 rounded-[5px] px-4`}
              placeholder="Enter new password"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              secureTextEntry={!inputType}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError(validateInput("password", value));
              }}
            />
            {password ? (
              <TouchableOpacity
                className="absolute right-3 top-5"
                onPress={toggleType}
              >
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