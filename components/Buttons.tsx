import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../styles/Colors';
import { StyleSheet } from 'react-native';
import { useState } from 'react';

// Button to add food to a meal
function AddButton(props: { callback, style?}) {
  const [pressing, setPressing] = useState(false);
  return (
    <Ionicons name="add-outline" size={24} color={Colors.light} onPress={props.callback}
      style={[
        styles.button,
        { backgroundColor: pressing ? Colors.darker : Colors.dark },
        props.style
      ]}
      onPressIn={() => {
        setPressing(true);
      }}
      onPressOut={() => {
        setPressing(false);
      }}
    />
  );
}

// Button to remove food from a meal
function RemoveButton(props: { callback, style?}) {
  const [pressing, setPressing] = useState(false);
  return (
    <Ionicons name="remove-outline" size={24} color={Colors.light} onPress={props.callback}
      style={[
        styles.button,
        { backgroundColor: pressing ? Colors.darker : Colors.dark },
        props.style
      ]}
      onPressIn={() => {
        setPressing(true);
      }}
      onPressOut={() => {
        setPressing(false);
      }}
    />
  );
}

export { RemoveButton, AddButton };

const styles = StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 15,
  }
});