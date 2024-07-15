import { useEffect, useLayoutEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import { ButtonLoading, ButtonLogin } from "../../../../components/buttons";
import CustomToast from '../../../../components/CustomToast';
import useActivity from "../../../../hooks/useActivity";
import useAppContext from "../../../../hooks/useAppContext";
import { getStorage, setStorage } from "../../../../hooks/useStorage";
import styles from "../../../../styles/button";
import { validateInput } from "../../../../utils";

const UpdateProfileInfo = ({ navigation, route }) => {
  const { _id, name, email, staffId, site, screen } = route.params;
  const { authInfo } = useAppContext();
  const { setUser } = authInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [updateName, setName] = useState(name);
  const [updateNameError, setNameError] = useState(null);
  const [updateEmail, setEmail] = useState(email);
  const [updateEmailError, setEmailError] = useState(null);
  const [updateStaffId, setStaffId] = useState(staffId);
  const [updateStaffIdError, setStaffIdError] = useState(null);
  const [token, setToken] = useState("");
  const { createActivity } = useActivity();

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: 'Update Info',
      headerTitleAlign: 'center',
      headerBackVisible: true,
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    getStorage("token", setToken);
  }, []);

  const updateInfo = async () => {
    if (!updateName) {
      Toast.show({
        type: 'customError',
        text1: 'please enter a name',
      });
      return;
    } else if (!updateEmail) {
      Toast.show({
        type: 'customError',
        text1: 'please enter a email',
      });
      return;
    } else if (!updateStaffId) {
      Toast.show({
        type: 'customError',
        text1: 'please enter staff Id',
      });
      return;
    } else if (updateEmailError) {
      Toast.show({
        type: 'customError',
        text1: updateEmailError,
      });
      return;
    } else if (updateStaffIdError) {
      Toast.show({
        type: 'customError',
        text1: updateStaffIdError,
      });
      return;
    } else {
      let newUser = {};
      if (name !== updateName) {
        newUser.name = updateName;
      }

      if (email !== updateEmail) {
        newUser.email = updateEmail;
      }

      if (staffId !== updateStaffId) {
        newUser.staffId = updateStaffId;
      }

      console.log('Updated user', newUser);

      try {
        setIsLoading(true);
        await fetch(API_URL + 'api/user/' + _id, {
          method: "PATCH",
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        })
          .then((response) => response.json())
          .then(async data => {
            console.log('user update response', data);
            if (data.status) {
              Toast.show({
                type: 'customSuccess',
                text1: data.message,
              });
              const user = data.user;
              setUser({ ...user, site });
              setStorage("user", { ...user, site });
              //log user activity
              await createActivity(
                user._id,
                'user_update',
                `${updateName} updated info`
              );
              navigation.replace('Profile', { screen, data });
            }
          })
          .catch((error) => {
            Toast.show({
              type: 'customError',
              text1: error.message,
            });
          });
      } catch (error) {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  console.log(route.params);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <View className="content mt-5 pt-5">
          <View className="updateName relative mb-4">
            <TextInput
              className={`border ${updateNameError ? 'border-red-500' : 'border-[#bcbcbc]'
                } h-[60px] text-[#a9a9a9] rounded-md px-4`}
              placeholder="Enter updateName"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              value={updateName ? updateName : ''}
              onChangeText={value => {
                setName(value);
                setNameError(validateInput('name', value));
              }}
            />
            {updateNameError && (
              <Text className="absolute right-2 top-3 text-red-500 mt-1">
                {updateNameError}
              </Text>
            )}
          </View>
          <View className="updateEmail relative mb-4">
            <TextInput
              className="h-[60px] border border-[#bcbcbc] text-[#a9a9a9] rounded-md px-4"
              placeholder="Enter updateEmail"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              keyboardType="updateEmail-address"
              value={updateEmail ? updateEmail : ''}
              editable={email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? false : true}
              onChangeText={value => {
                setEmail(value);
                setEmailError(validateInput('email', value));
              }}
            />
          </View>
          <View className="staff-id relative mb-4">
            <TextInput
              className="h-[60px] border border-[#bcbcbc] text-[#a9a9a9] rounded-md px-4"
              placeholder="Enter staff id"
              placeholderTextColor='#bcbcbc'
              selectionColor="#bcbcbc"
              keyboardType="number-pad"
              value={updateStaffId ? updateStaffId : ''}
              editable={staffId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffId) ? false : true}
              onChangeText={value => {
                setStaffId(value);
                setStaffIdError(validateInput('staff id', value));
              }}
            />
          </View>
          <View className="w-full mt-5">
            {isLoading ? (
              <ButtonLoading styles='bg-[#AC3232] rounded-md py-4' />
            ) : (
              <ButtonLogin
                title="Update"
                buttonStyles={styles.buttonLogin}
                textStyles={styles.lgText}
                onPress={updateNameError || updateEmailError || updateStaffIdError ? null : updateInfo}
              />
            )}
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default UpdateProfileInfo;

