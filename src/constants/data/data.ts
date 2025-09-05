// Mock Data - Replace this with your actual data fetching logic
 export const MOCK_ADDRESSES = [
  {
    id: '1',
    type: 'home',
    name: 'Ananya Sharma',
    address: 'Flat 501, Sunshine Apartments, MG Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    name: 'Ananya Sharma',
    address: '8th Floor, Tech Park One, Hinjewadi Phase 2',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    isDefault: false,
  },
];

type Booking = {
  bookId: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date: string;
  time: string;
  services: Array<{
    name: string;
    price: number;
  }>;
  totalAmount: number;
  address: string;
  professionalName?: string;
  professionalImage?: any;
};

export  const bookings: Booking[] = [
    {
      id: 'BK1001',
      status: 'upcoming',
      date: 'Today',
      time: '11:00 AM',
      services: [
        { name: 'Basic Wash', price: 499 },
        { name: 'Premium Wash', price: 999 }
      ],
      totalAmount: 1397,
      address: '123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Rahul Sharma',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1002',
      status: 'ongoing',
      date: 'Today',
      time: '09:30 AM',
      services: [
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 799,
      address: 'Office - 42 Business Park, Mumbai, Maharashtra',
      professionalName: 'Amit Patel',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1003',
      status: 'upcoming',
      date: 'Tomorrow',
      time: '10:00 AM',
      services: [
        { name: 'Basic Wash', price: 499 }
      ],
      totalAmount: 499,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra'
    },
    {
      id: 'BK1004',
      status: 'completed',
      date: 'Yesterday',
      time: '02:00 PM',
      services: [
        { name: 'Premium Wash', price: 999 },
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 1798,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Vikram Singh',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1005',
      status: 'cancelled',
      date: '12 Jun 2023',
      time: '11:30 AM',
      services: [
        { name: 'Basic Wash', price: 499 }
      ],
      totalAmount: 499,
      address: 'Office - 42 Business Park, Mumbai, Maharashtra'
    },
    {
      id: 'BK1006',
      status: 'completed',
      date: '10 Jun 2023',
      time: '09:00 AM',
      services: [
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 799,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Rahul Sharma',
      professionalImage: require('../../assets/images/image.png')
    },
  ];
interface AddressOption {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

// Mock data
export const savedAddresses: AddressOption[] = [
  {
    id: '1',
    title: 'Home',
    address: '123 Main Street, Apartment 4B, Mumbai, 400001',
    isDefault: true,
  },
  {
    id: '2',
    title: 'Office',
    address: 'Tech Park, Building C, Floor 5, Bengaluru, 560001',
    isDefault: false,
  },
];

export const timeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '10:00 AM', available: true },
  { id: '3', time: '11:00 AM', available: false },
  { id: '4', time: '12:00 PM', available: true },
  { id: '5', time: '01:00 PM', available: true },
  { id: '6', time: '02:00 PM', available: false },
  { id: '7', time: '03:00 PM', available: true },
  { id: '8', time: '04:00 PM', available: true },
  { id: '9', time: '05:00 PM', available: true },
];

export const paymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: '2', name: 'UPI', icon: 'wallet-outline' },
  { id: '3', name: 'Cash on Delivery', icon: 'cash-outline' },
];
interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular: boolean;
}
export  const membershipPlans: MembershipPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 499,
      duration: '1 month',
      features: [
        '5 car washes',
        'Basic interior cleaning',
        '10% off on additional services',
        'Priority booking'
      ],
      popular: false
    },
    {
      id: 'silver',
      name: 'Silver',
      price: 999,
      duration: '3 months',
      features: [
        '12 car washes',
        'Full interior cleaning',
        '15% off on additional services',
        'Priority booking',
        'Free car inspection'
      ],
      popular: true
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 1999,
      duration: '6 months',
      features: [
        '24 car washes',
        'Premium detailing',
        '20% off on additional services',
        'VIP priority booking',
        'Free car inspection',
        'Free pickup and drop'
      ],
      popular: false
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 3499,
      duration: '12 months',
      features: [
        'Unlimited car washes',
        'Premium detailing',
        '25% off on additional services',
        'VIP priority booking',
        'Quarterly car inspection',
        'Free pickup and drop',
        'Dedicated relationship manager'
      ],
      popular: false
    }
  ];
interface Order {
  id: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'refunded';
  services: {
    name: string;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  address: string;
  professional?: {
    name: string;
    rating: number;
    image: string;
  };
  rating?: number;
  reviewSubmitted?: boolean;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
}
export const mockOrders: Order[] = [
    {
      id: 'ORD123456',
      date: '15 May 2023',
      time: '10:30 AM',
      status: 'completed',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Interior Cleaning', price: 399 }
      ],
      totalAmount: 998,
      paymentMethod: 'Credit Card',
      address: '123 Main St, Bangalore',
      professional: {
        name: 'Rahul Singh',
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      rating: 5,
      reviewSubmitted: true
    },
    {
      id: 'ORD123457',
      date: '28 Apr 2023',
      time: '02:00 PM',
      status: 'completed',
      services: [
        { name: 'Basic Wash', price: 399 }
      ],
      totalAmount: 399,
      paymentMethod: 'UPI',
      address: '123 Main St, Bangalore',
      professional: {
        name: 'Amit Kumar',
        rating: 4.6,
        image: 'https://randomuser.me/api/portraits/men/45.jpg'
      },
      rating: 4,
      reviewSubmitted: true
    },
    {
      id: 'ORD123458',
      date: '10 Apr 2023',
      time: '11:15 AM',
      status: 'cancelled',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Wax Polish', price: 799 }
      ],
      totalAmount: 1398,
      paymentMethod: 'Credit Card',
      address: '456 Park Ave, Bangalore',
      cancellationReason: 'Professional unavailable'
    },
    {
      id: 'ORD123459',
      date: '02 Apr 2023',
      time: '09:00 AM',
      status: 'refunded',
      services: [
        { name: 'Full Detailing', price: 1999 }
      ],
      totalAmount: 1999,
      paymentMethod: 'Debit Card',
      address: '789 Lake View, Bangalore',
      refundAmount: 1999,
      refundDate: '04 Apr 2023'
    },
    {
      id: 'ORD123460',
      date: '15 Mar 2023',
      time: '04:30 PM',
      status: 'completed',
      services: [
        { name: 'Basic Wash', price: 399 },
        { name: 'Interior Cleaning', price: 399 }
      ],
      totalAmount: 798,
      paymentMethod: 'UPI',
      address: '123 Main St, Bangalore',
      professional: {
        name: 'Vikram Patel',
        rating: 4.9,
        image: 'https://randomuser.me/api/portraits/men/67.jpg'
      },
      rating: 5,
      reviewSubmitted: true
    },
  ];

 export const mockVehicles :Vehicle[] = [
  {
    id: '1',
    type: 'car',
    brand: 'Toyota',
    model: 'Camry',
    year: '2020',
    licensePlate: 'ABC123',
    image: 'https://example.com/car1.jpg'
  },
  {
    id: '2',
    type: 'motorcycle',
    brand: 'Honda',
    model: 'CBR500R',
    year: '2019',
    licensePlate: 'XYZ789',
    image: 'https://example.com/bike1.jpg'
  },
  {
    id: '3',
    type: 'bicycle',
    brand: 'Trek',
    model: 'FX 2',
    year: '2021',
    licensePlate: null,
    image: null
  },
];

type Vehicle = {
  id: string;
  type: 'car' | 'motorcycle' | 'bicycle';
  brand: string;
  model: string;
  year: string;
  licensePlate: string | null;
  image: string | null;
};