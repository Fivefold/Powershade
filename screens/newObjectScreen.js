import React from "react";
import { View, StyleSheet } from "react-native";
import { FAB, TextInput } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("test.db");

export function NewObjectScreen({ navigation }) {
  const [project, setProject] = React.useState({
    id: "",
    customer: "",
    street: "",
    number: "",
    zip: null,
    city: "",
  });

  const setValue = (key, value) => {
    setProject((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO projects (customer, street, number, zip, city) VALUES
        (?, ?, ?, ?, ?);`,
        [
          project.customer,
          project.street,
          project.number,
          project.zip,
          project.city,
        ]
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Kunde"
        mode="outlined"
        value={project.customer}
        onChangeText={(text) => setValue("customer", text)}
        style={styles.fullTextInput}
      />
      <TextInput
        id="street"
        label="Straße"
        mode="outlined"
        value={project.street}
        onChangeText={(text) => setValue("street", text)}
        style={styles.wideTextInput}
      />
      <TextInput
        id="number"
        label="Nr."
        mode="outlined"
        keyboardType="number-pad"
        value={project.number}
        onChangeText={(text) => setValue("number", text)}
        style={styles.smallTextInput}
      />
      <TextInput
        id="zip"
        label="PLZ"
        mode="outlined"
        keyboardType="number-pad"
        value={project.zip}
        onChangeText={(text) => setValue("zip", Number(text))}
        style={styles.smallTextInput}
      />
      <TextInput
        id="city"
        label="Stadt"
        mode="outlined"
        value={project.city}
        onChangeText={(text) => setValue("city", text)}
        style={styles.wideTextInput}
      />
      <FAB
        style={styles.fab}
        icon="content-save"
        label="Speichern"
        onPress={() => {
          add();
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
