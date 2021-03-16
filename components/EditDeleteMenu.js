import * as React from "react";
import { View } from "react-native";
import { IconButton, Menu, Divider, Provider } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("test.db");

export const EditDeleteMenu = (props) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
    >
      <Menu.Item icon="pencil" onPress={() => {}} title="Bearbeiten" />
      <Menu.Item
        icon="delete"
        onPress={() => props.deleteProject(props.id)}
        title="Löschen"
      />
    </Menu>
  );
};
