import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/config';

class AdminSupportService {
  async getQuestions() {
    return await httpClient.get(API_ENDPOINTS.SUPPORT.QUESTIONS);
  }

  async replyToQuestion(questionId: string, message: string) {
    return await httpClient.post(`${API_ENDPOINTS.SUPPORT.QUESTIONS}/${questionId}/reply`, { message });
  }
}

export const adminSupportService = new AdminSupportService();
