import {NativeModules} from 'react-native';

const {SunmiPrinter} = NativeModules;

export enum PrinterStyleKey {
  // double text width
  ENABLE_DOUBLE_WIDTH = 1000,
  //Double text height
  ENABLE_DOUBLE_HEIGHT = 1001,
  // Bold text
  ENABLE_BOLD = 1002,
  // text underline
  ENABLE_UNDERLINE = 1003,
  //Highlight text
  ENABLE_ANTI_WHITE = 1004,
  //Text strikethrough
  ENABLE_STRIKETHROUGH = 1005,
  // italicize text
  ENABLE_ILALIC = 1006,
  //Text reflection
  ENABLE_INVERT = 1007,
  //Set the left and right spacing of text
  SET_TEXT_RIGHT_SPACING = 2000,
  //Set relative position
  SET_RELATIVE_POSITION = 2001,
  //Set absolute position
  SET_ABSOLUATE_POSITION = 2002,
  //Set line spacing
  SET_LINE_SPACING = 2003,
  //Set left margin
  SET_LEFT_SPACING = 2004,
  //Set the style of strikethrough
  SET_STRIKETHROUGH_STYLE = 2005,
}

export enum PrinterStyleValue {
  ENABLE = 1,
  DISABLE = 2,
}

export enum AlignValue {
  LEFT = 0,
  CENTER = 1,
  RIGHT = 2,
}

