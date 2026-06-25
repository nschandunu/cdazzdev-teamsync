import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { fetchMobileAPI } from '../utils/api';

const CACHE_KEY_TASKS = '@tasks_cache';
const CACHE_KEY_PROJECTS = '@projects_cache';

export default function TaskListScreen({ navigation, setToken }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('MEMBER');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Decode JWT to get role
  useEffect(() => {
    const getUserData = async () => {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUserRole(decoded.role || 'MEMBER');
        } catch (e) {
          console.error('Failed to decode token', e);
        }
      }
    };
    getUserData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (!networkState.isConnected) {
        setIsOffline(true);
        const cachedProjects = await AsyncStorage.getItem(CACHE_KEY_PROJECTS);
        const cachedTasks = await AsyncStorage.getItem(CACHE_KEY_TASKS);
        if (cachedProjects) setProjects(JSON.parse(cachedProjects));
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));
        return;
      }

      setIsOffline(false);
      
      // Fetch Projects
      const fetchedProjects = await fetchMobileAPI('/projects');
      setProjects(fetchedProjects);
      await AsyncStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(fetchedProjects));

      if (fetchedProjects.length > 0) {
        // Default to the first project if none is selected
        const targetProjectId = activeProjectId || fetchedProjects[0].id;
        if (!activeProjectId) setActiveProjectId(targetProjectId);
        
        // Fetch Tasks for the active project
        const response = await fetchMobileAPI(`/projects/${targetProjectId}/tasks`);
        const fetchedTasks = response.data || [];
        setTasks(fetchedTasks);
        await AsyncStorage.setItem(CACHE_KEY_TASKS, JSON.stringify(fetchedTasks));
      }
    } catch (error) {
      console.error(error);
      setIsOffline(true);
      const cachedTasks = await AsyncStorage.getItem(CACHE_KEY_TASKS);
      if (cachedTasks) setTasks(JSON.parse(cachedTasks));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reload data when the active project tab changes
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      setIsLoading(true);
      loadData();
    }
  }, [activeProjectId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(true);
  }, [activeProjectId]);

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.taskCard}
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
      {/* Header with User Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tasks</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userRole} ACCOUNT</Text>
          </View>
        </View>
        <TouchableOpacity onPress={async () => { await SecureStore.deleteItemAsync('access_token'); setToken(null); }}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Offline - Showing cached data</Text>
        </View>
      )}

      {/* Project Selector Tabs */}
      <View style={styles.projectTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {projects.map((project) => (
            <TouchableOpacity 
              key={project.id} 
              style={[styles.projectTab, activeProjectId === project.id && styles.projectTabActive]}
              onPress={() => setActiveProjectId(project.id)}
            >
              <Text style={[styles.projectTabText, activeProjectId === project.id && styles.projectTabTextActive]}>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks found for this project.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  roleBadge: { backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  roleText: { color: '#2563EB', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  logoutText: { color: '#DC2626', fontWeight: '600', marginTop: 4 },
  offlineBanner: { backgroundColor: '#FEF3C7', padding: 10, alignItems: 'center' },
  offlineText: { color: '#D97706', fontWeight: '600', fontSize: 13 },
  projectTabsContainer: { backgroundColor: '#fff', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  projectTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  projectTabActive: { backgroundColor: '#2563EB' },
  projectTabText: { color: '#4B5563', fontSize: 13, fontWeight: '500' },
  projectTabTextActive: { color: '#fff', fontWeight: 'bold' },
  listContainer: { padding: 16 },
  taskCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priority: { fontSize: 11, fontWeight: 'bold', color: '#6B7280' },
  status: { fontSize: 11, fontWeight: 'bold', color: '#2563EB' },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#111827' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40 }
});