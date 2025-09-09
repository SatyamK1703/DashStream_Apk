// Simple data service to avoid circular dependency issues during development
export interface SimpleUser {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  isGuest?: boolean;
}

class SimpleDataService {
  async getCurrentUser(): Promise<SimpleUser | null> {
    try {
      // Return null for now - this will be implemented properly later
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async saveUser(user: SimpleUser): Promise<void> {
    try {
      // Placeholder implementation
      console.log('Saving user:', user);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async clearUser(): Promise<void> {
    try {
      // Placeholder implementation
      console.log('Clearing user');
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  }

  // Add other methods as needed
  async createUser(userData: any): Promise<any> {
    return { success: true, user: userData };
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return { success: true, user: userData };
  }
}

const simpleDataService = new SimpleDataService();
export default simpleDataService;