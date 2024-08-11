import { StackNavigationProp } from '@react-navigation/stack';
import { Image, StyleSheet, Platform, Button, TouchableOpacity, View, Text } from 'react-native';
import { ThemedText } from './ThemedComponents';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Colors from '../styles/Colors';
import { useCallback, useContext, useEffect, useState } from 'react';
import { DatabaseContext, getMealData } from '../storage/dbContext';
import { roundToDecimalPlaces } from '../utils/utils';


function DailyDataHeader(props: { dailyStats: number[] }) {
  return (
    <View style={[tableStyles.container]}>
      <View style={tableStyles.row}>
        <View style={[tableStyles.cell, tableStyles.rightAlignedCell]}>
          <ThemedText style={[tableStyles.rightAlignedText]}>KCALS</ThemedText>
        </View>
        <View style={[tableStyles.cell, tableStyles.leftAlignedCell]}>
          <ThemedText style={tableStyles.leftAlignedText}>{roundToDecimalPlaces(props.dailyStats[0], 1)} / 2150</ThemedText>
        </View>
      </View>
      <View style={[tableStyles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>CARBS</ThemedText></View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>PROS</ThemedText></View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>FATS</ThemedText></View>
      </View>
      <View style={tableStyles.row}>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>{roundToDecimalPlaces(props.dailyStats[1], 1)} / 350</ThemedText></View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>{roundToDecimalPlaces(props.dailyStats[2], 1)} / 150</ThemedText></View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}><ThemedText style={tableStyles.centerAlignedText}>{roundToDecimalPlaces(props.dailyStats[3], 1)} / 60</ThemedText></View>
      </View>
    </View>
  );
}


function DailyMealsTable({ navigation, setDailyStats, day, recentFoods }) {
  const buttonStyles = StyleSheet.create({
    mealBtn: {
      width: 130,
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.lessDark,
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: Colors.lessLight,
    },
    mealBtnText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    mealBtnInfo: {
      color: 'white',
      fontSize: 12,
    }
  });

  const db = useContext(DatabaseContext);
  const [meals, setMeals] = useState<{ [key: string]: number } | null>(null);
  const [mealsData, setMealsData] = useState<{ [key: number]: object } | null>(null);

  if (!db) {
    throw new Error("Can't retrieve db from DatabaseContext");
  }

  useEffect(() => {
    db.transaction(tx => {
      const mealDate = day.toISOString().split('T')[0];
      tx.executeSql("SELECT * FROM meals WHERE date = ?", [mealDate],
        (tx, results) => {
          
          const updateMeals = rows => {
            let tmp = {};
            for (let i = 0; i < rows.length; i++)
              tmp[rows.item(i).name] = rows.item(i).id;
            setMeals(tmp);
          }

          console.log("SELECT meals success: ", results.rows.length, " results.");
          if (results.rows.length == 0) {
            tx.executeSql("INSERT INTO meals(name, date) VALUES (?, ?), (?, ?), (?, ?), (?, ?)",
              ["Breakfast", mealDate, "Lunch", mealDate, "Snacks", mealDate, "Dinner", mealDate],
              (tx, results) => {
                console.log("INSERT meals success: ", results);
                tx.executeSql("SELECT * FROM meals WHERE date = ?", [mealDate],
                  (tx, results) => {
                    console.log("SELECT2 meals success: ", results.rows.length, " results.");
                    updateMeals(results.rows);
                  },
                  error => console.log("Select2 error: ", error)
                );
              }, error => console.log("Insertion error: ", error));
          } else {
            updateMeals(results.rows);
          }
        },
        error => console.log("Select error: ", error)
      );
    });
  }, [day]);

  useFocusEffect(
    useCallback(() => {
      const updateMealsData = async () => {
        let tmp = {};
        for (const key in meals) {
          const [foods, stats] = await getMealData(db, meals[key]);
          tmp[key] = {
            foods: foods,
            stats: stats,
          };
        }
        setMealsData(tmp);
        console.log('meals', meals);
        console.log('mealsData', tmp);
      }

      if (meals)
        updateMealsData();
    }, [meals])
  );

  useEffect(() => {
    if (mealsData) {
      let stats: number[] = [0, 0, 0, 0];
      for (const key in mealsData) {
        stats[0] += mealsData[key]["stats"][0];
        stats[1] += mealsData[key]["stats"][1];
        stats[2] += mealsData[key]["stats"][2];
        stats[3] += mealsData[key]["stats"][3];
      }
      setDailyStats(stats);
    }
  }, [mealsData]);

  return (meals && mealsData) ? (
    <View style={tableStyles.container}>
      <View style={[tableStyles.row, { borderBottomWidth: 0 }]}>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}>
          <TouchableOpacity style={buttonStyles.mealBtn} onPress={() => {
            console.log('navigating to Meal screen ', meals["Breakfast"]);
            navigation.navigate('Meal', {
              mealId: meals["Breakfast"],
              mealName: "Breakfast",
              foods: mealsData["Breakfast"].foods,
              recentFoods: recentFoods["Breakfast"],
            });
          }}>
            <ThemedText style={buttonStyles.mealBtnText}>Breakfast</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Breakfast"].stats[0], 1)} Kcal</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Breakfast"].stats[1], 1)}C,{" "}
              {roundToDecimalPlaces(mealsData["Breakfast"].stats[2], 1)}P,{" "}
              {roundToDecimalPlaces(mealsData["Breakfast"].stats[3], 1)}F</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}>
          <TouchableOpacity style={buttonStyles.mealBtn} onPress={() => {
            console.log('navigating to Meal screen ', meals["Lunch"]);
            navigation.navigate('Meal', {
              mealId: meals["Lunch"],
              mealName: "Lunch",
              foods: mealsData["Lunch"].foods,
              recentFoods: recentFoods["Lunch"],
            });
          }}>
            <ThemedText style={buttonStyles.mealBtnText}>Lunch</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Lunch"].stats[0], 1)} Kcal</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Lunch"].stats[1], 1)}C,{" "}
              {roundToDecimalPlaces(mealsData["Lunch"].stats[2], 1)}P,{" "}
              {roundToDecimalPlaces(mealsData["Lunch"].stats[3], 1)}F</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[tableStyles.row, { paddingBottom: 32 }]}>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}>
          <TouchableOpacity style={buttonStyles.mealBtn} onPress={() => {
            console.log('navigating to Meal screen ', meals["Snacks"]);
            navigation.navigate('Meal', {
              mealId: meals["Snacks"],
              mealName: "Snacks",
              foods: mealsData["Snacks"].foods,
              recentFoods: recentFoods["Snacks"],
            });
          }}>
            <ThemedText style={buttonStyles.mealBtnText}>Snacks</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Snacks"].stats[0], 1)} Kcal</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Snacks"].stats[1], 1)}C,{" "}
              {roundToDecimalPlaces(mealsData["Snacks"].stats[2], 1)}P,{" "}
              {roundToDecimalPlaces(mealsData["Snacks"].stats[3], 1)}F</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={[tableStyles.cell, tableStyles.centerAlignedCell]}>
          <TouchableOpacity style={buttonStyles.mealBtn} onPress={() => {
            console.log('navigating to Meal screen ', meals["Dinner"]);
            navigation.navigate('Meal', {
              mealId: meals["Dinner"],
              mealName: "Dinner",
              foods: mealsData["Dinner"].foods,
              recentFoods: recentFoods["Dinner"],
            });
          }}>
            <ThemedText style={buttonStyles.mealBtnText}>Dinner</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Dinner"].stats[0], 1)} Kcal</ThemedText>
            <ThemedText style={buttonStyles.mealBtnInfo}>{roundToDecimalPlaces(mealsData["Dinner"].stats[1], 1)}C,{" "}
              {roundToDecimalPlaces(mealsData["Dinner"].stats[2], 1)}P,{" "}
              {roundToDecimalPlaces(mealsData["Dinner"].stats[3], 1)}F</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ) : <></>;
}


const tableStyles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 0,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  rightAlignedCell: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  leftAlignedCell: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  centerAlignedCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAlignedText: {
    textAlign: 'right',
    fontSize: 16,
  },
  leftAlignedText: {
    textAlign: 'left',
    fontSize: 16,
  },
  centerAlignedText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export { DailyDataHeader, DailyMealsTable };