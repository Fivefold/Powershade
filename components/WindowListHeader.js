import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar, IconButton, List, Menu } from "react-native-paper";
import * as SQLite from "expo-sqlite";

import colors from "../constants/colors";

const db = SQLite.openDatabase("test.db");

function ActiveProject() {
  const [activeProject, setActiveProject] = React.useState(null);
  const [numWindows, setNumWindows] = React.useState(0);

  React.useEffect(() => {
    // get the active project for displaying in the header
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT 
        id, customer, street, number, zip, city 
        FROM projects
        WHERE EXISTS (SELECT 1 FROM settings 
          WHERE 
            projects.id = settings.value 
            AND 
            settings.key = 'active_project');`,
          [],
          (_, { rows: { _array } }) => {
            setActiveProject(_array);
            //console.log("window list header: " + JSON.stringify(_array));
          },
          (t, error) => {
            console.log(error);
          }
        );
      },
      (t) => console.log("query active project in window list header: " + t)
    );

    // get the number of windows of the active project for displaying in
    // the header
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT COUNT(id) AS numWin FROM windows
            WHERE EXISTS (SELECT 1 FROM settings 
              WHERE 
                windows.project = settings.value 
                AND 
                settings.key = 'active_project');`,
          [],
          (_, { rows: { _array } }) => {
            setNumWindows(_array[0].numWin);
          },
          (t, error) => {
            console.log(error);
          }
        );
      },
      (t) => console.log("query number of windows in window list header: " + t)
    );
  });

  if (activeProject === null || activeProject.length === 0) {
    console.log("no project active");
    return <Text>Keine Projekte angelegt</Text>;
  }

  return (
    <View style={{ width: "100%" }}>
      {activeProject.map(({ id, customer, street, number, zip, city }) => (
        <View key={id} style={{ width: "100%" }}>
          <List.Item
            title={customer}
            description={`${street} ${number}, ${zip} ${city}`}
            left={() => (
              <List.Icon icon="home-account" color={colors.white.high_emph} />
            )}
            theme={{ colors: { text: colors.white.high_emph } }}
          />
          <Text style={styles.numberOfWin}>{numWindows} Fenster</Text>
        </View>
      ))}
    </View>
  );
}

export function WindowListHeader({ navigation, previous }) {
  const [activeProject, setActiveProject] = React.useState(null);

  React.useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT 
        id, customer, street, number, zip, city 
        FROM projects
        WHERE EXISTS (SELECT 1 FROM settings 
          WHERE 
            projects.id = settings.value 
            AND 
            settings.key = 'active_project');`,
          [],
          (_, { rows: { _array } }) => setActiveProject(_array),
          (t, error) => {
            console.log(error);
          }
        );
      },
      (t) => console.log("query active project in window list header: " + t)
    );
  }, []);

  return (
    <Appbar.Header style={styles.appbar}>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="Fensterliste" />
      {
        <View style={styles.stackIcons}>
          <IconButton
            icon="magnify"
            color={colors.white.high_emph}
            onPress={() => console.log("Pressed search")}
          />
          <IconButton
            icon="download"
            color={colors.white.high_emph}
            onPress={() => console.log("Pressed download")}
          />
        </View>
      }
      <ActiveProject />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    height: 150,
    width: "100%",
    flexWrap: "wrap",
  },
  stackIcons: {
    flexDirection: "row",
    right: 4,
  },
  numberOfWin: {
    color: colors.white.high_emph,
    alignSelf: "center",
    paddingHorizontal: 13,
  },
  listTheme: {},
});
