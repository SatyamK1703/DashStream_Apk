// Validation utility functions

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }

  return { isValid: true };
};

// Phone validation (Indian format)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian mobile number validation (10 digits, starts with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid 10-digit mobile number' };
  }

  return { isValid: true };
};

// Password validation


// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }

  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} is too long` };
  }

  // Only letters, spaces, apostrophes, and hyphens
  const nameRegex = /^[a-zA-Z\s'\-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, apostrophes, and hyphens` };
  }

  return { isValid: true };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { isValid: false, message: 'OTP is required' };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, message: 'Please enter a valid 6-digit OTP' };
  }

  return { isValid: true };
};

// Address validation
export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, message: 'Address is required' };
  }

  if (address.trim().length < 10) {
    return { isValid: false, message: 'Please enter a complete address' };
  }

  if (address.length > 200) {
    return { isValid: false, message: 'Address is too long' };
  }

  return { isValid: true };
};

// Pincode validation (Indian)
export const validatePincode = (pincode: string): ValidationResult => {
  if (!pincode) {
    return { isValid: false, message: 'Pincode is required' };
  }

  if (!/^\d{6}$/.test(pincode)) {
    return { isValid: false, message: 'Please enter a valid 6-digit pincode' };
  }

  return { isValid: true };
};

// Vehicle number validation (Indian)


// Amount validation
export const validateAmount = (amount: string | number, min: number = 0, max: number = 999999): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Please enter a valid amount' };
  }

  if (numAmount < min) {
    return { isValid: false, message: `Amount must be at least ₹${min}` };
  }

  if (numAmount > max) {
    return { isValid: false, message: `Amount cannot exceed ₹${max}` };
  }

  return { isValid: true };
};

// Required field validation
export const validateRequired = (value: string | null | undefined, fieldName: string): ValidationResult => {
  if (!value || value.toString().trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true };
};

// Date validation
export const validateDate = (date: string | Date, fieldName: string = 'Date'): ValidationResult => {
  if (!date) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Please enter a valid ${fieldName.toLowerCase()}` };
  }

  return { isValid: true };
};

// Future date validation
export const validateFutureDate = (date: string | Date, fieldName: string = 'Date'): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return { isValid: false, message: `${fieldName} must be in the future` };
  }

  return { isValid: true };
};

// Time validation (HH:MM format)
export const validateTime = (time: string): ValidationResult => {
  if (!time) {
    return { isValid: false, message: 'Time is required' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(time)) {
    return { isValid: false, message: 'Please enter a valid time (HH:MM)' };
  }

  return { isValid: true };
};

// File validation
export const validateFile = (
  file: { size?: number; type?: string; name?: string },
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    required?: boolean;
  } = {}
): ValidationResult => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes, required = false } = options;

  if (required && !file) {
    return { isValid: false, message: 'File is required' };
  }

  if (!file) {
    return { isValid: true };
  }

  if (file.size && file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }

  if (allowedTypes && file.type && !allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'File type is not supported' };
  }

  return { isValid: true };
};

// Credit card validation (basic)
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  if (!cardNumber) {
    return { isValid: false, message: 'Card number is required' };
  }

  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s\-]/g, '');

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, message: 'Card number can only contain digits' };
  }

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, message: 'Please enter a valid card number' };
  }

  // Luhn algorithm check
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, message: 'Please enter a valid card number' };
  }

  return { isValid: true };
};

// CVV validation
export const validateCVV = (cvv: string): ValidationResult => {
  if (!cvv) {
    return { isValid: false, message: 'CVV is required' };
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, message: 'Please enter a valid 3 or 4 digit CVV' };
  }

  return { isValid: true };
};

// Expiry date validation (MM/YY format)
export const validateExpiryDate = (expiry: string): ValidationResult => {
  if (!expiry) {
    return { isValid: false, message: 'Expiry date is required' };
  }

  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  
  if (!expiryRegex.test(expiry)) {
    return { isValid: false, message: 'Please enter expiry date in MM/YY format' };
  }

  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);

  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return { isValid: false, message: 'Card has expired' };
  }

  return { isValid: true };
};

// Comprehensive form validation
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors[field] = result.message || 'Invalid value';
      isValid = false;
    }
  }

  return { isValid, errors };
};