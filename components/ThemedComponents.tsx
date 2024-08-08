import { Text, TextProps, View, ViewProps, useColorScheme } from "react-native";
import Colors from "../styles/Colors";

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

const ThemedText: React.FC<ThemedTextProps> = ({ children, style, ...props }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColorStyle = {
    color: isDarkMode ? Colors.white : Colors.black,
  };

  return (
    <Text style={[textColorStyle, style]} {...props}>
      {children}
    </Text>
  );
};

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
}

const ThemedView: React.FC<ThemedViewProps> = ({ children, style, ...props }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  return (
    <View style={[backgroundStyle, style]} {...props}>
      {children}
    </View>
  );
};

export {ThemedText, ThemedView};