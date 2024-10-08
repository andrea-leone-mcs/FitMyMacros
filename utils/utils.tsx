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


const getMacroSource = (foods: object[], macro: 'proteins' | 'carbs' | 'fats') => {
    const ratios = foods.map(food => food[macro] / food['kcals']);
    console.log('ratios', ratios);
    const maxIndex = ratios.indexOf(Math.max(...ratios));
    return foods[maxIndex];
}

const solveSystemOfEquations = (A: number[][], B: number[]): number[] | null => {
    const n = A.length;
  
    // Augment the matrix A with the column vector B
    for (let i = 0; i < n; i++)
      A[i].push(B[i]);
  
    // Perform Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Make the diagonal contain all 1's
      let maxRow = i;
      for (let k = i + 1; k < n; k++)
        if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i]))
          maxRow = k;
  
      // Swap the rows
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
  
      // Make sure the pivot is not zero
      if (A[i][i] === 0) return null; // No unique solution
  
      // Normalize the row
      for (let j = i + 1; j <= n; j++)
        A[i][j] /= A[i][i];
  
      // Eliminate the column below the pivot
      for (let k = i + 1; k < n; k++) {
        const factor = A[k][i];
        for (let j = i; j <= n; j++)
          A[k][j] -= factor * A[i][j];
      }
    }
  
    // Perform back substitution
    const solution = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = A[i][n];
      for (let j = i + 1; j < n; j++)
        solution[i] -= A[i][j] * solution[j];
    }
  
    return solution;
  }

export { roundToDecimalPlaces, sortByEditDistance, getMacroSource, solveSystemOfEquations };