const mergeInventory = array => {
  return array.reduce((acc, curr) => {
    const matchedArticle = acc.find(entry => entry.material === curr.material);

    if (matchedArticle) {
      const matchedBin = matchedArticle.bins.find(
        bin => bin.bin === curr.bin && bin.gondola === curr.gondola,
      );

      if (matchedBin) {
        matchedBin.quantity += curr.quantity;
      } else {
        matchedArticle.quantity = matchedArticle.quantity + curr.quantity;
        matchedArticle.bins.push({
          bin: curr.bin,
          gondola: curr.gondola,
          quantity: curr.quantity,
          tracking: curr.tracking,
        });
      }
    } else {
      acc.push({
        createdAt: curr.createdAt,
        bins: [
          {
            bin: curr.bin,
            gondola: curr.gondola,
            quantity: curr.quantity,
            tracking: curr.tracking,
          },
        ],
        description: curr.description,
        material: curr.material,
        onHold: curr.onHold,
        quantity: curr.quantity,
        site: curr.site,
        status: curr.description,
        updatedAt: curr.updatedAt,
      });
    }

    return acc;
  }, []);
};

export { mergeInventory };

