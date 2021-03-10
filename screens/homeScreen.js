import React from "react";
import { View, Button, StyleSheet, SafeAreaView } from "react-native";
import {
  Appbar,
  List,
  IconButton,
  Text,
  Paragraph,
  RadioButton,
  Divider,
  FAB,
} from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";

import { WindowListScreen } from "./WindowListScreen";
import { NewObjectScreen } from "./NewObjectScreen";
import { EditObjectScreen } from "./EditObjectScreen";

const db = SQLite.openDatabase("sqlite.db");

import colors from "../constants/colors";

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
          headerRight: () => (
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
          ),
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
      <HomeStack.Screen
        name="editObject"
        component={EditObjectScreen}
        options={{
          title: "Objekt bearbeiten",
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
        onPress={() => props.setSelectedObject(props.id)}
      />
    </View>
  );
};

function Projects() {
  const [projects, setProjects] = React.useState(null);
  const [selectedObject, setSelectedObject] = React.useState();

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, customer, street, number, zip, city from projects;`,
        [],
        (_, { rows: { _array } }) => setProjects(_array)
      );
    });
  }, []);

  const updateProjects = () => {
    db.transaction(
      (tx) => {},
      (t, error) => {
        console.log(error);
      }
    );
  };

  if (projects === null || projects.length === 0) {
    return <Text>Keine Projekte angelegt</Text>;
  }

  return (
    <View>
      {projects.map(({ id, customer, street, number, zip, city }) => (
        <List.Item
          key={id}
          title={customer}
          description={`${street} ${number}, ${zip} ${city}`}
          descriptionEllipsizeMode="tail"
          onPress={() => setSelectedObject(id)}
          left={() => (
            <ObjectRadioButton
              id={id}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
            />
          )}
          right={() => (
            <View style={{ justifyContent: "center" }}>
              {/*<IconButton
                icon="pencil"
                onPress={() => navigation.navigate("editObject")}
                color={colors.black.medium_high_emph}
              />*/}
              <IconButton
                icon="delete"
                onPress={() => {
                  db.transaction(
                    (tx) => {
                      tx.executeSql(`DELETE FROM projects WHERE id = ?`, [id]);
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
                }}
                color={colors.black.medium_high_emph}
              />
            </View>
          )}
        />
      ))}
      <Divider />
    </View>
  );
}

export function HomeScreen({ navigation }) {
  //const [selectedObject, setSelectedObject] = React.useState();

  return (
    <View style={styles.container}>
      <ScrollView>
        <Projects navigation={navigation} />
        {/*<List.Item
          title="HELLA Sonnen- und Wetterschutztechnik GmbH"
          description="Abfaltersbach 125, 9913 Abfaltersbach"
          descriptionEllipsizeMode="tail"
          onPress={() => setSelectedObject(2)}
          left={() => (
            <ObjectRadioButton
              id={2}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
            />
          )}
          right={() => (
            <View style={{ justifyContent: "center" }}>
              <IconButton
                icon="pencil"
                onPress={() => navigation.navigate("editObject")}
                color={colors.black.medium_high_emph}
              />
            </View>
          )}
        />
        <Divider />
        <List.Item
          title="HELLA Sonnen- und Wetterschutztechnik GmbH Max Mustermann"
          description="HELLA Sonnen- und Wetterschutztechnik lange lange Adresse GmbH"
          onPress={() => setSelectedObject(3)}
          descriptionEllipsizeMode="tail"
          left={() => (
            <ObjectRadioButton
              id={3}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
            />
          )}
          right={() => (
            <View style={{ justifyContent: "center" }}>
              <IconButton
                icon="pencil"
                onPress={() => navigation.navigate("editObject")}
                color={colors.black.medium_high_emph}
              />
            </View>
          )}
        />
        <Divider />*/}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Objekt"
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: "newObject",
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
  stackIcons: {
    flexDirection: "row",
    right: 4,
  },
  appbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBarHeight,
    height: 56 + StatusBarHeight,
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

/*
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: (props) => <CustomNavigationBar {...props} />,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
      */

/* --- old Appbar on top. Maybe useful for later 
      <Appbar style={styles.appbar}>
        <Appbar.Content title="Aktives Objekt auswählen" />
        <Appbar.Action
          icon="magnify"
          onPress={() => console.log("Pressed search")}
        />
        <Appbar.Action
          icon="download"
          onPress={() => console.log("Pressed export")}
        />
      </Appbar> */
