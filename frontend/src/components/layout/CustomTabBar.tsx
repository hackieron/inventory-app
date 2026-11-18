
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { getIncomingBorrowingRequests } from '@/api/borrowings';
import { getIncomingFriendRequests } from '@/api/contacts';

const BAR_HEIGHT = 68;
const BAR_PADDING = 6;
const HORIZONTAL_MARGIN = 20;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const [incomingCounts, setIncomingCounts] = useState({ borrowed: 0, contacts: 0 });

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;

  const scales = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    let active = true;

    const loadIncomingCounts = async () => {
      try {
        const [borrowingResult, friendResult] = await Promise.allSettled([
          getIncomingBorrowingRequests(),
          getIncomingFriendRequests(),
        ]);

        if (active) {
          const borrowingCount = borrowingResult.status === 'fulfilled'
            ? borrowingResult.value.filter((request) => String(request.status).toLowerCase() === 'pending').length
            : 0;
          const contactsCount = friendResult.status === 'fulfilled'
            ? friendResult.value.filter((request) => String(request.status).toLowerCase() === 'pending').length
            : 0;

          console.log('[Tab badges] incoming counts:', {
            routeNames: state.routes.map((route) => route.name),
            borrowingStatus: borrowingResult.status === 'fulfilled'
              ? borrowingResult.value.map((request) => request.status)
              : 'request failed',
            borrowed: borrowingCount,
            contacts: contactsCount,
          });

          setIncomingCounts({
            borrowed: borrowingCount,
            contacts: contactsCount,
          });
        }
      } catch {
        console.log('[Tab badges] unable to load incoming counts');
      }
    };

    void loadIncomingCounts();
    const retry = setTimeout(loadIncomingCounts, 1000);

    return () => {
      active = false;
      clearTimeout(retry);
    };
  }, [state.index]);

  const tabWidth =
    barWidth > 0
      ? (barWidth - BAR_PADDING * 2) / state.routes.length
      : 0;

  useEffect(() => {
    if (!tabWidth) return;

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: state.index * tabWidth,
        damping: 19,
        stiffness: 190,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index, tabWidth, indicatorX, indicatorOpacity]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    if (width !== barWidth) {
      setBarWidth(width);
    }
  };

  const animateScale = (index: number, toValue: number) => {
    Animated.spring(scales[index], {
      toValue,
      damping: 13,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.bar} onLayout={handleLayout}>
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: tabWidth,
                opacity: indicatorOpacity,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? label
              }
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={() => animateScale(index, 0.9)}
              onPressOut={() => animateScale(index, 1)}
              style={styles.tab}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [
                      { scale: scales[index] },
                    ],
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color: isFocused
                      ? colors.primary
                      : colors.textMuted,
                    size: 23,
                  })}
                  {(((route.name === 'borrowed' || route.name === 'borrowed/index') && incomingCounts.borrowed > 0) || (route.name === 'contacts' && incomingCounts.contacts > 0)) && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>
                        {Math.min(route.name === 'borrowed' || route.name === 'borrowed/index' ? incomingCounts.borrowed : incomingCounts.contacts, 99)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    isFocused && styles.activeLabel,
                  ]}
                >
                  {label}
                </Text>
              </Animated.View>
            </Pressable>
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
    paddingHorizontal: HORIZONTAL_MARGIN,
    backgroundColor: 'transparent',
  },

  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BAR_PADDING,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.09,
        shadowRadius: 20,
        shadowOffset: {
          width: 0,
          height: 8,
        },
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
      },
    }),
  },

  indicator: {
    position: 'absolute',
    left: BAR_PADDING,
    top: BAR_PADDING,
    bottom: BAR_PADDING,
    borderRadius: 19,
    backgroundColor: 'rgba(99, 102, 241, 0.10)',
  },

  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  iconContainer: {
    height: 25,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: -7,
    right: -13,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },

  notificationText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.1,
  },

  activeLabel: {
    fontWeight: '700',
    color: colors.primary,
  },
});
