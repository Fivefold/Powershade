import React from "react";
import { View, Button, StyleSheet } from "react-native";
import {
  List,
  IconButton,
  Text,
  Paragraph,
  RadioButton,
  Divider,
  FAB,
  Headline,
  Searchbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";

import { NewObjectScreen } from "./NewObjectScreen";

const db = SQLite.openDatabase("test.db");

import colors from "../constants/colors";
import { EditDeleteMenu } from "../components/EditDeleteMenu";

const HomeStack = createStackNavigator();
const StatusBarHeight = 20;

export function homeStackNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="selectObject"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary._800,
        },
        headerTintColor: colors.white.high_emph,
        headerTitleStyle: {},
      }}
    >
      <HomeStack.Screen
        name="selectObject"
        component={HomeScreen}
        options={{
          title: "Aktives Objekt auswählen",
        }}
      />
      <HomeStack.Screen
        name="newObject"
        component={NewObjectScreen}
        options={{
          title: "Neues Objekt erstellen",
          // headerRight: () => (
          //   <View style={styles.stackIcons}>
          //     <IconButton
          //       icon="content-save"
          //       color={colors.white.high_emph}
          //       onPress={() => console.log("Pressed save object")}
          //     />
          //   </View>
          // ),
        }}
      />
    </HomeStack.Navigator>
  );
}

const ObjectRadioButton = (props) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <View style={styles.objectRadioButton}>
      <RadioButton
        value={props.id}
        status={props.selectedObject === props.id ? "checked" : "unchecked"}
        onPress={() => props.setActiveProject(props.id)}
      />
    </View>
  );
};

// Creates a list of all projects
function Projects(props) {
  const [projects, setProjects] = React.useState([]);
  const [selectedObject, setSelectedObject] = React.useState();

  const [visibleProjects, setVisibleProjects] = React.useState(null);

  /** Sets the active project by updating the specific field in the database.
   * @param {*} id - The project id to set the active project to.
   */
  const setActiveProject = (id) => {
    setSelectedObject(id);
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE settings SET value = ? WHERE key = 'active_project';`,
          [id],
          (_, { rowsAffected }) => {
            if (rowsAffected == 0)
              tx.executeSql(
                `INSERT INTO settings (key, value) VALUES ('active_project',?);`,
                [id]
              );
          }
        );
      },
      (t) => console.log("setActiveProject: " + t)
    );
  };

  /** Deletes a project from the database
   * @param {*} id - The project id of the project to be deleted.
   */
  const deleteProject = (id) => {
    db.transaction(
      (tx) => {
        // delete entry
        tx.executeSql(`DELETE FROM projects WHERE id = ?`, [id]);
        // update the projects state
        tx.executeSql(
          `select id, customer, street, number, zip, city from projects;`,
          [],
          (_, { rows: { _array } }) => setProjects(_array)
        );
      },
      (t, error) => {
        console.log(error);
      }
    );
  };

  // Get the active project from db
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT value FROM settings WHERE key = "active_project";`,
        [],
        (_, { rows: { _array } }) => setActiveProject(_array[0].value),
        (t, error) => {
          console.log(error);
        }
      );
    });
  }, []);

  // Update projects from db
  React.useEffect(() => {
    props.navigation.addListener("focus", () => {
      db.transaction((tx) => {
        tx.executeSql(
          `select id, customer, street, number, zip, city from projects;`,
          [],
          (_, { rows: { _array } }) => {
            setProjects(_array);
          },
          (t, error) => {
            console.log(error);
          }
        );
      });
    });
  }, [props.navigation]);

  // Update visible objects when the objects array changes
  React.useEffect(() => {
    !(props.searchQuery === "") ? null : setVisibleProjects(projects);
  }, [projects]);

  // Filter objects when searching
  React.useEffect(() => {
    if (props.searchBarVisible) {
      setVisibleProjects(
        projects.filter((p) => RegExp(props.searchQuery, "i").test(p.customer))
      );
    } else {
      setVisibleProjects(projects);
    }
  }, [props.searchQuery, props.searchBarVisible]);

  if (projects === null || projects.length === 0) {
    return (
      <Headline style={{ color: colors.black.medium_high_emph, padding: 13 }}>
        Keine Objekte angelegt
      </Headline>
    );
  }

  return (
    <View>
      {visibleProjects.map(({ id, customer, street, number, zip, city }) => (
        <View key={id}>
          <List.Item
            key={id}
            title={customer}
            description={`${street} ${number}, ${zip} ${city}`}
            descriptionEllipsizeMode="tail"
            onPress={() => setActiveProject(id)}
            left={() => (
              <ObjectRadioButton
                id={id}
                selectedObject={selectedObject}
                setActiveProject={setActiveProject}
              />
            )}
            right={() => (
              <View style={{ justifyContent: "center" }}>
                <EditDeleteMenu
                  id={id}
                  name={customer}
                  deleteProject={deleteProject}
                  navigation={props.navigation}
                  projects={projects}
                  setProjects={setProjects}
                  visibleProjects={visibleProjects}
                  setVisibleProjects={setVisibleProjects}
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

export function HomeScreen({ route, navigation }) {
  const [searchBarVisible, setSearchBarVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  /** Toggle search bar visibility and clear the query when the bar gets hidden
   * @param {boolean} searchBarVisible - the state variable for search bar
   * visibility
   */
  const toggleSearchBar = (searchBarVisible) => {
    if (searchBarVisible) {
      setSearchBarVisible(false);
      setSearchQuery("");
    } else {
      setSearchBarVisible(true);
    }
  };

  /** Models the two Buttons on the right of the header, especially the search
   * button, which is used to toggle visibility of the search bar.
   */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.stackIcons}>
          <IconButton
            icon="magnify"
            color={colors.white.high_emph}
            onPress={() => {
              toggleSearchBar(searchBarVisible);
            }}
            style={
              searchBarVisible
                ? { backgroundColor: colors.white.medium_emph }
                : null
            }
          />

          <IconButton
            icon="download"
            color={colors.white.high_emph}
            onPress={() => console.log("Pressed download")}
          />
        </View>
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
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Projects
          navigation={navigation}
          route={route}
          searchQuery={searchQuery}
          searchBarVisible={searchBarVisible}
        />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Objekt"
        onPress={() => navigation.navigate("newObject", { id: "" })}
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
  emptyList: {
    flex: 1,
    flexDirection: "column",
    //flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: "1%",
  },
  stackIcons: {
    flexDirection: "row",
    right: 4,
  },
  appbar: {
    //height: 150,
    width: "100%",
    flexWrap: "wrap",
  },
  listEntry: {
    alignItems: "center",
  },
  objectRadioButton: {
    justifyContent: "center",
  },
  listEntryBlock: {
    width: 15,
    height: "100%",
    backgroundColor: "red",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
