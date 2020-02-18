function removeDuplicates(arr) {
    // If length is one then return 2-dimensional array
    if (arr.length === 1) {
      return [arr];
    }
    // if not sort numerically
    arr.sort((a, b) => a - b);
    // find and remove duplicates
    arr = [...new Set(arr)]; // Set have values which only may include unique values
    const num = Math.round(arr.length / 2);
    const f = arr.slice(0, num); // slice in half
    const s = arr.slice(num, arr.length); // other half
    // return the sliced arrays
    return [f, s];
  }