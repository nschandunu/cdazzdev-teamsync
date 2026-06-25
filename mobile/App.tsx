import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import LoginScreen from './src/screens/LoginScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { fetchMobileAPI } from './src/utils/api';

// Notifications are disabled in Expo Go for this workaround.
//
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

type RootStackParamList = {
  Login: undefined;
  App: undefined;
};

type TaskStackParamList = {
  Tasks: undefined;
  TaskDetail: { task: any };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();

function TaskNavigator({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) {
  return (
    <TaskStack.Navigator screenOptions={{ headerShown: false }}>
      <TaskStack.Screen name="Tasks">
        {(props) => <TaskListScreen {...props} setToken={setToken} />}
      </TaskStack.Screen>
      <TaskStack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </TaskStack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) {
          setUserToken(null);
          return;
        }

        try {
          // Validate persisted token before entering protected screens.
          await fetchMobileAPI('/projects');
          setUserToken(token);
        } catch (error: any) {
          if (String(error?.message || '').toLowerCase().includes('unauthorized')) {
            await SecureStore.deleteItemAsync('access_token');
            setUserToken(null);
          } else {
            // Keep existing behavior for transient failures (offline/server down).
            setUserToken(token);
          }
        }
      } catch (e) {
        console.error("Failed to restore token");
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // useEffect(() => {
  //   if (userToken) {
  //     registerForPushNotificationsAsync();
  //   }
  // }, [userToken]);

  // async function registerForPushNotificationsAsync() {
  //   if (Platform.OS === 'android') {
  //     await Notifications.setNotificationChannelAsync('default', {
  //       name: 'default',
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //       lightColor: '#FF231F7C',
  //     });
  //   }

  //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //   let finalStatus = existingStatus;

  //   if (existingStatus !== 'granted') {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     finalStatus = status;
  //   }

  //   if (finalStatus !== 'granted') {
  //     console.log('Push notification permission not granted');
  //     return;
  //   }

  //   try {
  //     const pushTokenString = (await Notifications.getExpoPushTokenAsync({
  //       projectId: 'your-project-id',
  //     })).data;

  //     console.log('Device Push Token:', pushTokenString);
  //   } catch (e: any) {
  //     console.log('Expo Go Limitation Caught: Cannot fetch remote token without a Dev Build.');
  //   }
  // }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            <RootStack.Screen name="Login">
              {(props) => <LoginScreen {...props} setToken={setUserToken} />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="App">
              {() => <TaskNavigator setToken={setUserToken} />}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}