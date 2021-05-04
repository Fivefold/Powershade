import React from "react";
import { View, StyleSheet } from "react-native";
import {
  FAB,
  HelperText,
  TextInput,
  Text,
  Paragraph,
} from "react-native-paper";
import * as SQLite from "expo-sqlite";

import colors from "../constants/colors";

const db = SQLite.openDatabase("powershade.db");

/** Converts the values in a (nested) object to strings.
 * @param {object} o - The object whose values should be converted
 */
function toString(o) {
  Object.keys(o).forEach((k) => {
    if (typeof o[k] === "object") {
      return toString(o[k]);
    }

    o[k] = "" + o[k];
  });

  return o;
}

export function NewObjectScreen({ route, navigation }) {
  const [project, setProject] = React.useState({
    id: "",
    last_edit: "",
    customer: "",
    street: "",
    number: "",
    zip: "",
    city: "",
  });

  // Error flags for each input field. Used for input validation.
  const [inputErrors, setInputErrors] = React.useState({
    customer: false,
    street: false,
    number: false,
    zip: false,
    city: false,
  });

  // get the project data for filling the forms if editing a project
  React.useEffect(() => {
    if (!(route.params.id === "")) {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT 
              id, customer, street, number, zip, city,
              strftime("%d.%m.%Y %H:%M:%S", last_edit, 'localtime') AS last_edit
            FROM projects
            WHERE id = ?;`,
            [route.params.id],
            (_, { rows: { _array } }) => {
              setProject(toString(_array[0]));
            },
            (t, error) => {
              console.log(error);
            }
          );
        },
        (t) => console.log("EditObjectScreen SQL query: " + t)
      );
    }
  }, []);

  let incomplete =
    Object.values(inputErrors).includes(true) ||
    project.customer === "" ||
    project.street === "" ||
    project.number === "" ||
    project.zip === "" ||
    project.city === "";

  /** Update or add a single value in the 'project' state object. No nesting.
   * @param {string} key - The key in the key-value pair
   * @param {*} value - The value in the key-value pair
   */
  const setValue = (key, value) => {
    setProject((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  /** Update or add a single value in the 'error' state object. No nesting.
   * @param {string} key - The key in the key-value pair
   * @param {*} value - The value in the key-value pair
   */
  const setError = (key, value) => {
    setInputErrors((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  /** Adds a new project to the database */
  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO projects (customer, street, number, zip, city, last_edit) 
        VALUES
          (?, ?, ?, ?, ?, datetime("now"));`,
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

  /** Updates an existing project in the database */
  const update = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE projects 
          SET customer = ?, 
              street = ?, 
              number = ?, 
              zip = ?, 
              city = ?,
              last_edit = datetime("now")
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
        value={project.customer}
        error={inputErrors.customer}
        onChangeText={(text) => {
          setValue("customer", text);
          // if Text is entered, remove the empty field warning
          !(text === "")
            ? setError("customer", false)
            : setError("customer", true);
        }}
        onBlur={() =>
          project.customer === ""
            ? setError("customer", true)
            : setError("customer", false)
        }
        style={styles.fullTextInput}
      />
      <HelperText
        type="error"
        visible={inputErrors.customer}
        style={inputErrors.customer ? null : { display: "none" }}
      >
        Kunde darf nicht leer sein
      </HelperText>

      <TextInput
        id="street"
        label="Straße"
        mode="outlined"
        value={project.street}
        error={inputErrors.street}
        onChangeText={(text) => {
          setValue("street", text);
          // if Text is entered, remove the empty field warning
          !(text === "") ? setError("street", false) : setError("street", true);
        }}
        onBlur={() =>
          project.street === ""
            ? setError("street", true)
            : setError("street", false)
        }
        style={styles.wideTextInput}
      />

      <TextInput
        id="number"
        label="Nr."
        mode="outlined"
        keyboardType="number-pad"
        value={project.number}
        error={inputErrors.number}
        onChangeText={(text) => {
          setValue("number", text);
          // if Text is entered, remove the empty field warning
          !(text === "") ? setError("number", false) : setError("number", true);
        }}
        onBlur={() =>
          project.number === ""
            ? setError("number", true)
            : setError("number", false)
        }
        style={styles.smallTextInput}
      />

      <HelperText
        type="error"
        visible={inputErrors.street}
        style={inputErrors.street ? styles.fullTextInput : { display: "none" }}
      >
        Straße darf nicht leer sein
      </HelperText>

      <HelperText
        type="error"
        visible={inputErrors.number}
        style={inputErrors.number ? styles.fullTextInput : { display: "none" }}
      >
        Nr. darf nicht leer sein
      </HelperText>

      <TextInput
        id="zip"
        label="PLZ"
        mode="outlined"
        keyboardType="number-pad"
        value={project.zip}
        error={inputErrors.zip}
        onChangeText={(text) => {
          setValue("zip", text);
          // if Text is entered, remove the empty field warning
          !(text === "") && RegExp("^\\d{4}$").test(text)
            ? setError("zip", false)
            : setError("zip", true);
        }}
        onBlur={() =>
          RegExp("^\\d{4}$").test(project.zip)
            ? setError("zip", false)
            : setError("zip", true)
        }
        style={styles.smallTextInput}
      />
      <TextInput
        id="city"
        label="Stadt"
        mode="outlined"
        value={project.city}
        error={inputErrors.city}
        onChangeText={(text) => {
          setValue("city", text);
          // if Text is entered, remove the empty field warning
          !(text === "") ? setError("city", false) : setError("city", true);
        }}
        onBlur={() =>
          project.city === "" ? setError("city", true) : setError("city", false)
        }
        style={styles.wideTextInput}
      />

      <HelperText
        type="error"
        visible={inputErrors.zip}
        style={inputErrors.zip ? styles.fullTextInput : { display: "none" }}
      >
        {project.zip === ""
          ? "PLZ darf nicht leer sein"
          : "PLZ muss aus 4 Zahlen bestehen"}
      </HelperText>

      <HelperText
        type="error"
        visible={inputErrors.city}
        style={inputErrors.city ? styles.fullTextInput : { display: "none" }}
      >
        Stadt darf nicht leer sein
      </HelperText>

      {project.last_edit === null || project.last_edit.length === 0 ? null : (
        <Text style={styles.timestamp}>
          Letzte Änderung: {project.last_edit}
        </Text>
      )}

      <FAB
        style={styles.fab}
        disabled={incomplete}
        icon="content-save"
        label="Speichern"
        onPress={() => {
          route.params.id === "" ? add() : update();
          navigation.navigate("selectObject", { projectChange: true });
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
  timestamp: {
    padding: 10,
    color: colors.black.medium_high_emph,
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
