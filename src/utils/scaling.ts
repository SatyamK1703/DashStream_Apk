import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on a standard design resolution
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812; // iPhone X/11/12 height

const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

const scaleFont = (size: number, factor = 0.5) => size + (scaleWidth(size) - size) * factor;

export { scaleWidth, scaleHeight, scaleFont };
