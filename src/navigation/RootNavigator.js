import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

import AuthScreen from '../screens/AuthScreen';
import DrawerNavigator from './DrawerNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CartNotificationPopup from '../components/CartNotificationPopup';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useApp();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 320,
        }}
      >
        {!user?.isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen
              name="MainDrawer"
              component={DrawerNavigator}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>

      {user?.isAuthenticated && <CartNotificationPopup navigation={navigation} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});
