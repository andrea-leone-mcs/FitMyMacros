import { ThemedText, ThemedView } from "../components/ThemedComponents";
import { useContext, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FoodsList from "../components/FoodsList";
import Colors from "../styles/Colors";
import { View } from "react-native";
import { addFoodTX, DatabaseContext, delFoodTX, edtFoodTX } from "../storage/dbContext";

const PROTEIN_BISCUIT_BARCODE = '5055534301012';


function MealScreen({ navigation, route }): React.JSX.Element {
  const mealId = route.params?.mealId;
  const mealName = route.params?.mealName;
  const foodsParam = route.params?.foods;

  const [foods, setFoods] = useState<object[]>(foodsParam);
  const [searchFoods, setSearchFoods] = useState([]);
  const db = useContext(DatabaseContext);

  useEffect(() => {
    console.log('params', foodsParam);
  });


  if (!db) {
    throw new Error("Can't retrieve db from DatabaseContext");
  }

  const addCallback = (food) => {
    console.log(foods);
    setFoods([...foods, food]);
    setSearchFoods([]);

    addFoodTX(db, mealId, food);
  }

  const removeCallback = (food) => {
    console.log("remove callback ", food.id);
    setFoods(foods.filter(f => f["id"] !== food["id"]));

    delFoodTX(db, mealId, food);
  }

  const editCallback = (food) => {
    setFoods(foods.map(f => {
      if (f["id"] === food["id"]) {
        return food;
      }
      return f;
    }));

    edtFoodTX(db, mealId, food);
  }

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
      }}>{mealName}</ThemedText>
      <FoodsList navigation={navigation} foods={foods} addCallback={undefined} removeCallback={removeCallback} editCallback={editCallback} />
      <View style={{
        height: 1,
        width: '90%',
        borderBottomColor: Colors.light,
        borderBottomWidth: 1,
      }} />
      <ThemedText style={{
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
      }}>Add Food</ThemedText>
      <SearchBar navigation={navigation} setSearchResults={setSearchFoods} addCallback={addCallback} barcode={route.params?.barcode} />
      <FoodsList navigation={navigation} foods={searchFoods} addCallback={addCallback} removeCallback={undefined} editCallback={undefined} />
    </ThemedView>
  );
}

export default MealScreen;