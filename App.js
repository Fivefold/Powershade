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
  React.useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY NOT null, 
            last_edit INTEGER,
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
            last_edit INTEGER,
            project INTEGER,
            name TEXT, 
            width REAL,
            height REAL,
            sensorCorner TEXT,
            sensorPosH REAL,
            sensorPosV REAL,
            lat REAL,
            long REAL,
            alt REAL,
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
        //tx.executeSql(`DELETE FROM projects WHERE id > 3`);

        /*tx.executeSql(
          `INSERT INTO projects (customer, street, number, zip, city) VALUES
          ('Max Mustermann', 'Musterstraße', '20B', 1234, 'Musterstadt'),
          ('Anna Musterfrau', 'Musterstraße', '1', 1234, 'Musterstadt');`,
          [],
          null,
          (t, error) => {
            console.log(error);
          }
        );*/

        /*tx.executeSql(
          `INSERT INTO windows (project, name, width, height, z_height) VALUES
          (1,"Wohnzimmer 1", 100, 120.5, 2.43),
          (1,"Wohnzimmer 2", 100, 120.5, 2.43),
          (1,"Schlafzimmer", 80, 100, 2.41),
          (2,"Küche", 50, 50.5, 2.40);`,
          [],
          null,
          (t, error) => {
            console.log(error);
          }
        );*/

        tx.executeSql(
          "select * from projects",
          [],
          (_, { rows }) => console.log(JSON.stringify(rows)),
          (t, error) => {
            console.log(error);
          }
        );
        tx.executeSql(
          "select * from settings",
          [],
          (_, { rows }) => console.log(JSON.stringify(rows)),
          (t, error) => {
            console.log(error);
          }
        );
        tx.executeSql(
          `SELECT value FROM settings WHERE key = "active_project";`,
          [],
          (_, { rows: { _array } }) => console.log(_array),
          (t, error) => {
            console.log(error);
          }
        );
      },
      (error) => console.log(error),
      console.log("create table transaction success")
    );
  }, []);

  /*React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "select * from projects",
        [],
        (_, { rows }) => console.log(JSON.stringify(rows)),
        (t, error) => {
          console.log(error);
        }
      );
    });
  }, []);*/

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
