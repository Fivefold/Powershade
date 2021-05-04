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
  Searchbar,
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

const db = SQLite.openDatabase("powershade.db");
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
      <WindowStack.Screen name="windowList" component={windowListScreen} />
      <WindowStack.Screen
        name="newWindow"
        component={NewWindowScreen}
        options={({ route }) => ({ title: route.params.name })}
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

/** Add up to three red icons in a row showing if any fields of a window are
 * missing. Each icon has an assigned boolean prop.
 */
const IncompleteIcon = (props) => {
  if (props.fieldsIncomplete || props.measureIncomplete || props.noDimensions)
    return (
      <View style={styles.windowEntryDesc}>
        <Text style={{ fontSize: 16 }}>{props.name}</Text>
        {props.fieldsIncomplete ? (
          <IconButton
            icon="qrcode"
            color="red"
            size={22}
            style={styles.incompleteIcon}
          />
        ) : null}
        {props.measureIncomplete ? (
          <IconButton
            icon="crosshairs-question"
            color="red"
            size={22}
            style={styles.incompleteIcon}
          />
        ) : null}
        {props.noDimensions ? (
          <IconButton
            icon="application"
            color="red"
            size={22}
            style={styles.incompleteIcon}
          />
        ) : null}
      </View>
    );
  else return <Text>{props.name}</Text>;
};

/** Creates a list of windows of the active project.
 */
function Windows(props) {
  const [windows, setWindows] = React.useState(null);
  const [visibleWindows, setVisibleWindows] = React.useState(null);

  // Get windows from db and check if projects exist
  React.useEffect(() => {
    props.navigation.addListener("focus", () => {
      db.transaction((tx) => {
        // Get windows from db
        tx.executeSql(
          `SELECT id, project, name, width, height, alt, qr FROM windows
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
  }, [props.navigation]);

  /** Deletes a window from the database
   * @param {*} id - The window id of the project to be deleted.
   */
  const deleteWindow = (id) => {
    db.transaction(
      (tx) => {
        // delete entry
        tx.executeSql(`DELETE FROM windows WHERE id = ?`, [id]);
        // update the windows state
        tx.executeSql(
          `SELECT id, project, name, width, height, alt FROM windows
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

  // Update visible windows when the windows array changes
  React.useEffect(() => {
    !(props.searchQuery === "") ? null : setVisibleWindows(windows);
    // !(props.searchQuery === "") ? alert("query") : alert("setvisiblewindows");
  }, [windows]);

  // Filter windows when searching
  React.useEffect(() => {
    if (props.searchBarVisible) {
      setVisibleWindows(
        windows.filter((p) => RegExp(props.searchQuery, "i").test(p.name))
      );
    } else {
      setVisibleWindows(windows);
    }
  }, [props.searchQuery, props.searchBarVisible]);

  if (props.noProjects === true) {
    return <Headline style={{ padding: 13 }}>Keine Projekte angelegt</Headline>;
  } else if (windows === null || windows.length === 0) {
    return <Headline style={{ padding: 13 }}>Keine Fenster angelegt</Headline>;
  } else if (visibleWindows === null || visibleWindows.length === 0) {
    return <View></View>;
  }

  return (
    <View>
      {visibleWindows.map(({ id, name, width, height, alt, qr }) => (
        <View key={id}>
          <List.Item
            title={
              <IncompleteIcon
                name={name}
                fieldsIncomplete={qr === "" || qr === null}
                measureIncomplete={alt == "" || alt === null}
                noDimensions={width === "" || height === ""}
              />
            }
            description={
              <Text>
                {width === "" || width === null // Show dimensions
                  ? null
                  : `${width} cm x ${height} cm`}
                {!((width === "" || width === null) && alt === null)
                  ? " - " // Connector
                  : null}
                {alt === null ? null : `Höhe UK: ${alt} m`}
              </Text>
            }
            right={() => (
              <View style={styles.stackIcons}>
                <WindowThumbnail
                  width={width}
                  height={height}
                  noDimensions={width === "" || height === ""}
                  fieldsIncomplete={qr === "" || qr === null}
                  measureIncomplete={alt == ""}
                />
                <EditDeleteMenu
                  id={id}
                  name={name}
                  deleteWindow={deleteWindow}
                  noDimensions={width === "" || height === ""}
                  fieldsIncomplete={qr === "" || qr === null}
                  measureIncomplete={alt == "" || alt === null}
                  navigation={props.navigation}
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

/** Search bar for filtering objects. Shown directly under the header.
 */
const ObjectSearchBar = (props) => {
  props.searchBarVisible ? null : setSearchQuery("");

  return (
    <Searchbar
      placeholder="Objektname"
      onChangeText={(query) => props.setSearchQuery(query)}
      value={props.searchQuery}
    />
  );
};

export function windowListScreen({ navigation }) {
  const [searchBarVisible, setSearchBarVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [noProjects, setNoProjects] = React.useState(true);

  // Check if no projects exist. If so, no windows may be created
  React.useEffect(() => {
    navigation.addListener("focus", () => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT id FROM projects`,
          [],
          (_, { rows: { length } }) =>
            length === 0 ? setNoProjects(true) : setNoProjects(false),
          (t, error) => {
            console.log(error);
          }
        );
      });
    });
  }, [navigation]);

  const toggleSearchBar = (searchBarVisible) => {
    if (searchBarVisible) {
      setSearchBarVisible(false);
      setSearchQuery("");
    } else {
      setSearchBarVisible(true);
    }
  };

  /** WindowlistScreen uses a custom Screen header component. It's set from here
   * to give access to props and context of the screen, needed to implement the
   * search bar
   */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <WindowListHeader
          searchBarVisible={searchBarVisible}
          toggleSearchBar={toggleSearchBar}
        />
      ),
    });
  }, [navigation, searchBarVisible]);

  return (
    <View style={styles.container}>
      {searchBarVisible ? (
        <ObjectSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchBarVisible={searchBarVisible}
        />
      ) : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Windows
          navigation={navigation}
          noProjects={noProjects}
          searchQuery={searchQuery}
          searchBarVisible={searchBarVisible}
        />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Fenster"
        disabled={noProjects ? true : false}
        onPress={() =>
          navigation.navigate("newWindow", {
            qr: "",
            name: "Neues Fenster erstellen",
          })
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
    right: 0,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  windowEntryDesc: {
    flexDirection: "row",
    fontSize: 22,
  },
  incompleteIcon: {
    borderRadius: 0,
    width: 23,
    height: 23,
    alignSelf: "center",
    margin: 0,
    marginLeft: 5,
  },
});
