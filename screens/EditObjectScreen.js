import React from "react";
import { View, StyleSheet } from "react-native";
import { FAB, TextInput } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("test.db");

export function EditObjectScreen({ route, navigation }) {
  const [project, setProject] = React.useState({
    id: "",
    customer: "",
    street: "",
    number: "",
    zip: null,
    city: "",
  });
  console.log("id = " + route.params.id);
  React.useEffect(() => {
    db.transaction(
      (tx) => {
        // get the project to edit for filling the forms
        tx.executeSql(
          `SELECT 
            id, customer, street, number, zip, city 
            FROM projects
            WHERE id = ?;`,
          [route.params.id],
          (_, { rows: { _array } }) => {
            //console.log("EditObjectScreen: " + JSON.stringify(_array[0]));
            if (project.id === "") {
              setProject(_array[0]);
            }
          },
          (t, error) => {
            console.log(error);
          }
        );
      },
      (t) => console.log("EditObjectScreen SQL query: " + t)
    );
  }, []);

  const setValue = (key, value) => {
    setProject((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  const update = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE projects 
          SET customer = ?, 
              street = ?, 
              number = ?, 
              zip = ?, 
              city = ?
          WHERE id = ?;`,
        [
          project.customer,
          project.street,
          project.number,
          project.zip,
          project.city,
          project.id,
        ],
        null,
        (t, error) => {
          console.log(error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Kunde"
        mode="outlined"
        name="customer"
        value={project.customer}
        onChangeText={(text) => setValue("customer", text)}
        style={styles.fullTextInput}
      />
      <TextInput
        label="Straße"
        mode="outlined"
        value={project.street}
        onChangeText={(text) => setValue("street", text)}
        style={styles.wideTextInput}
      />
      <TextInput
        label="Nr."
        mode="outlined"
        keyboardType="number-pad"
        value={project.number}
        onChangeText={(text) => setValue("number", text)}
        style={styles.smallTextInput}
      />
      <TextInput
        label="PLZ"
        mode="outlined"
        keyboardType="number-pad"
        value={String(project.zip)}
        onChangeText={(text) => setValue("zip", Number(text))}
        style={styles.smallTextInput}
      />
      <TextInput
        label="Stadt"
        mode="outlined"
        value={project.city}
        onChangeText={(text) => setValue("city", text)}
        style={styles.wideTextInput}
      />
      <FAB
        style={styles.fab}
        icon={"content-save"}
        label={"Speichern"}
        onPress={() => {
          console.log(JSON.stringify(project));
          update();
          navigation.navigate("selectObject");
        }}
      />
    </View>
  );
}

var marginHorizontal = "1%";
var marginVertical = "0.5%";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: "center",
    //justifyContent: "center",
    padding: "1%",
  },
  fullTextInput: {
    width: "98%",
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  },
  smallTextInput: {
    width: "30%",
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  },
  wideTextInput: {
    width: "66%",
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  },
  appbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    height: 56 + 20,
  },
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
  },
});
