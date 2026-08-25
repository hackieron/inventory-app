import { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius } from '@/constants/theme';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const scales = useRef(state.routes.map(() => new Animated.Value(1))).current;

  const tabWidth = barWidth / state.routes.length;

  useEffect(() => {
    if (barWidth === 0) return;
    Animated.spring(indicatorX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [state.index, barWidth]);

  function handleLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  function handlePressIn(index: number) {
    Animated.spring(scales[index], {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 24,
    }).start();
  }

  function handlePressOut(index: number) {
    Animated.spring(scales[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
    }).start();
  }

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View style={styles.bar} onLayout={handleLayout}>
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: tabWidth - spacing.sm * 2,
                transform: [{ translateX: Animated.add(indicatorX, spacing.sm) }],
              },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = (options.title ?? route.name) as string;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              activeOpacity={0.9}
              style={styles.tab}
            >
              <Animated.View
                style={[styles.tabInner, { transform: [{ scale: scales[index] }] }]}
              >
                {options.tabBarIcon?.({
                  color: isFocused ? colors.primary : colors.textMuted,
                  size: 22,
                  focused: isFocused,
                })}
                {isFocused && (
                  <Animated.Text style={styles.label} numberOfLines={1}>
                    {label}
                  </Animated.Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 64,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 6px 16px rgba(0,0,0,0.08)' },
    }),
  },
  indicator: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    backgroundColor: 'rgba(17, 17, 17, 0.06)',
    borderRadius: radius.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});