// Connection Health Monitor Service
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enhancedApiService from './enhancedApiService';
import { ENV_CONFIG, DEBUG_MODE } from '../config/environment';

export interface ConnectionStatus {
  isOnline: boolean;
  isBackendReachable: boolean;
  networkType: string;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  latency: number;
  lastSuccessfulConnection: string | null;
  failedAttempts: number;
  backendHealth: BackendHealthStatus | null;
}

export interface BackendHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: boolean;
    authentication: boolean;
    fileUpload: boolean;
    notifications: boolean;
  };
}

export interface ConnectionEvent {
  type: 'online' | 'offline' | 'backend_unreachable' | 'backend_restored' | 'quality_changed';
  timestamp: string;
  details?: any;
}

class ConnectionHealthMonitor {
  private static instance: ConnectionHealthMonitor;
  private status: ConnectionStatus;
  private listeners: ((status: ConnectionStatus, event?: ConnectionEvent) => void)[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionHistory: ConnectionEvent[] = [];
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly MAX_HISTORY_SIZE = 100;

  private constructor() {
    this.status = {
      isOnline: false,
      isBackendReachable: false,
      networkType: 'unknown',
      connectionQuality: 'offline',
      latency: 0,
      lastSuccessfulConnection: null,
      failedAttempts: 0,
      backendHealth: null
    };

    this.initializeMonitoring();
  }

  public static getInstance(): ConnectionHealthMonitor {
    if (!ConnectionHealthMonitor.instance) {
      ConnectionHealthMonitor.instance = new ConnectionHealthMonitor();
    }
    return ConnectionHealthMonitor.instance;
  }

  private async initializeMonitoring() {
    try {
      // Load saved status
      await this.loadSavedStatus();
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Start health checks
      this.startHealthChecks();
      
      // Initial connection test
      await this.performFullHealthCheck();
      
      console.log('✅ Connection Health Monitor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Connection Health Monitor:', error);
    }
  }

  private async loadSavedStatus() {
    try {
      const savedStatus = await AsyncStorage.getItem('connectionStatus');
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus);
        this.status.lastSuccessfulConnection = parsed.lastSuccessfulConnection;
        this.status.failedAttempts = parsed.failedAttempts || 0;
      }

      const savedHistory = await AsyncStorage.getItem('connectionHistory');
      if (savedHistory) {
        this.connectionHistory = JSON.parse(savedHistory).slice(-this.MAX_HISTORY_SIZE);
      }
    } catch (error) {
      console.error('Failed to load saved connection status:', error);
    }
  }

  private async saveStatus() {
    try {
      await AsyncStorage.multiSet([
        ['connectionStatus', JSON.stringify({
          lastSuccessfulConnection: this.status.lastSuccessfulConnection,
          failedAttempts: this.status.failedAttempts
        })],
        ['connectionHistory', JSON.stringify(this.connectionHistory.slice(-this.MAX_HISTORY_SIZE))]
      ]);
    } catch (error) {
      console.error('Failed to save connection status:', error);
    }
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.status.isOnline;
      this.status.isOnline = state.isConnected || false;
      this.status.networkType = state.type || 'unknown';

      // Network state changed
      if (wasOnline !== this.status.isOnline) {
        const event: ConnectionEvent = {
          type: this.status.isOnline ? 'online' : 'offline',
          timestamp: new Date().toISOString(),
          details: {
            networkType: this.status.networkType,
            previousState: wasOnline
          }
        };

        this.addConnectionEvent(event);
        this.updateConnectionQuality();

        if (this.status.isOnline) {
          // Network restored, test backend immediately
          this.performFullHealthCheck();
        } else {
          this.status.isBackendReachable = false;
          this.status.connectionQuality = 'offline';
        }

        this.notifyListeners(event);
      }
    });
  }

  private startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      if (this.status.isOnline) {
        await this.performBackendHealthCheck();
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private async performFullHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity first
      const networkState = await NetInfo.fetch();
      this.status.isOnline = networkState.isConnected || false;
      this.status.networkType = networkState.type || 'unknown';

      if (!this.status.isOnline) {
        this.status.isBackendReachable = false;
        this.status.connectionQuality = 'offline';
        return;
      }

      // Test backend health
      await this.performBackendHealthCheck();
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.status.isBackendReachable = false;
    } finally {
      this.status.latency = Date.now() - startTime;
      this.updateConnectionQuality();
      this.notifyListeners();
    }
  }

  private async performBackendHealthCheck(): Promise<void> {
    const wasBackendReachable = this.status.isBackendReachable;
    const startTime = Date.now();

    try {
      // Test basic health endpoint
      const healthResponse = await enhancedApiService.get('/health');
      const responseTime = Date.now() - startTime;

      if (healthResponse.success) {
        this.status.isBackendReachable = true;
        this.status.lastSuccessfulConnection = new Date().toISOString();
        this.status.failedAttempts = 0;
        this.status.latency = responseTime;

        // Extract backend health details
        this.status.backendHealth = {
          status: this.categorizeResponseTime(responseTime),
          responseTime,
          timestamp: new Date().toISOString(),
          version: healthResponse.data?.version || 'unknown',
          uptime: healthResponse.data?.uptime || 0,
          services: await this.testBackendServices()
        };

        // Backend restored
        if (!wasBackendReachable) {
          this.addConnectionEvent({
            type: 'backend_restored',
            timestamp: new Date().toISOString(),
            details: { responseTime, downtime: this.calculateDowntime() }
          });
        }
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      this.status.isBackendReachable = false;
      this.status.failedAttempts++;

      // Backend became unreachable
      if (wasBackendReachable) {
        this.addConnectionEvent({
          type: 'backend_unreachable',
          timestamp: new Date().toISOString(),
          details: { error: error.message, failedAttempts: this.status.failedAttempts }
        });
      }
    }

    await this.saveStatus();
  }

  private async testBackendServices(): Promise<BackendHealthStatus['services']> {
    const services = {
      database: false,
      authentication: false,
      fileUpload: false,
      notifications: false
    };

    try {
      // Test database (via services endpoint)
      try {
        const servicesResponse = await enhancedApiService.get('/services');
        services.database = servicesResponse.success;
      } catch (error) {
        services.database = false;
      }

      // Test authentication (try to get current user if token exists)
      try {
        const authResponse = await enhancedApiService.get('/auth/me');
        services.authentication = authResponse.success || authResponse.statusCode === 401; // 401 means auth is working
      } catch (error) {
        services.authentication = false;
      }

      // Additional service checks can be added here
      services.fileUpload = true; // Assume working if backend is up
      services.notifications = true; // Assume working if backend is up

    } catch (error) {
      console.error('Service testing failed:', error);
    }

    return services;
  }

  private categorizeResponseTime(responseTime: number): BackendHealthStatus['status'] {
    if (responseTime < 500) return 'healthy';
    if (responseTime < 2000) return 'degraded';
    return 'unhealthy';
  }

  private updateConnectionQuality() {
    if (!this.status.isOnline) {
      this.status.connectionQuality = 'offline';
      return;
    }

    if (!this.status.isBackendReachable) {
      this.status.connectionQuality = 'poor';
      return;
    }

    const latency = this.status.latency;
    if (latency < 200) {
      this.status.connectionQuality = 'excellent';
    } else if (latency < 500) {
      this.status.connectionQuality = 'good';
    } else if (latency < 1000) {
      this.status.connectionQuality = 'fair';
    } else {
      this.status.connectionQuality = 'poor';
    }
  }

  private addConnectionEvent(event: ConnectionEvent) {
    this.connectionHistory.push(event);
    if (this.connectionHistory.length > this.MAX_HISTORY_SIZE) {
      this.connectionHistory = this.connectionHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    if (DEBUG_MODE) {
      console.log(`🔄 Connection Event [${event.type}]:`, event);
    }
  }

  private calculateDowntime(): number {
    if (!this.status.lastSuccessfulConnection) return 0;
    return Date.now() - new Date(this.status.lastSuccessfulConnection).getTime();
  }

  private notifyListeners(event?: ConnectionEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(this.status, event);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  // Public methods
  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public addListener(listener: (status: ConnectionStatus, event?: ConnectionEvent) => void) {
    this.listeners.push(listener);
    
    // Immediately notify with current status
    listener(this.status);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async forceHealthCheck(): Promise<ConnectionStatus> {
    await this.performFullHealthCheck();
    return this.getStatus();
  }

  public getConnectionHistory(): ConnectionEvent[] {
    return [...this.connectionHistory];
  }

  public async showConnectionAlert(title?: string) {
    const status = this.getStatus();
    
    let message = '';
    if (!status.isOnline) {
      message = 'No internet connection. Please check your network settings.';
    } else if (!status.isBackendReachable) {
      message = 'Cannot reach DashStream servers. Please try again later.';
    } else {
      message = `Connection quality: ${status.connectionQuality}`;
    }

    Alert.alert(
      title || 'Connection Status',
      message,
      [
        {
          text: 'Retry',
          onPress: () => this.forceHealthCheck()
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.listeners = [];
  }

  // Utility methods for components
  public isHealthy(): boolean {
    return this.status.isOnline && this.status.isBackendReachable;
  }

  public canMakeRequests(): boolean {
    return this.status.isOnline && (this.status.isBackendReachable || this.status.connectionQuality !== 'offline');
  }

  public getStatusIcon(): string {
    if (!this.status.isOnline) return '🔴';
    if (!this.status.isBackendReachable) return '🟡';
    
    switch (this.status.connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟢';
      case 'fair': return '🟡';
      case 'poor': return '🟠';
      default: return '🔴';
    }
  }
}

// Export singleton instance
export const connectionHealthMonitor = ConnectionHealthMonitor.getInstance();
export default connectionHealthMonitor;