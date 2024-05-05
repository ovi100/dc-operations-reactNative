import { groupBy } from '../../../../utils';

const mergeInventory = inventoryData => {
  return inventoryData.reduce((acc, item) => {
    // Check if there's already an entry for this material in the accumulator
    const existingEntry = acc.find(entry => entry.material === item.material);

    if (existingEntry) {
      // If material already exists, check if the bin already exists for this material
      const existingBin = existingEntry.bins.find(
        bin => bin.bin === item.bin && bin.gondola === item.gondola,
      );

      if (existingBin) {
        // If bin exists, update the quantity
        existingBin.quantity += item.quantity;
      } else {
        // If bin does not exist, add a new bin entry
        existingEntry.bins.push({
          bin: item.bin,
          gondola: item.gondola,
          quantity: item.quantity,
        });
      }
    } else {
      // If material does not exist, create a new entry
      acc.push({
        material: item.material,
        bins: [
          {
            bin: item.bin,
            gondola: item.gondola,
            quantity: item.quantity,
          },
        ],
      });
    }

    return acc;
  }, []);
};

const updateStoItems = (stoItems, inventoryItems) => {
  const items = stoItems.map(stoItem => {
    const matchedItem = inventoryItems.find(
      inventoryItem => inventoryItem.material === stoItem.material,
    );

    if (matchedItem) {
      return {...stoItem, bins: matchedItem.bins};
    }
  });

  return items;
};

const adjustStoQuantity = (stoItems, articles) => {
  const result = stoItems
    .map(stoItem => {
      const matchedArticle = articles.find(
        article => article.code === stoItem.material,
      );
      if (matchedArticle) {
        return {
          ...stoItem,
          remainingQuantity: stoItem.quantity - matchedArticle.inboundPickedQuantity,
        };
      } else {
        return {
          ...stoItem,
          remainingQuantity: stoItem.quantity,
        };
      }
    })
    .filter(item => item.remainingQuantity !== 0);
  return result;
};

const stoItemsByBin = (stoItems, inventoryItems) => {
  const binObject = groupBy(inventoryItems, 'bin');
  // const filteredBinObject = {};
  const stoItemsByBin = [];

  for (const bin in binObject) {
    const items = stoItems.map(stoItem => {
      const matchedItem = binObject[bin].find(
        binItem => binItem.material === stoItem.material,
      );

      if (matchedItem) {
        return {...stoItem, binQuantity: matchedItem.quantity};
      }
    });

    if (items.length > 0) {
      stoItemsByBin.push({bin, items});
      // filteredBinObject[bin] = items;
    }
  }

  // return filteredBinObject;
  return stoItemsByBin;
};

export { adjustStoQuantity, mergeInventory, stoItemsByBin, updateStoItems };

