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

import colors from "../constants/colors";
import { WindowThumbnail } from "../components/WindowThumbnail";
import { WindowListHeader } from "../components/WindowListHeader";
import { newWindowScreen } from "./newWindowScreen";
import { qrScanScreen } from "./qrScanScreen";

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
        component={newWindowScreen}
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
        component={qrScanScreen}
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
          description="50 x 100 cm - Höhe: 2,42 m"
          onPress={() => console.log("Pressed List item")}
          right={() => <WindowThumbnail width={50} height={100} />}
        />
        <Divider />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Fenster"
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: "newWindow",
            })
          )
        }
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
