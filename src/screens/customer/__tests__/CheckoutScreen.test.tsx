import React from 'react';
import { render } from '@testing-library/react-native';
import CheckoutScreen from '../CheckoutScreen';

describe('CheckoutScreen', () => {
  it('renders without crashing', () => {
    const tree = render(<CheckoutScreen />);
    expect(tree).toBeTruthy();
  });
});
