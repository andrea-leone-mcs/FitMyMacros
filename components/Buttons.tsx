import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../styles/Colors';
import { StyleSheet } from 'react-native';
import { useState } from 'react';

function PlusButton(props: { callback, style?}) {
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

function MinusButton(props: { callback, style?}) {
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

export { MinusButton, PlusButton };

const styles = StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 15,
  }
});