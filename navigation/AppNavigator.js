import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../components/Dashboard';
import AddBloodBag from '../components/AddBloodBag';
import TakeBloodBag from '../components/TakeBloodBag';
import { colors } from '../utils/theme';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddBloodBag" 
        component={AddBloodBag} 
        options={{ 
          title: 'Add Blood Bag',
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="TakeBloodBag" 
        component={TakeBloodBag} 
        options={{ 
          title: 'Take Blood Bag',
          headerBackTitleVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
}
