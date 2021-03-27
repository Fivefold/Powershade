import * as React from "react";
import { View, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, Menu } from "react-native-paper";

import { WindowThumbnail } from "../components/WindowThumbnail";

const Warnings = (props) => {
  var warnings = null;

  if (props.noDimensions)
    warnings += <Menu.Item icon="application" title="Keine Fenstermaße" />;

  return warnings;
};

export const WindowWarningsMenu = (props) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <WindowThumbnail {...props} />
          </TouchableOpacity>
        }
      >
        <Warnings {...props} />
      </Menu>
    </View>
  );
};
