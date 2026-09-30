import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import Colors from '../constants/Colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const isActionDisabled = disabled || loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isActionDisabled}
      style={[
        styles.base,
        getContainerStyle(),
        isActionDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? Colors.inkDark : '#FFFFFF'}
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 6,
  },
  baseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primary: {
    backgroundColor: Colors.inkDark,
  },
  primaryText: {
    color: Colors.cardBackground,
  },
  secondary: {
    backgroundColor: Colors.panelBackground,
    borderColor: Colors.inkDark,
  },
  secondaryText: {
    color: Colors.inkDark,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.inkDark,
  },
  outlineText: {
    color: Colors.inkDark,
  },
  danger: {
    backgroundColor: Colors.stampRed,
    borderColor: Colors.stampRed,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
