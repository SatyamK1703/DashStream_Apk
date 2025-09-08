export interface VehicleModel {
  name: string;
  type: '2 Wheeler' | '4 Wheeler';
  fuelType?: string;
  year?: number;
}

export interface VehicleBrand {
  brand: string;
  logo?: string;
  models: VehicleModel[];
}

export const vehicleData: VehicleBrand[] = [
  // 4 Wheeler Brands
  {
    brand: 'Maruti Suzuki',
    models: [
      { name: 'Swift', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Baleno', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'WagonR', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Alto', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Dzire', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Vitara Brezza', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Ertiga', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Ciaz', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Hyundai',
    models: [
      { name: 'i20', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Creta', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Verna', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Grand i10', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Venue', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Elantra', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Tucson', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Tata',
    models: [
      { name: 'Nexon', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Harrier', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Safari', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Altroz', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Tiago', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Tigor', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Punch', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Mahindra',
    models: [
      { name: 'XUV700', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Scorpio', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'XUV300', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Bolero', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Thar', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'KUV100', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Honda',
    models: [
      { name: 'City', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Amaze', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'WR-V', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Jazz', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'CR-V', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Toyota',
    models: [
      { name: 'Innova Crysta', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Fortuner', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Yaris', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Glanza', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Urban Cruiser', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Camry', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Ford',
    models: [
      { name: 'EcoSport', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Endeavour', type: '4 Wheeler', fuelType: 'Diesel' },
      { name: 'Figo', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Aspire', type: '4 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Kia',
    models: [
      { name: 'Seltos', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Sonet', type: '4 Wheeler', fuelType: 'Petrol' },
      { name: 'Carnival', type: '4 Wheeler', fuelType: 'Diesel' },
    ]
  },
  // 2 Wheeler Brands
  {
    brand: 'Hero',
    models: [
      { name: 'Splendor Plus', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'HF Deluxe', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Passion Pro', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Glamour', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Xtreme 160R', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Xpulse 200', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Destini 125', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Pleasure Plus', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Honda',
    models: [
      { name: 'Activa 6G', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'CB Shine', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Dio', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Unicorn', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Hornet 2.0', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'CB350RS', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Grazia', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Bajaj',
    models: [
      { name: 'Pulsar 150', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Pulsar NS200', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Avenger Cruise 220', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Platina 110', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'CT 110', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Dominar 400', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Chetak', type: '2 Wheeler', fuelType: 'Electric' },
    ]
  },
  {
    brand: 'TVS',
    models: [
      { name: 'Jupiter', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Apache RTR 160', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Apache RTR 200', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'NTORQ 125', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Star City Plus', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Radeon', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'iQube Electric', type: '2 Wheeler', fuelType: 'Electric' },
    ]
  },
  {
    brand: 'Yamaha',
    models: [
      { name: 'FZ-S', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'MT-15', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'R15 V4', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Fascino 125', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Ray ZR', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Saluto RX', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Aerox 155', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Royal Enfield',
    models: [
      { name: 'Classic 350', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Bullet 350', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Himalayan', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Interceptor 650', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Continental GT 650', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Meteor 350', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'KTM',
    models: [
      { name: 'Duke 200', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Duke 250', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'RC 200', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'RC 390', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Adventure 250', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  },
  {
    brand: 'Suzuki',
    models: [
      { name: 'Access 125', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Gixxer', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Gixxer SF', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Burgman Street', type: '2 Wheeler', fuelType: 'Petrol' },
      { name: 'Intruder', type: '2 Wheeler', fuelType: 'Petrol' },
    ]
  }
];

export default vehicleData;