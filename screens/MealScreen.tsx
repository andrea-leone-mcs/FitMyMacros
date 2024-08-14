import { ThemedText, ThemedView } from "../components/ThemedComponents";
import { useContext, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FoodsList from "../components/FoodsList";
import Colors from "../styles/Colors";
import { View } from "react-native";
import { addFoodTX, DatabaseContext, delFoodTX, edtFoodTX } from "../storage/dbContext";
import { ScannerView } from "../components/ScannerView";
import { findFoodById } from "../apis/apis";
import SelectAmountDialog from "../components/SelectAmountDialog";


// Screen for a single meal
function MealScreen({ route }): React.JSX.Element {
  // retrieve from the route the meal id and name, the eaten foods and all the recent foods for that type (name) of meal
  const mealId = route.params?.mealId;
  const mealName = route.params?.mealName;
  const foodsParam = route.params?.foods;
  const recentFoods = route.params?.recentFoods;

  // foods eaten in the meal
  const [foods, setFoods] = useState<object[]>(foodsParam);
  // search phrase in the search bar
  const [searchPhrase, setSearchPhrase] = useState("");
  // foods found by the search bar
  const [searchFoods, setSearchFoods] = useState<object[] | null>(null);
  // page of the search results
  const [searchPage, setSearchPage] = useState(1);
  // foods that can be added to the meal (recent foods not already in the meal)
  const [shownRecentFoods, setShownRecentFoods] = useState([]);

  // barcode of the scanned food
  const [barcode, setBarcode] = useState(undefined);
  // scanner status
  const [scannerEnabled, setScannerEnabled] = useState(false);
  // loading status
  const [loading, setLoading] = useState(false);
  // scanned food object (retrieved from barcode)
  const [scannedFoodObj, setScannedFoodObj] = useState<object | undefined>(undefined);
  // is the dialog to select the amount of the scanned food visible? this is used for the scanned food only
  const [selectAmountVisible, setSelectAmountVisible] = useState(false);
  // amount of the scanned food
  const [scannedAmount, setScannedAmount] = useState(100);

  // database context
  const db = useContext(DatabaseContext);
  if (!db) { throw new Error("Can't retrieve db from DatabaseContext"); }

  // add a food to the meal (first in the state, then in the db)
  const addCallback = (food) => {
    console.log(foods);
    setFoods([...foods, food]);
    setSearchFoods(null);

    addFoodTX(db, mealId, food);
  };

  // remove a food from the meal (first in the state, then in the db)
  const removeCallback = (food) => {
    console.log("remove callback ", food.id);
    setFoods(foods.filter(f => f["id"] !== food["id"]));

    delFoodTX(db, mealId, food);
  };

  // edit a food in the meal (first in the state, then in the db)
  const editCallback = (food) => {
    setFoods(foods.map(f => {
      if (f["id"] === food["id"]) {
        return food;
      }
      return f;
    }));

    edtFoodTX(db, mealId, food);
  };

  // update the list of recent foods that can be added to the meal
  useEffect(() => {
    console.log('FOODS', foods);
    console.log('RECENTS', recentFoods);
    setShownRecentFoods(recentFoods.filter(food => !foods.find(f => f["id"] === food["id"])));
  }, [foods]);

  useEffect(() => {
    setLoading(false);
  }, [searchFoods]);

  // when a barcode is scanned, retrieve the food object from the barcode
  useEffect(() => {
    if (barcode) {
      findFoodById(barcode).then((food: object) => {
        setScannedFoodObj(food);
        setLoading(false);
        setSelectAmountVisible(true);
        setBarcode(undefined);
      });
    }
  }, [barcode]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
      }}>{mealName}</ThemedText>
      <FoodsList foods={foods} removeCallback={removeCallback} editCallback={editCallback} />
      <View style={{
        height: 1,
        width: '90%',
        borderBottomColor: Colors.light,
        borderBottomWidth: 1,
      }} />
      {/* {<ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 10, }}>Search Food</ThemedText>} */}
      {
        scannerEnabled ?
          <ScannerView setBarcode={setBarcode} setScannerEnabled={setScannerEnabled} setLoading={setLoading} />
          :
          <>
            <SearchBar searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase} setSearchResults={setSearchFoods} setScannerEnabled={setScannerEnabled} enabled={!loading} setLoading={setLoading} />
            { selectAmountVisible && <SelectAmountDialog visible={true} setVisible={setSelectAmountVisible} food={scannedFoodObj} amount={scannedAmount} setAmount={setScannedAmount} addCallback={addCallback} editCallback={editCallback} />}
            <FoodsList
              foods={searchFoods ? searchFoods : shownRecentFoods}
              setFoods={setSearchFoods}
              searchPhrase={searchPhrase}
              page={searchPage}
              setPage={setSearchPage}
              addCallback={addCallback}
              loading={loading} 
              setLoading={setLoading} />
          </>
      }
    </ThemedView>
  );
}

export default MealScreen;