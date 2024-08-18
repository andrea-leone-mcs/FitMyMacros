import axios from 'axios';
import { roundToDecimalPlaces, sortByEditDistance } from '../utils/utils';

const jsonToFood = (jsonFood: object) => {
  const keys = Object.keys(jsonFood);
  const id = jsonFood["_id"];
  const productName = [...keys.filter(key => key.startsWith("product_name")), ""].reduce((acc, key) => acc || jsonFood[key], undefined);
  const nutriments = jsonFood["nutriments"];
  const kcals = roundToDecimalPlaces(parseFloat(nutriments["energy-kcal_100g"]), 1)
  const carbs = roundToDecimalPlaces(parseFloat(nutriments["carbohydrates_100g"]), 1)
  const fats = roundToDecimalPlaces(parseFloat(nutriments["fat_100g"]), 1)
  const proteins = roundToDecimalPlaces(parseFloat(nutriments["proteins_100g"]), 1)
  const brand = jsonFood["brands"].length > 0 ? jsonFood["brands"] : null;
  return {
    id: id,
    name: productName,
    kcals: kcals,
    carbs: carbs,
    fats: fats,
    proteins: proteins,
    brand: brand,
  };
}

const findMatchingFoods = async (foodName: string, diet: string, page: number = 1) => {
  try {
    const url = diet !== 'omnivore' ?
      `https://world.openfoodfacts.org/cgi/search.pl?` + `tagtype_0=labels&tag_contains_0=contains&tag_0=${diet}&` + `search_terms={${foodName}}&search_simple=1&action=process&json=1&page=${page}&page_size=16`
      :
      `https://world.openfoodfacts.org/cgi/search.pl?` + `search_terms={${foodName}}&search_simple=1&action=process&json=1&page=${page}&page_size=16`;
    // const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page=${page}&page_size=16`;
    console.log(url);
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status === 429) {
      console.error('Open Food Facts API rate limit exceeded');
      return { status: 429 };
    } else if (response.status === 200 && response.data.count != 0) {
      console.log('Open Food Facts response: ', response.data.count, ' results');
      const foods = response.data.products
        .map(food => jsonToFood(food))
        .filter(food => food.name && food.kcals && food.carbs && food.fats && food.proteins);
      const sortedFoods = sortByEditDistance(foods, "name", foodName);
      return {
        status: 200,
        foods: sortedFoods
      };
    } else return { status: 404 };
  } catch (error) {
    console.error('Error querying Open Food Facts:', error);
    return { status: 500 };
  }
};

const findFoodById = async (foodId: string) => {
  try {
    const url = `https://world.openfoodfacts.org/api/v3/product/${foodId}.json`;
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status === 200 && response.data.status === "success") {
      const food = jsonToFood(response.data.product);
      if (food.name && food.kcals && food.carbs && food.fats && food.proteins)
        return { status: 200, food: food };
      else return { status: 404 };
    } else return { status: 404 };
  } catch (error) {
    console.error('Error querying Open Food Facts:', error);
    return { status: 500 };
  }
}

export { findMatchingFoods, findFoodById };
