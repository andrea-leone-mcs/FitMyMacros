import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../styles/Colors';
import { StyleSheet } from 'react-native';
import { useRef, useState } from 'react';

// Button to add food to a meal
function PlusButton(props: { onPress, onLongPress?, style?}) {
  const [pressing, setPressing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    props.onLongPress();
    intervalRef.current = setInterval(() => {
      props.onLongPress();
    }, 200);
  };

  const stopLongPress = () => {
    if (intervalRef.current)
      clearInterval(intervalRef.current);
  };

  return (
    <Ionicons name="add-outline" size={24} color={Colors.light}
      style={[
        styles.button,
        { backgroundColor: pressing ? Colors.darker : Colors.dark },
        props.style
      ]}
      onPress={props.onPress}
      onLongPress={() => {
        startLongPress();
      }}
      onPressIn={() => {
        setPressing(true);
      }}
      onPressOut={() => {
        setPressing(false);
        stopLongPress();
      }}
    />
  );
}

// Button to remove food from a meal
function MinusButton(props: { onPress, onLongPress?, style?}) {
  const [pressing, setPressing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    props.onLongPress();
    intervalRef.current = setInterval(() => {
      props.onLongPress();
    }, 200);
  };

  const stopLongPress = () => {
    if (intervalRef.current)
      clearInterval(intervalRef.current);
  };

  return (
    <Ionicons name="remove-outline" size={24} color={Colors.light}
      style={[
        styles.button,
        { backgroundColor: pressing ? Colors.darker : Colors.dark },
        props.style
      ]}
      onPress={props.onPress}
      onLongPress={() => {
        startLongPress();
      }}
      onPressIn={() => {
        setPressing(true);
      }}
      onPressOut={() => {
        setPressing(false);
        stopLongPress();
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