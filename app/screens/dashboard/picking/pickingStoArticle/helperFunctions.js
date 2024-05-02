const mergeInventory = data => {
  // Create an object to hold aggregated data by material
  const mergedItems = {};

  // Iterate over each item in inventoryItems
  data.forEach(item => {
    const {material, quantity, bin, gondola} = item;

    // Check if the material already exists in mergedItems
    if (!mergedItems[material]) {
      // If material does not exist, initialize with empty bins array
      mergedItems[material] = {
        material: material,
        description: item.description,
        bins: [],
      };
    }

    // Check if bin and gondola combination already exists for the material
    const existingBinIndex = mergedItems[material].bins.findIndex(
      b => b.bin === bin && b.gondola === gondola,
    );

    if (existingBinIndex === -1) {
      // If bin and gondola combination does not exist, add it to bins array
      mergedItems[material].bins.push({bin, gondola, quantity});
    }
  });

  // Convert mergedItems object into an array of values
  const mergedItemsArray = Object.values(mergedItems);
  return mergedItemsArray;
};

const updateStoItems = (stoItems, mergeInventoryItems) => {
  const result = stoItems.map(item => {
    const matchedItem = mergeInventoryItems.find(
      mergeInventoryItem => mergeInventoryItem.material === item.material,
    );

    if (matchedItem) {
      return {...item, bins: matchedItem.bins};
    } else {
      return {...item, bins: []};
    }
  });
  return result;
};

export { mergeInventory, updateStoItems };

