import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeftIcon,
  ArrowLeftWhiteIcon,
  ScanIcon,
  UserIcon,
} from '../../constant/icons';
import styles from '../../styles/button';

const ButtonLoading = ({buttonStyles}) => {
  return (
    <TouchableOpacity style={buttonStyles}>
      <ActivityIndicator size="small" color="#ffffff" />
    </TouchableOpacity>
  );
};

const ButtonBack = ({navigation}) => {
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image source={ArrowLeftIcon} />
    </TouchableOpacity>
  );
};

const ButtonBackProfile = ({navigation}) => {
  return (
    <TouchableOpacity onPress={() => navigation.back()}>
      <Image className="w-8 h-8" source={ArrowLeftWhiteIcon} />
    </TouchableOpacity>
  );
};

const ButtonScan = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={ScanIcon} style={styles.buttonScan} />
    </TouchableOpacity>
  );
};

const ButtonProfile = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={UserIcon} style={styles.buttonProfile} />
    </TouchableOpacity>
  );
};

const ButtonLogin = ({title, onPress, buttonStyles, textStyles}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={buttonStyles}>
        <Text style={textStyles}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ButtonLg = ({title, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.buttonLg}>
        <Text style={styles.lgText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ButtonXs = ({title}) => {
  return (
    <View style={styles.buttonXs}>
      <Text style={styles.xsText}>{title}</Text>
    </View>
  );
};

export {
  ButtonBack, ButtonBackProfile, ButtonLg,
  ButtonLoading,
  ButtonLogin, ButtonProfile,
  ButtonScan,
  ButtonXs
};
