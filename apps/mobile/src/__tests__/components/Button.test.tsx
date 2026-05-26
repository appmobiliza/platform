import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeTruthy();
    });

    it('renders string children correctly', () => {
      const { getByText } = render(<Button variant="primary">Primary Button</Button>);
      expect(getByText('Primary Button')).toBeTruthy();
    });

    it('renders with custom className', () => {
      const { getByText } = render(
        <Button className="mt-4">With Custom Class</Button>
      );
      expect(getByText('With Custom Class')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      const { getByText } = render(
        <Button variant="primary">Primary</Button>
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(
        <Button variant="secondary">Secondary</Button>
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { getByText } = render(
        <Button variant="outline">Outline</Button>
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('renders ghost variant', () => {
      const { getByText } = render(
        <Button variant="ghost">Ghost</Button>
      );
      expect(getByText('Ghost')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { getByText } = render(
        <Button size="sm">Small</Button>
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders medium size (default)', () => {
      const { getByText } = render(
        <Button size="md">Medium</Button>
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = render(
        <Button size="lg">Large</Button>
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      const { getByText } = render(
        <Button disabled>Disabled</Button>
      );
      expect(getByText('Disabled')).toBeTruthy();
    });

    it('renders loading state', () => {
      const { queryByText } = render(
        <Button loading>Loading</Button>
      );
      // When loading, the text should not be visible (shows ActivityIndicator instead)
      expect(queryByText('Loading')).toBeNull();
    });

    it('disables button when loading is true', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button loading onPress={onPress} testID="loading-button">Test</Button>
      );
      // The button should be disabled
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress}>Press Me</Button>
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress} disabled>Disabled</Button>
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button loading onPress={onPress} testID="loading-btn">Loading</Button>
      );

      // When loading, button is disabled so onPress should not be called
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Text Props', () => {
    it('accepts textClassName prop', () => {
      const { getByText } = render(
        <Button textClassName="text-red-500">Styled Text</Button>
      );
      expect(getByText('Styled Text')).toBeTruthy();
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<any>();
      const { getByText } = render(
        <Button ref={ref}>With Ref</Button>
      );
      expect(getByText('With Ref')).toBeTruthy();
    });
  });
});