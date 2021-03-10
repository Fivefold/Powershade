import React from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SQLite from "expo-sqlite";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import {
  Provider as PaperProvider,
  DefaultTheme,
  Appbar,
} from "react-native-paper";
import { StyleSheet, Text, View } from "react-native";

import colors from "./constants/colors";
import { homeScreen, homeStackNavigator } from "./screens/HomeScreen";
import {
  windowListScreen,
  windowStackNavigator,
} from "./screens/WindowListScreen";
import { DeviceStatusScreen } from "./screens/DeviceStatusScreen";

const db = SQLite.openDatabase("sqlite.db");
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
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY NOT null, 
          customer TEXT, 
          street TEXT,
          number TEXT,
          zip INTEGER,
          city TEXT
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS windows (
          id INTEGER PRIMARY KEY NOT null, 
          project INTEGER,
          name TEXT, 
          width REAL,
          height REAL,
          lat REAL,
          long REAL,
          z_height REAL,
          azimuth REAL,
          angle REAL,
          qr TEXT,
          annotations TEXT
        );`
      );
      //tx.executeSql(`DELETE FROM projects WHERE id > 3`);
      /*tx.executeSql(
        `INSERT INTO projects (customer, street, number, zip, city) VALUES
          ('Max Mustermann', 'Musterstraße', '20B', 1234, 'Musterstadt'),
          ('Anna Musterfrau', 'Musterstraße', '1', 1234, 'Musterstadt');`
      );*/
      tx.executeSql("select * from projects", [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    });
  }, []);

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
            }}
          />
          <Tab.Screen
            name="Fensterliste"
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
