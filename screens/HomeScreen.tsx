import React, { useEffect, useState } from 'react';
import { DailyDataHeader, DailyMealsTable } from '../components/DailyTable';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';
import Colors from '../styles/Colors';
import { Calendar } from 'react-native-calendars';
import { ThemedText, ThemedView } from '../components/ThemedComponents';
import { CalendarDarkTheme } from '../styles/Themes';

const Tab = createBottomTabNavigator();

function DateRow({ date, setDate, setCalendarVisible }): React.JSX.Element {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return (
    <ThemedView style={{ alignContent: 'center', flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
      <ThemedView style={{ flex: 1, alignItems: 'center' }}>
        <Icon name="chevron-back" color={Colors.dark} size={30} onPress={() => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() - 1);
          setDate(newDate);
        }} />
      </ThemedView>
      <ThemedText style={{ fontSize: 16 }} onPress={() => { setCalendarVisible(true); }}>{date.toLocaleDateString('en-GB', options)}</ThemedText>
      <ThemedView style={{ flex: 1, alignItems: 'center' }}>
        <Icon name="chevron-forward" color={Colors.dark} size={30} onPress={() => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + 1);
          setDate(newDate);
        }} />
      </ThemedView>
    </ThemedView>
  );
}

function BaseHomeScreen({ navigation }): React.JSX.Element {
  const [dailyStats, setDailyStats] = useState<number[]>([0, 0, 0, 0]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  return (
    <>
      {calendarVisible ?
        <Calendar
          theme={CalendarDarkTheme}
          current={selectedDay.toISOString().split('T')[0]}
          onDayPress={
            (day) => {
              const todate = new Date(day.timestamp)
              console.log(todate);
              setSelectedDay(todate);
              setCalendarVisible(false);
            }
          } markedDates={{
            [selectedDay.toISOString().split('T')[0]]: { selected: true }
          }} />
        : <DateRow date={selectedDay} setDate={setSelectedDay} setCalendarVisible={setCalendarVisible} />
      }
      <DailyDataHeader dailyStats={dailyStats} />
      <DailyMealsTable navigation={navigation} setDailyStats={setDailyStats} day={selectedDay} />
    </>
  );
}

function HomeScreen({ navigation }): React.JSX.Element {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={BaseHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Icon name="home" color={focused ? Colors.white : '#898989'} size={size} />
          ),
          tabBarShowLabel: false,
        }} />
    </Tab.Navigator>
  );
}

export default HomeScreen;
