import SunmiPrinter from '../../../../utils/sunmi/printer';

const printChildPackingList = data => {
  const {printBarCode, printerText, lineWrap} = SunmiPrinter;
  const date = new Date(data.dateTimePacked);
  const products = data.list;

  printerText(
    `Created On: ${date
      .toDateString('en-UK')
      .slice(4)}, ${date.toLocaleTimeString('en-US')}\n`,
  );
  printerText(`From Site: ${data.supplyingSite}\n`);
  printerText(`To Site: ${data.receivingSite}\n`);
  printerText(`STO Number: ${data.sto}\n`);
  printerText(`DN Number: ${data.dn}\n\n`);
  printBarCode(data.barcode, 8, 380, 3, 2);
  printerText(`Pack Number: ${data.count}\n`);
  printerText('Product List: ');
  const code = products.map(product => product.material).join(',');
  printerText(code);
  printerText('\n');
  lineWrap(5);
};

export { printChildPackingList };

