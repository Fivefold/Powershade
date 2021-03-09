import React from "react";
import { View, StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

import { CustomTextInput } from "../components/CustomTextInput";

export function EditObjectScreen({ navigation }) {
  const [editMode, setEditMode] = React.useState(false);

  function toggleEditMode() {
    editMode ? setEditMode(false) : setEditMode(true);
  }

  return (
    <View style={styles.container}>
      <CustomTextInput
        disabled={!editMode}
        label="Kunde"
        value="Max Mustermann"
        mode="outlined"
        style={styles.fullTextInput}
      />
      <CustomTextInput
        disabled={!editMode}
        label="Straße"
        value="Musterstraße"
        mode="outlined"
        style={styles.wideTextInput}
      />
      <CustomTextInput
        disabled={!editMode}
        label="Nr."
        value="12"
        mode="outlined"
        keyboardType="number-pad"
        style={styles.smallTextInput}
      />
      <CustomTextInput
        disabled={!editMode}
        label="PLZ"
        value="1234"
        mode="outlined"
        keyboardType="number-pad"
        style={styles.smallTextInput}
      />
      <CustomTextInput
        disabled={!editMode}
        label="Stadt"
        value="Musterstadt"
        mode="outlined"
        style={styles.wideTextInput}
      />
      <FAB
        style={styles.fab}
        icon={editMode ? "content-save" : "pencil"}
        label={editMode ? "Speichern" : "Bearbeiten"}
        onPress={
          editMode
            ? () => toggleEditMode() //
            : () => toggleEditMode()
        }
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
