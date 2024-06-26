import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { mergeInventory } from './formatData';

const AuditArticleDetails = ({ navigation, route }) => {
  const { code, articles } = route.params;
  const [article] = mergeInventory(articles);
  console.log('article', article);
  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 px-4">
            <View className="screen-header mb-4">
              <View className="text items-center">
                <TouchableWithoutFeedback>
                  <Text className="text-lg text-sh font-medium capitalize">
                    article{' ' + code}
                  </Text>
                </TouchableWithoutFeedback>
                <Text className="text-base text-sh text-right font-medium capitalize">
                  {article.description}
                </Text>
              </View>
            </View>

            <View className="content h-[85vh] flex-1 justify-around">

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AuditArticleDetails;
