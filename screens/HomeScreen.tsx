import React, { useEffect, useState, useRef, useContext } from 'react';
import { DailyDataHeader, DailyMealsTable } from '../components/DailyTable';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';
import Colors from '../styles/Colors';
import { Calendar } from 'react-native-calendars';
import { ThemedText, ThemedView } from '../components/ThemedComponents';
import { CalendarDarkTheme } from '../styles/Themes';
import { PanGestureHandler, ScrollView, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native'
import { DatabaseContext, getRecentFoods } from '../storage/dbContext';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

// Row with the date and the arrows to switch the day
function DateRow({ date, setCalendarVisible, switchAnimation }): React.JSX.Element {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return (
    <ThemedView style={{ alignContent: 'center', flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
      <ThemedView style={{ flex: 1, alignItems: 'center' }}>
        <Icon name="chevron-back" color={Colors.dark} size={30} onPress={() => {
          switchAnimation('Right');
        }} />
      </ThemedView>
      <ThemedText style={{ fontSize: 16 }} onPress={() => { setCalendarVisible(true); }}>{date.toLocaleDateString('en-GB', options)}</ThemedText>
      <ThemedView style={{ flex: 1, alignItems: 'center' }}>
        <Icon name="chevron-forward" color={Colors.dark} size={30} onPress={() => {
          switchAnimation('Left');
        }} />
      </ThemedView>
    </ThemedView>
  );
}

// Home Screen View with the daily stats and meals
function HomeScreenView({ navigation, route }): React.JSX.Element {
  // daily stats: kcals, carbs, proteins, fats
  const [dailyStats, setDailyStats] = useState<number[]>([0, 0, 0, 0]);
  // selected day
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  // is the calendar visible?
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  // recent foods
  const [recentFoods, setRecentFoods] = useState({ 'Breakfast': [], 'Lunch': [], 'Snacks': [], 'Dinner': [] });

  // constants used by animation for the swipe
  const translateX = new Animated.Value(0);
  const screenWidth = Dimensions.get('window').width;

  // database context
  const db = useContext(DatabaseContext);
  if (!db) { throw new Error("Can't retrieve db from DatabaseContext"); }

  // retrieve the recent foods when the daily stats change (and on the first render)
  useEffect(() => {
    (async () => setRecentFoods(await getRecentFoods(db)))();
  }, [dailyStats]);

  // animation for the swipe
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );
  const onSwipe = (direction) => {
    console.log('Swiped ' + direction);
    // Animate out the current table
    Animated.timing(translateX, {
      toValue: direction === 'Right' ? screenWidth : -screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Reset the position of the new table off-screen
      translateX.setValue(direction === 'Right' ? -screenWidth : screenWidth);

      // Animate in the new table
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Update the data based on the swipe direction
        if (direction === 'Right') {
          const newDate = new Date(selectedDay);
          newDate.setDate(newDate.getDate() - 1);
          setSelectedDay(newDate);
        } else if (direction === 'Left') {
          const newDate = new Date(selectedDay);
          newDate.setDate(newDate.getDate() + 1);
          setSelectedDay(newDate);
        }
      });
    });
  };
  // handle the swipe gesture
  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: transX } = event.nativeEvent;
      onSwipe(transX > 0 ? 'Right' : 'Left');
    }
  };

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
          }}

        />
        : <DateRow date={selectedDay} setCalendarVisible={setCalendarVisible} switchAnimation={onSwipe} />
      }
      <ScrollView>
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onHandlerStateChange} >
          <Animated.View style={{ transform: [{ translateX }] }}>
            <DailyDataHeader dailyStats={dailyStats} />
            <DailyMealsTable navigation={navigation} setDailyStats={setDailyStats} day={selectedDay} recentFoods={recentFoods} />
          </Animated.View>
        </PanGestureHandler>
      </ScrollView>
    </>
  );
}

// Home Screen with Tab Navigation
function HomeScreen({ navigation }): React.JSX.Element {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeScreenView}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Icon name="home" color={focused ? Colors.white : '#898989'} size={size} />
          ),
          tabBarShowLabel: false,
        }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Icon name="person" color={focused ? Colors.white : '#898989'} size={size} />
          ),
          tabBarShowLabel: false,
        }} />
    </Tab.Navigator>
  );
}

export default HomeScreen;
