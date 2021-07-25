import React from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  Button,
  IconButton,
  List,
  Divider,
  FAB,
  Checkbox,
  Title,
  Caption,
  Searchbar,
} from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("powershade.db");

import colors from "../constants/colors";

const ObjectCheckbox = (props) => {
  return (
    <View style={styles.objectCheckbox}>
      <Checkbox
        value={props.id}
        color={colors.black.highest_emph}
        status={props.checked ? "checked" : "unchecked"}
        onPress={() => props.toggleObject(props.id)}
      />
    </View>
  );
};

// Creates a list of all projects
function Projects(props) {
  // Update projects from db
  React.useEffect(() => {
    props.navigation.addListener("focus", () => {
      db.transaction((tx) => {
        tx.executeSql(
          `select id, customer, street, number, zip, city from projects;`,
          [],
          (_, { rows: { length, _array } }) => {
            // if there is only one project, automatically set it as active
            if (length === 1) {
              //setActiveProject(_array[0].id);
            }
            props.setProjects(_array);
          },
          (t, error) => {
            console.log(error);
          }
        );
      });
    });
  }, [props.navigation]);

  if (props.projects === null || props.projects.length === 0) {
    return (
      <Text style={{ color: colors.black.medium_high_emph, padding: 13 }}>
        Keine Objekte angelegt.
      </Text>
    );
  }

  return (
    <View>
      <Divider />
      {props.visibleProjects.map(
        ({ id, customer, street, number, zip, city }) => (
          <View key={id}>
            <List.Item
              key={id}
              title={customer}
              description={`${street} ${number}, ${zip} ${city}`}
              descriptionEllipsizeMode="tail"
              onPress={() => props.toggleObject(id)}
              right={() => (
                <ObjectCheckbox
                  id={id}
                  checked={props.selectedObjects.has(id)}
                  toggleObject={props.toggleObject}
                />
              )}
            />
            <Divider />
          </View>
        )
      )}
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

export function DataExportScreen({ navigation }) {
  const [safUri, setSafUri] = React.useState("");
  const [data, setData] = React.useState({ hits: [] });
  const [searchBarVisible, setSearchBarVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("react");
  const [projects, setProjects] = React.useState([]);
  const [visibleProjects, setVisibleProjects] = React.useState(null);
  const [selectedObjects, setSelectedObjects] = React.useState(new Set());
  let filesystemPermission;

  /** Models the search button right of the header which is used to toggle
   * visibility of the search bar.
   */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
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
      ),
    });
  }, [navigation, searchBarVisible]);

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

  // Update visible objects when the objects array changes
  React.useEffect(() => {
    !(searchQuery === "") ? null : setVisibleProjects(projects);
  }, [projects]);

  // Filter objects when searching
  React.useEffect(() => {
    if (searchBarVisible) {
      setVisibleProjects(
        projects.filter((p) => RegExp(searchQuery, "i").test(p.customer))
      );
    } else {
      setVisibleProjects(projects);
    }
  }, [searchQuery, searchBarVisible]);

  //React.useEffect(() => {
  const chooseDir = async () => {
    let ignore = false;

    async function fetchData() {
      filesystemPermission =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (filesystemPermission.granted) {
        // Gets SAF URI from response
        const uri = filesystemPermission.directoryUri;
        setSafUri(uri);

        console.log("Permissions granted. Uri: " + uri);
      } else {
        console.log("Filesystem permissions not granted by user!");
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  };
  //}, [query]);

  /** Formats a SAF URI to be easier to read by filtering unnecessary parts
   * Example:
   * content://com.android.externalstorage.documents/tree/primary%3Alevel1%2Flevel2
   * into /level1/level2
   * @param {*} uri - The SAF URI to be converted
   */
  const formatSafUri = (uri) => {
    if (uri.length != 0) {
      //cut off from the beginnung up until the first %
      let test1 = new RegExp("^.*?(?=%)");
      //convert the %xx between folder levels into slashes
      let test2 = new RegExp("(%..)", "g");

      let formattedUri = uri.replace(test1, "");
      formattedUri = formattedUri.replace(test2, "/");

      return formattedUri;
    } else return "Kein Speicherort ausgewählt.";
  };

  // Update array of selected objects (toggle checkboxes)
  const toggleObject = (value) => {
    if (selectedObjects.has(value)) {
      // Set.delete returns a boolean, while Set.add returns the new set
      let tempSet = new Set(selectedObjects);
      tempSet.delete(value);
      setSelectedObjects(tempSet);
    } else setSelectedObjects(new Set(selectedObjects).add(value));
  };

  // Toggle all projects at once (disregarding current state).
  const toggleAllObjects = () => {
    if (selectedObjects.size === projects.length) {
      // empty the set
      setSelectedObjects(new Set());
    } else {
      // fill the set with all projects
      let tempSet = new Set();
      projects.forEach((project) => tempSet.add(project.id));
      setSelectedObjects(tempSet);
    }
  };

  const saveCSV = async (uri) => {
    let fileUri = await StorageAccessFramework.createFileAsync(
      uri,
      "testcsv",
      "text/csv"
    );
    await FileSystem.writeAsStringAsync(
      fileUri,
      "hello world,lorem ipsum,column_3,4,5,Änderungen\n" +
        "12.54,255.47,30,Lorem ipsum dolor sit amet,,1234 Wien Musterstadt\n",
      {
        encoding: FileSystem.EncodingType.UTF8,
      }
    );
    return;
  };

  //let fileUri = documentDirectory + "test.txt";

  return (
    <View style={styles.container}>
      {searchBarVisible ? (
        <ObjectSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchBarVisible={searchBarVisible}
        />
      ) : null}
      <ScrollView>
        <View style={styles.saveDir}>
          <Caption>Aktueller Speicherort</Caption>
          <Text>{formatSafUri(safUri)}</Text>
          <Button
            mode="contained"
            icon="folder"
            onPress={() => {
              console.log("pressed chooseDir");
              chooseDir();
            }}
            style={styles.saveDirButton}
          >
            Speicherort wählen
          </Button>
        </View>

        <View style={styles.titleContainer}>
          <Title style={styles.title}>Objekte</Title>
          {selectedObjects.size > 0 ? (
            <Text style={styles.selectedObjectsText}>
              {selectedObjects.size} ausgewählt
            </Text>
          ) : null}
          <View style={styles.selectAllIcon}>
            <ObjectCheckbox
              checked={selectedObjects.size === projects.length}
              toggleObject={toggleAllObjects}
            />
          </View>
        </View>
        <Projects
          navigation={navigation}
          projects={projects}
          setProjects={setProjects}
          visibleProjects={visibleProjects}
          selectedObjects={selectedObjects}
          toggleObject={toggleObject}
        />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="download"
        label={
          (selectedObjects.size > 0 ? selectedObjects.size + " " : "") +
          "Exportieren"
        }
        disabled={safUri && selectedObjects.size !== 0 ? false : true}
        onPress={() => {
          console.log("pressed save on export screen");
          saveCSV(safUri);
        }}
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
  saveDir: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  saveDirButton: {
    marginTop: 10,
    //alignSelf: "center",
  },
  objectCheckbox: {
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
  },
  title: {
    color: colors.primary._800,
    marginLeft: 15,
  },
  selectedObjectsText: {
    paddingTop: 9,
    paddingLeft: 15,
  },
  selectAllIcon: {
    position: "absolute",
    right: 8,
  },
  stackIcons: {
    position: "absolute",
    flexDirection: "row",
    top: -6,
    right: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
