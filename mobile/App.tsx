import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import LoginScreen from './src/screens/LoginScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

// Notifications are disabled in Expo Go for this workaround.

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
        setUserToken(token);
      } catch (e) {
        console.error("Failed to restore token");
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // REQUIREMENT: Request Push Notification Permissions
  /*
  useEffect(() => {
    if (userToken) {
      registerForPushNotificationsAsync();
    }
  }, [userToken]);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If they denied it, just return
    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    try {
      // Capture the device push token
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({
        projectId: "YOUR_EXPO_PROJECT_ID", // Not strictly required for local emulator testing
      })).data;

      console.log("Device Push Token:", pushTokenString);
      // In a real app, you would send this token to your NestJS backend here.
    } catch (e: any) {
      console.log("Error getting push token:", e.message);
    }
  }
  */

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