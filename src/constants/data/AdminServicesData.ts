interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  duration: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
  tags: string[];
}

export const mockServices: Service[] = [
    {
      id: '1',
      name: 'Basic Car Wash',
      description: 'Exterior wash with foam and water, includes tire cleaning.',
      price: 299,
      category: 'car-wash',
      image: 'https://example.com/basic-car-wash.jpg',
      duration: 30,
      isActive: true,
      isPopular: true,
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-06-20T14:45:00Z',
      features: ['Exterior Wash', 'Tire Cleaning', 'Windows Cleaning'],
      tags: ['Quick', 'Exterior']
    },
    {
      id: '2',
      name: 'Premium Car Wash',
      description: 'Complete exterior and interior cleaning with premium products.',
      price: 599,
      discountedPrice: 499,
      category: 'car-wash',
      image: 'https://example.com/premium-car-wash.jpg',
      duration: 60,
      isActive: true,
      isPopular: true,
      createdAt: '2023-04-10T09:15:00Z',
      updatedAt: '2023-06-25T11:30:00Z',
      features: ['Exterior Wash', 'Interior Vacuum', 'Dashboard Cleaning', 'Seat Cleaning', 'Air Freshener'],
      tags: ['Premium', 'Interior', 'Exterior']
    },
    {
      id: '3',
      name: 'Bike Wash',
      description: 'Complete bike cleaning with special attention to chain and wheels.',
      price: 149,
      category: 'bike-wash',
      image: 'https://example.com/bike-wash.jpg',
      duration: 20,
      isActive: true,
      isPopular: false,
      createdAt: '2023-05-20T13:45:00Z',
      updatedAt: '2023-06-15T16:20:00Z',
      features: ['Body Wash', 'Chain Cleaning', 'Wheel Cleaning'],
      tags: ['Quick', 'Bike']
    },
    {
      id: '4',
      name: 'Full Car Detailing',
      description: 'Comprehensive detailing service for interior and exterior with premium products.',
      price: 2999,
      discountedPrice: 2499,
      category: 'detailing',
      image: 'https://example.com/car-detailing.jpg',
      duration: 180,
      isActive: true,
      isPopular: true,
      createdAt: '2023-03-05T11:30:00Z',
      updatedAt: '2023-06-10T09:45:00Z',
      features: ['Deep Exterior Cleaning', 'Interior Deep Cleaning', 'Engine Bay Cleaning', 'Leather Treatment', 'Scratch Removal'],
      tags: ['Premium', 'Detailing', 'Complete']
    },
    {
      id: '5',
      name: 'Ceramic Coating',
      description: 'Long-lasting ceramic coating for paint protection and shine.',
      price: 7999,
      category: 'coating',
      image: 'https://example.com/ceramic-coating.jpg',
      duration: 240,
      isActive: true,
      isPopular: false,
      createdAt: '2023-02-15T14:20:00Z',
      updatedAt: '2023-05-30T10:15:00Z',
      features: ['Surface Preparation', 'Paint Correction', 'Ceramic Coating Application', '3-Year Protection'],
      tags: ['Premium', 'Protection', 'Long-lasting']
    },
    {
      id: '6',
      name: 'Car Polishing',
      description: 'Professional polishing to remove scratches and restore shine.',
      price: 1499,
      category: 'polishing',
      image: 'https://example.com/car-polishing.jpg',
      duration: 120,
      isActive: false,
      isPopular: false,
      createdAt: '2023-04-25T16:40:00Z',
      updatedAt: '2023-06-05T13:10:00Z',
      features: ['Scratch Removal', 'Swirl Mark Removal', 'Paint Restoration', 'Wax Application'],
      tags: ['Restoration', 'Shine']
    },
  ];