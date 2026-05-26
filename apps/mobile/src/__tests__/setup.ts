import '@testing-library/jest-dom';

// ============================================
// REACT NATIVE JEST POLYFILLS MOCK
// ============================================

// Mock @react-native/js-polyfills/error-guard to prevent import errors
jest.mock('@react-native/js-polyfills/error-guard', () => ({}));

// ============================================
// REACT NATIVE MOCKS
// ============================================

// jest-expo provides react-native mock with StyleSheet.flatten
// Only add additional mocks if needed

// ============================================
// EXPO-ROUTER MOCK
// ============================================

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: {
    Screen: () => null,
  },
}));

// ============================================
// LUCIDE ICONS MOCK
// ============================================

jest.mock('lucide-react-native', () => ({
  Accessibility: 'AccessibilityIcon',
  ArrowLeft: 'ArrowLeftIcon',
  ChevronDown: 'ChevronDownIcon',
  CircleAlert: 'CircleAlertIcon',
  Ear: 'EarIcon',
  Ellipsis: 'EllipsisIcon',
  Eye: 'EyeIcon',
  X: 'XIcon',
}));

// ============================================
// EXPO-IMAGE MOCK
// ============================================

jest.mock('expo-image', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    Image: React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      return React.createElement(RN.View, { ...props, testID: props.testID }, props.children);
    }),
  };
});

// ============================================
// REACT NATIVE REANIMATED MOCK
// ============================================

jest.mock('react-native-reanimated', () => ({
  FadeIn: jest.fn(() => (Component: unknown) => Component),
  FadeOut: jest.fn(() => (Component: unknown) => Component),
  default: jest.fn(),
}));

// ============================================
// EXPO-MODULES-CORE MOCK
// ============================================

jest.mock('expo-modules-core', () => ({
  Platform: {
    select: jest.fn((obj: Record<string, unknown>) => obj.native ?? obj.default ?? obj.web ?? {}),
  },
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(),
  requireOptionalNativeModule: jest.fn(),
  createSnapshotFriendlyRef: jest.fn(() => ({ current: null })),
}));

// ============================================
// EXPO FETCH MOCK
// ============================================

jest.mock('expo/src/winter/fetch/ExpoFetchModule', () => ({}));
jest.mock('expo/src/winter/fetch/fetch', () => ({ fetch: jest.fn() }));
jest.mock('expo/src/winter', () => ({}));
jest.mock('expo/src/winter/FormData', () => ({ installFormDataPatch: jest.fn() }));

// ============================================
// SILENCE CONSOLE WARNINGS IN TESTS
// ============================================

const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});