import { DarkTheme } from "@react-navigation/native";
import Colors from "./Colors";

const MyTheme = {
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: 'cyan',
      background: Colors.darker,
      card: '#121212',
      text: '#ffffff',
      border: '#272727',
      notification: 'cyan',
    },  
  },
  light: {
    colors: {
      primary: 'cyan',
      background: Colors.lighter,
      card: '#ffffff',
      text: '#000000',
      border: '#272727',
      notification: 'cyan',
    },
  },
};

const CalendarDarkTheme = {
  backgroundColor: '#333',
  calendarBackground: '#333',
  textSectionTitleColor: '#fff',
  selectedDayBackgroundColor: '#00adf5',
  selectedDayTextColor: '#fff',
  todayTextColor: '#00adf5',
  dayTextColor: '#fff',
  monthTextColor: '#fff',
  indicatorColor: '#fff',
  arrowColor: '#fff',
  textDisabledColor: '#555',
};

export {MyTheme, CalendarDarkTheme};