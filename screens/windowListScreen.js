import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  Appbar,
  IconButton,
  List,
  TextInput,
  Divider,
  FAB,
  Headline,
} from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";

import { WindowThumbnail } from "../components/WindowThumbnail";
import { WindowListHeader } from "../components/WindowListHeader";
import { NewWindowScreen } from "./NewWindowScreen";
import { QrScanScreen } from "./QrScanScreen";

import colors from "../constants/colors";
import { EditDeleteMenu } from "../components/EditDeleteMenu";

const db = SQLite.openDatabase("test.db");
const WindowStack = createStackNavigator();

export function windowStackNavigator() {
  return (
    <WindowStack.Navigator
      initialRouteName="windowList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary._800,
        },
        headerTintColor: colors.white.high_emph,
        headerTitleStyle: {},
      }}
    >
      <WindowStack.Screen
        name="windowList"
        component={windowListScreen}
        options={{
          header: (props) => <WindowListHeader {...props} />,
        }}
      />
      <WindowStack.Screen
        name="newWindow"
        component={NewWindowScreen}
        options={{
          title: "Neues Fenster erstellen",
          headerRight: () => (
            <View style={styles.stackIcons}>
              <IconButton
                icon="content-save"
                color={colors.white.high_emph}
                onPress={() => console.log("Pressed save window")}
              />
            </View>
          ),
        }}
      />

      <WindowStack.Screen
        name="qrScan"
        component={QrScanScreen}
        options={{
          title: "QR Code scannen",
        }}
      />
    </WindowStack.Navigator>
  );
}

function Windows({ navigation }) {
  const [windows, setWindows] = React.useState(null);

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, project, name, width, height, z_height, qr FROM windows
          WHERE EXISTS (SELECT 1 FROM settings WHERE 
            windows.project = settings.value 
            AND 
            settings.key = 'active_project');`,
        [],
        (_, { rows: { _array } }) => setWindows(_array),
        (t, error) => {
          console.log(error);
        }
      );
    });
  });

  const deleteWindow = (id) => {
    db.transaction(
      (tx) => {
        // delete entry
        tx.executeSql(`DELETE FROM windows WHERE id = ?`, [id]);
        // update the windows state
        tx.executeSql(
          `SELECT id, project, name, width, height, z_height FROM windows
          WHERE EXISTS (SELECT 1 FROM settings WHERE 
            windows.project = settings.value 
            AND 
            settings.key = 'active_project');`,
          [],
          (_, { rows: { _array } }) => setWindows(_array)
        );
      },
      (t, error) => {
        console.log(error);
      }
    );
  };

  if (windows === null || windows.length === 0) {
    return <Headline style={{ padding: 13 }}>Keine Fenster angelegt</Headline>;
  }

  return (
    <View>
      {windows.map(({ id, name, width, height, z_height, qr }) => (
        <View key={id}>
          <List.Item
            title={name}
            description={`${width} cm x ${height} cm - Höhe UK: ${z_height} m`}
            right={() => (
              <View style={styles.stackIcons}>
                <WindowThumbnail
                  width={width}
                  height={height}
                  noDimensions={width === "" || height === ""}
                  fieldsIncomplete={qr === "" || qr === null}
                  measureIncomplete={z_height == ""}
                />
                <EditDeleteMenu
                  id={id}
                  name={name}
                  deleteWindow={deleteWindow}
                  noDimensions={width === "" || height === ""}
                  fieldsIncomplete={qr === "" || qr === null}
                  measureIncomplete={z_height == "" || z_height === null}
                  navigation={navigation}
                />
              </View>
            )}
          />
          <Divider />
        </View>
      ))}
      <Divider />
    </View>
  );
}

export function windowListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Windows navigation={navigation} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Fenster"
        onPress={() => navigation.navigate("newWindow", { qr: "" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  objectView: {
    backgroundColor: colors.primary._800,
  },
  stackIcons: {
    flexDirection: "row",
    right: 0,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
