import {SafeAreaView, Text, View} from 'react-native';
import {ButtonBack} from '../../../../components/buttons';
import Table from '../../../../components/table';
import {stoList} from '../../../../constant/data';

const TaskAssign = ({navigation}) => {
  const tableHeader = ['STO ID', 'SKU', 'Outlet Name', 'Status'];
  const dataFields = ['id', 'sku', 'outlet', 'status'];

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            task assign
          </Text>
        </View>

        <View className="content">
          <Table
            header={tableHeader}
            data={stoList}
            dataFields={dataFields}
            navigation={navigation}
            routeName="PickerPackerTaskAssign"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TaskAssign;
