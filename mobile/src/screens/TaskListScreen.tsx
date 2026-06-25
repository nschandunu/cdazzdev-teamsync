import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { fetchMobileAPI } from '../utils/api';

const CACHE_KEY = '@tasks_cache';

type TaskStackParamList = {
  Tasks: undefined;
  TaskDetail: { task: any };
};

type Props = NativeStackScreenProps<TaskStackParamList, 'Tasks'> & {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function TaskListScreen({ navigation, setToken }: Props) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadTasks = async () => {
    try {
      // 1. Check network status
      const networkState = await Network.getNetworkStateAsync();
      
      if (!networkState.isConnected) {
        setIsOffline(true);
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) setTasks(JSON.parse(cached));
        return;
      }

      setIsOffline(false);
      
      // 2. Fetch projects first to get the active project ID
      const projects = await fetchMobileAPI('/projects');
      if (projects.length > 0) {
        const projectId = projects[0].id;
        
        // 3. Fetch tasks for this project
        const response = await fetchMobileAPI(`/projects/${projectId}/tasks`);
        const fetchedTasks = response.data || [];
        
        setTasks(fetchedTasks);
        
        // REQUIREMENT: Cache the last successful fetch locally
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetchedTasks));
      }
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        await SecureStore.deleteItemAsync('access_token');
        setToken(null);
        return;
      }

      console.error(error);
      // Fallback to cache if API fails even while "online"
      setIsOffline(true);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setTasks(JSON.parse(cached));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTasks();
  }, []);

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      // We will create the TaskDetail screen next
      onPress={() => navigation.navigate('TaskDetail', { task: item })}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.priority}>{item.priority} PRIORITY</Text>
        <Text style={styles.status}>{item.status.replace('_', ' ')}</Text>
      </View>
      <Text style={styles.taskTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity onPress={async () => { await SecureStore.deleteItemAsync('access_token'); setToken(null); }}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* REQUIREMENT: Visible offline indicator */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Offline - Showing cached data</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  logoutText: { color: '#DC2626', fontWeight: '600' },
  offlineBanner: { backgroundColor: '#FEF3C7', padding: 10, alignItems: 'center' },
  offlineText: { color: '#D97706', fontWeight: '600', fontSize: 13 },
  listContainer: { padding: 16 },
  taskCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priority: { fontSize: 11, fontWeight: 'bold', color: '#6B7280' },
  status: { fontSize: 11, fontWeight: 'bold', color: '#2563EB' },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#111827' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40 }
});