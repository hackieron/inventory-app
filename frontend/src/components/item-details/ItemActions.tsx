
import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius } from '@/constants/theme';

type Props = {
  isBorrowed: boolean;
  isBorrowable: boolean;
  onEdit: () => void;
  onToggleBorrowable: () => void;
};

export function ItemActions({
  isBorrowed,
  isBorrowable,
  onEdit,
  onToggleBorrowable,
}: Props) {
  const progress = useRef(
    new Animated.Value(isBorrowable ? 1 : 0)
  ).current;

  const cardScale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth color and toggle transition
    Animated.timing(progress, {
      toValue: isBorrowable ? 1 : 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Bounce the entire card
    cardScale.setValue(0.97);

    Animated.spring(cardScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Icon pop animation
    iconScale.setValue(0.65);

    Animated.spring(iconScale, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [isBorrowable]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colors.surface,
      '#EEF7F2',
    ],
  });

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colors.border,
      colors.primary,
    ],
  });

  const toggleTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const toggleBackground = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      '#D1D5DB',
      colors.primary,
    ],
  });

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onEdit}
        activeOpacity={0.85}
      >
        <Ionicons
          name="create-outline"
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.primaryButtonText}>
          Edit Item
        </Text>
      </TouchableOpacity>

      {!isBorrowed && (
        <Animated.View
          style={{
            transform: [
              { scale: cardScale },
              { scale: pressScale },
            ],
          }}
        >
          <Pressable
            onPress={onToggleBorrowable}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="switch"
            accessibilityState={{
              checked: isBorrowable,
            }}
          >
            <Animated.View
              style={[
                styles.switchContainer,
                {
                  backgroundColor,
                  borderColor,
                },
              ]}
            >
              <View style={styles.switchContent}>
                <Animated.View
                  style={[
                    styles.statusIcon,
                    {
                      transform: [
                        { scale: iconScale },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      isBorrowable
                        ? 'hand-right-outline'
                        : 'lock-closed-outline'
                    }
                    size={20}
                    color={
                      isBorrowable
                        ? colors.primary
                        : colors.textMuted
                    }
                  />
                </Animated.View>

                <View style={styles.switchLabelWrap}>
                  <Text style={styles.switchTitle}>
                    Available for borrowing
                  </Text>

                  <Text style={styles.switchHint}>
                    {isBorrowable
                      ? 'Others can borrow this item'
                      : 'This item is not lendable'}
                  </Text>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor:
                      toggleBackground,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [
                        {
                          translateX:
                            toggleTranslate,
                        },
                      ],
                    },
                  ]}
                />
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  primaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  switchContainer: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: 12,
  },

  switchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(128,128,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  switchLabelWrap: {
    flex: 1,
  },

  switchTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  switchHint: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  toggleTrack: {
    width: 54,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },

  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
});
