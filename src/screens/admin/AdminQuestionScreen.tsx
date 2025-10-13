import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminSupportStore } from '../../store/useAdminSupportStore';

const AdminQuestionScreen = () => {
  const navigation = useNavigation();
  const { questions, loading, error, fetchQuestions, replyToQuestion } = useAdminSupportStore();
  const [isReplyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenReplyModal = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (selectedQuestionId && replyMessage) {
      await replyToQuestion(selectedQuestionId, replyMessage);
      setReplyModalVisible(false);
      setReplyMessage('');
      fetchQuestions();
    }
  };

  const renderQuestionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.questionItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleOpenReplyModal(item._id)}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.customerName}>{item.user.name}</Text>
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <Text style={styles.questionText}>{item.message}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error fetching questions.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Questions</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={questions}
        renderItem={renderQuestionItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyText}>No questions yet.</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchQuestions} />}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReplyModalVisible}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Question</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
            />
            <Button title="Send Reply" onPress={handleSendReply} />
            <Button title="Cancel" onPress={() => setReplyModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  questionItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadItem: {
    borderLeftColor: '#2563EB',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#6B7280',
  },
  questionText: {
    fontSize: 14,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 10,
  },
});

export default AdminQuestionScreen;