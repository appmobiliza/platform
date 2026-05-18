import '@testing-library/jest-dom';
import { vi, type Mock } from 'vitest';

// ============================================
// REACT NATIVE MOCKS
// ============================================

const mockRN = {
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  FlatList: 'FlatList',
  Pressable: 'Pressable',
  TextInput: 'TextInput',
  Switch: 'Switch',
  ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
};

vi.mock('react-native', () => mockRN);

// ============================================
// EXPO-ROUTER MOCK
// ============================================

vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
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

vi.mock('lucide-react-native', () => ({
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

vi.mock('expo-image', () => ({
  Image: 'Image',
}));

// ============================================
// REACT NATIVE REANIMATED MOCK
// ============================================

vi.mock('react-native-reanimated', () => ({
  FadeIn: vi.fn(() => (Component: unknown) => Component),
  FadeOut: vi.fn(() => (Component: unknown) => Component),
  default: vi.fn(),
}));

// ============================================
// SILENCE CONSOLE WARNINGS IN TESTS
// ============================================

vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// ============================================
// EXPORT VI FOR USE IN TESTS
// ============================================

export { vi };