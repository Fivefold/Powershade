import "react-native-gesture-handler";

import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Appbar,
  DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import colors from "./constants/colors";
import { bleManager } from "./modules/BleManager";
import { StateContext } from "./modules/Context";
import { DeviceStatusScreen } from "./screens/DeviceStatusScreen";
import { homeScreen, homeStackNavigator } from "./screens/HomeScreen";
import {
  windowListScreen,
  windowStackNavigator,
} from "./screens/WindowListScreen";

export const db = SQLite.openDatabase("powershade.db");
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
  // States for global context API
  const [bluetoothConnected, setBluetoothConnected] = React.useState(false);
  const [measurementStatus, setMeasurementStatus] = React.useState("idle");

  React.useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY NOT null, 
            last_edit INTEGER,
            created INTEGER,
            customer TEXT, 
            street TEXT,
            number TEXT,
            zip INTEGER,
            city TEXT,
            country TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS windows (
            id INTEGER PRIMARY KEY NOT null, 
            last_edit INTEGER,
            created INTEGER,
            project INTEGER,
            name TEXT, 
            width REAL,
            height REAL,
            sensorCorner TEXT,
            sensorPosH REAL,
            sensorPosV REAL,
            latitude REAL,
            longitude REAL,
            altitude REAL,
            azimuth REAL,
            inclination REAL,
            qr TEXT,
            annotations TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY NOT null, 
            key TEXT,
            value INTEGER 
          );`
        );
      },
      (error) => console.log(error)
    );
  }, []);

  // React.useEffect(() => {
  //   bleManager.onStateChange((state) => {
  //     const subscription = manager.onStateChange((state) => {
  //       if (state === "PoweredOn") {
  //         this.scanAndConnect();
  //         subscription.remove();
  //       }
  //     }, true);
  //     return () => subscription.remove();
  //   });
  // }, [bleManager]);

  return (
    <StateContext.Provider
      value={{
        bluetoothConnected,
        setBluetoothConnected,
        measurementStatus,
        setMeasurementStatus,
      }}
    >
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
              }}
            />
            <Tab.Screen
              name="Fenster"
              component={windowStackNavigator}
              options={{
                tabBarIcon: "application",
              }}
            />
            <Tab.Screen
              name="Gerätestatus"
              component={DeviceStatusScreen}
              options={{
                tabBarIcon: "devices",
                tabBarColor: "green",
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </StateContext.Provider>
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
