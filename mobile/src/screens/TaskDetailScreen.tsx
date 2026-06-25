import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchMobileAPI } from '../utils/api';

type TaskStackParamList = {
  Tasks: undefined;
  TaskDetail: { task: any };
};

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route, navigation }: Props) {
  // We passed the basic task info from the List screen
  const { task } = route.params;
  
  const [fullTask, setFullTask] = useState<any>(task);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the full task details (including the comment thread)
    const loadDetails = async () => {
      try {
        const data = await fetchMobileAPI(`/tasks/${task.id}`);
        setFullTask(data);
        setComments(data.comments || []);
      } catch (error) {
        Alert.alert('Error', 'Could not load task details');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [task.id]);

  // REQUIREMENT: Optimistic UI Update with Rollback
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentText = newComment.trim();
    // 1. Generate a temporary ID for the optimistic comment
    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      body: commentText,
      createdAt: new Date().toISOString(),
      author: { name: 'Sending...' } // Visual cue that it's pending
    };

    // 2. Optimistically update the UI instantly
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment(''); // Clear input instantly

    // 3. Make the actual API call in the background
    try {
      await fetchMobileAPI(`/tasks/${task.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentText }),
      });
      
      // If successful, re-fetch to get the real ID and author name from the server
      const refreshedData = await fetchMobileAPI(`/tasks/${task.id}`);
      setComments(refreshedData.comments || []);
      
    } catch (error) {
      // 4. ROLLBACK if the API fails
      setComments((prev) => prev.filter(c => c.id !== tempId));
      Alert.alert('Message Failed', 'Could not post your comment. Please try again.');
    }
  };

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{item.author.name}</Text>
        <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.commentBody}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Task Info */}
      <View style={styles.taskInfo}>
        <View style={styles.badges}>
          <Text style={styles.priority}>{fullTask.priority} PRIORITY</Text>
          <Text style={styles.status}>{fullTask.status.replace('_', ' ')}</Text>
        </View>
        <Text style={styles.title}>{fullTask.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Assignee</Text>
            <Text style={styles.metaValue}>{fullTask.assignee?.name || 'Unassigned'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{fullTask.dueDate ? new Date(fullTask.dueDate).toLocaleDateString() : 'None'}</Text>
          </View>
        </View>

        <Text style={styles.description}>{fullTask.description || 'No description provided.'}</Text>
      </View>

      {/* Comments List */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        {isLoading ? (
          <ActivityIndicator color="#2563EB" />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No comments yet.</Text>}
          />
        )}
      </View>

      {/* Input Area (Keyboard Aware) */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8 },
  backText: { color: '#2563EB', fontWeight: '600', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  taskInfo: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  badges: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priority: { fontSize: 11, fontWeight: 'bold', color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  status: { fontSize: 11, fontWeight: 'bold', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  commentsSection: { flex: 1, padding: 20 },
  commentsTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  commentCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontWeight: '600', color: '#374151', fontSize: 13 },
  commentDate: { color: '#9CA3AF', fontSize: 11 },
  commentBody: { color: '#4B5563', fontSize: 14, marginTop: 4 },
  emptyText: { color: '#6B7280', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendButton: { marginLeft: 12, backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});