type SunmiPrinterType = {
  /*
   * Initialize the printer and reset the printing logic program, but do not clear the buffer data, so
   * Unfinished print jobs will be continued after reset
   */
  printerInit: () => void;
  /**
   * Print self-test
   */
  printerSelfChecking: () => void;
  /*
   * Get printer serial number
   * */
  getPrinterSerialNo: () => Promise<string>;
  /*
   * Get printer firmware version number
   * */
  getPrinterVersion: () => Promise<string>;
  /**
   * Get the printer service version number
   * The return value of this interface can be applied to all commercial machine judgments, but some status will not be obtained due to hardware configuration
   * (for example, the mobile phone does not support
   *Open lid detection)
   */
  getServiceVersion: () => Promise<string>;
  /*
   * Get printer model
   */
  getPrinterModal: () => Promise<string>;
  /**
   * Get the current paper specifications of the printer
   * The default paper specification for handheld printers is 58mm, and the default paper specification for desktop printers is 80mm, but you can increase the
   * After setting the printer configuration to use 58mm paper specification, this interface will return the paper specification of the current printer setting;
   */
  getPrinterPaper: () => Promise<string>;
  /**
   * Get the print head printing length
   * Currently, the printing length since power-on can be obtained. Due to the hardware difference between desktop and mobile computers, the return of the printing
   * results is slightly different.
   * Different, that is, the handheld computer obtains the printing length through the ICallback callback interface, and the desktop computer obtains the length
   * directly through the return value.
   */
  getPrintedLength: () => void;
  /**
   * Get the latest status of your printer
   */
  updatePrinterState: () => Promise<number>;
  /**
   * Print ESC/POS format instructions
   * @param data
   */
  sendRAWData: (data: string) => void;
  /**
   * Set printer style
   * @param key
   * @description Define and set different properties
   * @param value
   * @description Corresponding attribute setting status or size
   */
  setPrinterStyle: (
    key: PrinterStyleKey,
    val: PrinterStyleValue | number,
  ) => void;
  /**
   * Set alignment mode
   * Global method, which has an impact on subsequent printing. Related settings will be canceled when the printer is initialized.
   *
   * @param align
   * @description AlignValue.LEFT => Left; AlignValue.CENTER => Center; AlignValue.RIGHT => Right
   */
  setAlignment: (align: AlignValue) => void;
  /**
   * Set custom font
   * @param typeface
   * @description Specify the name of the custom font to be used. Currently, only redundant fonts are supported. The fonts must be preset in the application assets directory.
   */
  setFontName: (typeface: string) => void;
  /**
   * Set font size
   *
   * @param size
   * @description Global method, which affects subsequent printing. The setting can be canceled during initialization. The font size is a printing method that exceeds
   * standard international instructions.
   * Adjusting the font size will affect the character width, and the number of characters per line will also change accordingly, so the layout formed by a fixed-width
   * font may be disordered.
   */
  setFontSize: (size: number) => void;
  /**
   * Set and cancel bolding
   *
   * @param isWeight
   * @default false
   */
  setFontWeight: (isWeight: boolean) => void;
  /**
   * Print text
   * If you want to modify the style of printed text (such as orientation, font size, bold, etc.), please set it before calling the printText method.
   * Set.
   *
   * @param text
   */
  printerText: (text: string) => void;
  /**
   * Print text with specified font and size
   * The font setting is only valid for this time
   *
   * @param text
   * @description Print content, the text width exceeds one line and automatically wraps and typeset. The part that is less than one line or exceeds one line and
   * is less than one line needs to be at the end.
   * Add the forced newline character "\n" to print it out immediately, otherwise it will be cached in the cache area.
   * @param typeface
   * @description font name (the existing version does not support setting fonts, default).
   * @param fontsize
   * @description Font size, only valid for this method.
   */
  printTextWithFont: (text: string, typeface: string, fontsize: number) => void;
  /**
   * Print vector text
   * The text is output as is according to the text width, that is, each character is not of equal width.
   *
   * @param text
   * @description The text is output as is according to the text width, that is, each character is not of equal width.
   */
  printOriginalText: (text: string) => void;
  /**
   * Print a row of the table (Arabic characters are not supported)
   *
   * @param texts
   * @description string array
   * @param widths
   * @description array of widths of each column
   * @param aligns
   * @description Alignment of each column: AlignValue.LEFT => Left, AlignValue.CENTER => Center, AlignValue.RIGHT => Right.
   */
  printColumnsText: (
    texts: string[],
    widths: number[],
    aligns: number[],
  ) => void;
  /**
   * To print a row of the table, you can specify the column width and alignment method.
   *
   * @param texts
   * @description string array
   * @param widths
   * @description array of widths of each column
   * @param aligns
   * @description Alignment of each column: AlignValue.LEFT => Left, AlignValue.CENTER => Center, AlignValue.RIGHT => Right.
   */
  printColumnsString: (
    texts: string[],
    widths: number[],
    aligns: number[],
  ) => void;
  /**
   * Print 1D barcode
   *
   * @param data
   * @description QR code content
   * @param symbology
   * @description barcode type(0-8)：0 -> UPC-A, 1 -> UPC-E, 2 -> JAN13(ENA13), 3 -> JAN8(EAN8), 4 -> CODE39, 5 -> ITF, 6 -> CODABAR, 7 -> CODE93, 8 -> CODE128
   * @param height
   * @default 162
   * @description Barcode height, value 1 - 255
   * @param width
   * @default 2
   * @description Barcode width, value 2 - 6,
   * @param textPosition
   * @description Text position (0 - 3): 0 -> no text printed, 1 -> text above the barcode, 2 -> text below the barcode, 3 -> print both above and below the barcode
   */
  printBarCode: (
    data: string,
    symbology: number,
    height: number,
    width: number,
    textPosition: number,
  ) => void;
  /**
   * Print QR barcode
   * @description In the normal printing state, after calling this method, the output will be printed directly. Each QR code block is 4 pixels (less than 4 scan code analysis
   * May fail). The maximum supported mode is version19 (93*93).
   *
   * @param data
   * @description QR code content
   * @param modulesize
   * @description QR code block size, unit: points, value 4 to 16.
   * @param errorlevel
   * @description 2D code error correction level (0 - 3): 0 -> error correction level L (7%), 1 -> error correction level M (15%), 2 -> error correction level Q (25%) ,
   * 3 -> Error correction level H (30%)
   */
  printQRCode: (data: string, modulesize: number, errorlevel: number) => void;
  /**
   * Print 2D barcode
   * @description In normal printing state, printing will be output directly after calling this method; this interface is supported after version 4.1.2;
   *
   * @param data
   * @description QR code content
   * @param symbology
   * @description QR code type: 1 -> Qr (same as printQRCode interface), 2 -> PDF417, 3 -> DataMatrix
   * @param modulesize
   * @description Valid block size of QR code. Depending on the code type, the optimal block size supported is different: Qr -> 4～16 (same as printQRCode interface),
   * PDF417 -> 1～4, DataMatrix -> 4 ~16
   * @param errorlevel
   * @description 2D code error correction level. Depending on the code type, the supported level range is different: Qr -> 0～3 (same as printQRCode interface),
   * PDF417 -> 0～8, DataMatrix -> ECC200 is used automatically by default Error correction does not support setting
   */
  print2DCode: (
    data: string,
    sysmbology: number,
    modulesize: number,
    errorlevel: number,
  ) => void;
  /**
   * Dedicated interface for package transaction printing
   *
   * @param tranBean
   * @description task list
   */
  commitPrint: (list: any) => void;
  /**
   * Enter transaction mode
   *
   * @param clear
   * @description Whether to clear the buffer content: true -> clear the last transaction and print uncommitted content; false -> do not clear the last transaction
   * and print uncommitted content, and the next submission will include the last content.
   */
  enterPrinterBuffer: (clear: boolean) => void;
  /**
   * exitPrinterBuffer
   * @support except V1 devices
   * @param commit
   * @description Whether to print out the buffer contents: true -> will print out all the contents in the transaction queue; false -> will not print the contents in the
   * transaction queue, this content will be saved until the next submission.
   */
  exitPrinterBuffer: (commit: boolean) => void;
  /**
   * Submit transaction printing
   * @support except V1 devices
   * @description Submit and print everything in the transaction queue, and then still be in transaction printing mode.
   */
  commitPrinterBuffer: () => void;
  /**
   * Submit the transaction to print and call back the results
   *
   * @support except V1 version
   */
  commitPrinterBufferWithCallbacka: () => void;
  /**
   * Printer paper n lines
   * @description Forces a line break, ending the previous printing content by n lines of paper.
   *
   * @param num
   * @description Number of paper rows
   */
  lineWrap: (num: number) => void;
  /**
   * Cut paper
   * @supported Only supports desktop machines with cutting function
   * @description Since there is a certain distance between the print head and the cutter, the calling interface will automatically complete this distance;
   */
  cutPaper: () => void;
  /**
   * Get the number of cuts
   */
  getCutPaperTimes: () => Promise<number>;
  /**
   * Open the cash box
   * @supported Only supports desktop machines with cash drawer function.
   */
  openDrawer: () => void;
  /**
   * Get the current cash box status
   * @supported Currently, this interface is only supported for S2, T2, and T2mini machines v4.0.0 and above.
   * @description You can use this interface to obtain the status of the cash drawer switch on some models that have the function of connecting to a cash drawer.
   */
  getDrawerStatus: () => void;
  /**
   * Print pictures
   * The maximum pixels of the picture need to be less than 2.5 million in width x height, and the width is set according to the paper specifications
   * (58 is 384 pixels, 80 is 576 pixels),
   * Will not be displayed if it exceeds the paper width
   * https://github.com/Surile/react-native-sunmi-printer/issues/1#issuecomment-1088685896
   * @param encodedString
   * @param pixelWidth
   */
  printBitmap: (encodedString: string, pixelWidth: number) => void;
  /**
   * Print pictures(2)
   * The picture pixel resolution is less than 2 million, and the width is set according to the paper specifications (58 is 384 pixels, 80 is 576 pixels), if it exceeds
   * Will not be displayed if it exceeds the paper width
   *
   * @param bitmap
   * @param type
   */
  printBitmapCustom: (bitmap: any, type: number) => void;
  /**
   * Print pictures(3)
   * The picture pixel resolution is less than 2 million, and the width is set according to the paper specifications (58 is 384 pixels, 80 is 576 pixels), if it exceeds
   * Will not be displayed if it exceeds the paper width
   *
   * @param encodedString
   * @param pixelWidth
   * @param type
   */
  printBitmapBase64Custom: (
    encodedString: string,
    pixelWidth: number,
    type: number,
  ) => void;
  /**
   * Is there a printer service?
   */
  hasPrinter: () => Promise<boolean>;
};

export default SunmiPrinter as SunmiPrinterType;
