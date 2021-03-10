import React from "react";
import { View, StyleSheet } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("sqlite.db");

import { CustomTextInput } from "../components/CustomTextInput";

export function NewObjectScreen({ navigation }) {
  const [values, setValues] = React.useState({
    customer: "",
    street: "",
    number: "",
    zip: "",
    city: "",
  });

  const setValue = (key, value) => {
    var newState = values;
    newState[key] = value;
    setValues(newState);
  };

  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO projects (customer, street, number, zip, city) VALUES
        (?, ?, ?, ?, ?);`,
        [values.customer, values.street, values.number, values.zip, values.city]
      );
    });
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        id="customer"
        label="Kunde"
        mode="outlined"
        value={values.customer}
        setValue={setValue}
        style={styles.fullTextInput}
      />
      <CustomTextInput
        id="street"
        label="Straße"
        mode="outlined"
        value={values.street}
        setValue={setValue}
        style={styles.wideTextInput}
      />
      <CustomTextInput
        id="number"
        label="Nr."
        mode="outlined"
        keyboardType="number-pad"
        value={values.number}
        setValue={setValue}
        style={styles.smallTextInput}
      />
      <CustomTextInput
        id="zip"
        label="PLZ"
        mode="outlined"
        keyboardType="number-pad"
        value={values.zip}
        setValue={setValue}
        style={styles.smallTextInput}
      />
      <CustomTextInput
        id="city"
        label="Stadt"
        mode="outlined"
        value={values.city}
        setValue={setValue}
        style={styles.wideTextInput}
      />
      <FAB
        style={styles.fab}
        icon="content-save"
        label="Speichern"
        onPress={() => {
          console.log(values);
          add();
          navigation.navigate({
            name: "selectObject",
          });
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
