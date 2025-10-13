import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/config';

class SupportService {
  async createQuestion(data: { issueType: string; message: string }) {
    return await httpClient.post(API_ENDPOINTS.SUPPORT.QUESTIONS, data);
  }
}

export const supportService = new SupportService();
