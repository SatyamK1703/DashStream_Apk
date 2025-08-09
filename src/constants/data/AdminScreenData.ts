 export const dashboardStats = {
    totalRevenue: '₹1,24,500',
    totalBookings: '156',
    activeCustomers: '89',
    activeProfessionals: '12',
    revenueChange: '+12.5%',
    bookingsChange: '+8.3%',
    customersChange: '+5.7%',
    professionalsChange: '-2.1%'
  };
  
 export const recentBookings = [
    {
      id: 'BK-7845',
      customerName: 'Rahul Sharma',
      service: 'Premium Wash & Polish',
      date: '15 Aug 2023',
      time: '10:30 AM',
      status: 'ongoing' as const,
      amount: '₹1,200'
    },
    {
      id: 'BK-7844',
      customerName: 'Priya Patel',
      service: 'Interior Detailing',
      date: '15 Aug 2023',
      time: '09:15 AM',
      status: 'pending' as const,
      amount: '₹1,800'
    },
    {
      id: 'BK-7843',
      customerName: 'Amit Kumar',
      service: 'Basic Wash',
      date: '15 Aug 2023',
      time: '08:00 AM',
      status: 'completed' as const,
      amount: '₹600'
    },
    {
      id: 'BK-7842',
      customerName: 'Sneha Gupta',
      service: 'Full Detailing Package',
      date: '14 Aug 2023',
      time: '04:30 PM',
      status: 'cancelled' as const,
      amount: '₹2,500'
    },
  ];
  
 export const topProfessionals = [
    {
      id: 'PRO-001',
      name: 'Rajesh Kumar',
      rating: 4.9,
      jobsCompleted: 156,
      isOnline: true
    },
    {
      id: 'PRO-008',
      name: 'Sunil Verma',
      rating: 4.8,
      jobsCompleted: 142,
      isOnline: true
    },
    {
      id: 'PRO-015',
      name: 'Vikram Singh',
      rating: 4.7,
      jobsCompleted: 128,
      isOnline: false
    },
  ];
  
  // Chart data
  export const revenueData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [8500, 7200, 9800, 8100, 10500, 15200, 12800],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    },
    weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      datasets: [{
        data: [42000, 38500, 45200, 52800],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [125000, 118000, 132000, 145000, 158000, 172000],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    }
  };
  
 export const bookingsData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [12, 8, 15, 10, 14, 22, 18],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    },
    weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      datasets: [{
        data: [45, 38, 52, 64],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [180, 165, 195, 210, 225, 240],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    }
  };
  