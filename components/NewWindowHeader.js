import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar, IconButton, List, Menu } from "react-native-paper";

import colors from "../constants/colors";
import { WindowNameInput } from "../components/WindowNameInput";

export function NewWindowHeader({ navigation, previous }) {
  return (
    <Appbar.Header style={styles.appbar}>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="Neues Fenster erstellen" />
      {
        <IconButton
          icon="content-save"
          color={colors.white.high_emph}
          onPress={() => console.log("Pressed save window")}
        />
      }
      {
        <View style={{ width: "100%" }}>
          <List.Item
            title="Max Mustermann"
            description="Musterstraße 12, 1234 Musterstadt"
            left={() => (
              <List.Icon icon="home-account" color={colors.white.high_emph} />
            )}
            theme={{ colors: { text: colors.white.high_emph } }}
          />
          <WindowNameInput label="Raum-/Fenstername" value="" mode="outlined" />
        </View>
      }
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    marginBottom: 160,
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
