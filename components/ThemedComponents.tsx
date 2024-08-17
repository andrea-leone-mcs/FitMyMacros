import { DimensionValue, StyleSheet, Text, TextProps, View, ViewProps, useColorScheme } from "react-native";
import Colors from "../styles/Colors";
import { useEffect } from "react";

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

const HSpaceView: React.FC<{size: number}> = ({ size }) => <View style={{ width: size }} />;
const VSpaceView: React.FC<{size: number}> = ({ size }) => <View style={{ height: size }} />;
const HLine: React.FC<{width: DimensionValue, topMargin: number, bottomMargin: number}> = ({ width, topMargin = 0, bottomMargin = 0 }) => <View
  style={{
    height: 1,
    width: width,
    borderBottomColor: Colors.light,
    borderBottomWidth: 1,
    marginTop: topMargin,
    marginBottom: bottomMargin,
  }}
/>

const CustomProgressBar: React.FC<{ label: string, progress: number, max: number }> = ({ label, progress, max }) => {
  return (
    <View style={{
      justifyContent: 'center',
      width: '100%',
      height: 26,
      backgroundColor: Colors.black,
      borderRadius: 50,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.light,
    }}>
      <View style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 1,
      }}>
        <Text style={{
          fontWeight: 'bold',
          fontSize: 16,
          color: Colors.white,
        }}>
          {label}      {progress} / {max}
        </Text>
      </View>
      <View style={{
        width: `${progress * 100 / max}%`,
        height: 20,
        backgroundColor: Colors.lessDark,
      }} />
    </View>
  );
}

export { ThemedText, ThemedView, HSpaceView, VSpaceView, HLine, CustomProgressBar };