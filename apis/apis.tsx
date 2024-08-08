import axios from 'axios';
import { roundToDecimalPlaces } from '../utils/utils';

const jsonToFood = (jsonFood: object) => {
  const keys = Object.keys(jsonFood);
  const id = jsonFood["_id"];
  const productName = [...keys.filter(key => key.startsWith("product_name")), ""].reduce((acc, key) => acc || jsonFood[key], undefined);
  const nutriments = jsonFood["nutriments"];
  const kcals = roundToDecimalPlaces(parseFloat(nutriments["energy-kcal_100g"]), 1)
  const carbs = roundToDecimalPlaces(parseFloat(nutriments["carbohydrates_100g"]), 1)
  const fats = roundToDecimalPlaces(parseFloat(nutriments["fat_100g"]), 1)
  const proteins = roundToDecimalPlaces(parseFloat(nutriments["proteins_100g"]), 1)
  return {
    id: id,
    name: productName,
    kcals: kcals,
    carbs: carbs,
    fats: fats,
    proteins: proteins
  };
}

const findMatchingFoods = async (foodName: string) => {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page=1&page_size=20`;
    const response = await axios.get(url);
    console.log('Open Food Facts response: ', response.data.products.length, ' results');
    return response.data.products.map(food => jsonToFood(food));
  } catch (error) {
    console.error('Error querying Open Food Facts:', error);
    throw error;
  }
};

const findFoodById = async (foodId: string) => {
  try {
    const url = `https://world.openfoodfacts.org/api/v3/product/${foodId}.json`;
    const response = await axios.get(url);
    return jsonToFood(response.data.product);
  } catch (error) {
    console.error('Error querying Open Food Facts:', error);
    throw error;
  }
}

export { findMatchingFoods, findFoodById };
