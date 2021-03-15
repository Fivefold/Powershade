import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  Appbar,
  IconButton,
  List,
  TextInput,
  Divider,
  FAB,
} from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";

import colors from "../constants/colors";
import { WindowThumbnail } from "../components/WindowThumbnail";
import { WindowListHeader } from "../components/WindowListHeader";
import { NewWindowScreen } from "./NewWindowScreen";
import { QrScanScreen } from "./QrScanScreen";

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
      {/* custom header - input is not selectable? <WindowStack.Screen
        name="newWindow"
        component={newWindowScreen}
        options={{
          header: (props) => <NewWindowHeader {...props} />,
        }}
      />*/}
    </WindowStack.Navigator>
  );
}

function Windows() {
  const [windows, setWindows] = React.useState(null);

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, project, name, width, height, z_height FROM windows
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

  if (windows === null || windows.length === 0) {
    return <Text>Keine Fenster angelegt</Text>;
  }

  return (
    <View>
      {windows.map(({ id, name, width, height, z_height }) => (
        <List.Item
          key={id}
          title={name}
          description={`${width} cm x ${height} cm - Höhe UK: ${z_height} m`}
          onPress={() => console.log("Pressed List item")}
          right={() => <WindowThumbnail width={width} height={height} />}
        />
      ))}
      <Divider />
    </View>
  );
}

export function windowListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/*<View style={styles.objectView}>
        <List.Item
          title="Max Mustermann"
          description="Musterstraße 12, 1234 Musterstadt"
          left={() => <List.Icon icon="home-account" />}
        />
        <Text>4 Fenster</Text>
  </View>*/}

      <ScrollView>
        <Windows />
        {/*
        <List.Item
          title="Top 1 Wohnzimmer 1"
          description="110 x 130 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => <WindowThumbnail width={110} height={130} />}
        />
        <Divider />
        <List.Item
          title="Top 1 Wohnzimmer 2"
          description="100 x 50 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => <WindowThumbnail width={100} height={50} />}
        />
        <Divider />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="210 x 130 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => <WindowThumbnail width={210} height={130} />}
        />
        <Divider />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
        />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
        />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
        />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
        />
        <List.Item
          title="Top 1 Wohnzimmer 3"
          description="0 x 0 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => (
            <WindowThumbnail
              width={Math.random() + 0.3}
              height={Math.random() + 0.3}
            />
          )}
          />*/}
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
    right: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
