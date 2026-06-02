// Mock do WebSocket para evitar erros no ambiente Node do Jest
global.WebSocket = class {
  constructor() {}
  send() {}
  close() {}
};

// Mock do Reanimated
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View,
      Text: require("react-native").Text,
      Image: require("react-native").Image,
      ScrollView: require("react-native").ScrollView,
    },
    useAnimatedStyle: () => ({}),
    useSharedValue: (val) => ({ value: val }),
    withTiming: (val) => val,
    withSpring: (val) => val,
    withSequence: (...args) => args[0],
    withRepeat: (val) => val,
    Easing: {
      linear: (val) => val,
      inOut: (fn) => fn,
      ease: (val) => val,
    },
  };
});

// Mock do Worklets
jest.mock("react-native-worklets", () => ({
  __esModule: true,
  createSerializable: jest.fn(),
  Worklets: {
    createRunOnJS: jest.fn((fn) => fn),
    createRunOnUI: jest.fn((fn) => fn),
  },
}));
