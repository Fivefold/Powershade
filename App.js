import React from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import {
  Provider as PaperProvider,
  DefaultTheme,
  Appbar,
} from "react-native-paper";
import { StyleSheet, Text, View } from "react-native";

import colors from "./constants/colors";
import { homeScreen, homeStackNavigator } from "./screens/homeScreen";
import {
  windowListScreen,
  windowStackNavigator,
} from "./screens/windowListScreen";

const Tab = createMaterialBottomTabNavigator();

export const theme = {
  ...DefaultTheme,
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary._800,
    accent: colors.secondary._600,
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />

      {/* ---------- Navigation ----------- */}
      <NavigationContainer>
        <Tab.Navigator barStyle={{ backgroundColor: theme.colors.primary }}>
          <Tab.Screen
            name="Objekte"
            component={homeStackNavigator}
            options={{
              tabBarIcon: "home-account",
              tabBarColor: "164D93",
            }}
          />
          <Tab.Screen
            name="Fensterliste"
            component={windowStackNavigator}
            options={{
              tabBarIcon: "application",
              tabBarBadge: 4,
              tabBarColor: "red",
            }}
          />
          <Tab.Screen
            name="Gerätestatus"
            component={windowListScreen}
            options={{
              tabBarIcon: "devices",
              tabBarColor: "green",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

function CustomNavigationBar({ navigation, previous }) {
  return (
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="My awesome app" />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary._900,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.white.high_emph,
  },
});
