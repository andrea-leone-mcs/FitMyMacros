import levenshtein from 'fast-levenshtein';

const roundToDecimalPlaces = (number, places) => Math.round(number * Math.pow(10, places)) / 10;

const sortByEditDistance = (objs, keyField, fixedStr) => {
    // add edit distance to each object
    objs.forEach(obj => {
        obj.editDistance = levenshtein.get(obj[keyField].toLowerCase(), fixedStr.toLowerCase());
    });

    // sort by edit distance
    objs.sort((a, b) => a.editDistance - b.editDistance);

    // remove the edit distance field and return the result
    return objs.map(obj => {
        delete obj.editDistance;
        return obj;
    });
};


const getMacroSourceIndex = (foods: object[], macro: 'pros' | 'carbs' | 'fats') => {
    const proteinRatios = foods.map(food => food[macro] / food['kcals']);
    const maxIndex = proteinRatios.indexOf(Math.max(...proteinRatios));
    return maxIndex;
}

export { roundToDecimalPlaces, sortByEditDistance };