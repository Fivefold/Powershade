import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar, IconButton, List, Menu } from "react-native-paper";

import colors from "../constants/colors";

export function WindowListHeader({ navigation, previous }) {
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
          <Text style={styles.numberOfWin}>4 Fenster</Text>
        </View>
      }
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
