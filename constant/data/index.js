import {
  ChildPackingIcon,
  DeliveryNoteIcon,
  DeliveryPlanIcon,
  MasterPackingIcon,
  PickingIcon,
  PrinterIcon,
  ReceivingIcon,
  ReturnIcon,
  ScannerIcon,
  ShelvingIcon,
  TaskAssignIcon,
} from "../icons";

const menuLists = [
  {
    id: "receiving",
    name: "Receiving",
    image: ReceivingIcon,
    url: "home/receiving",
    access: "public",
  },
  {
    id: "shelving",
    name: "Shelving",
    image: ShelvingIcon,
    url: "home/shelving",
    access: "public",
  },
  {
    id: "delivery-plan",
    name: "Delivery Plan",
    image: DeliveryPlanIcon,
    url: "home/deliveryPlan",
    access: "public",
  },
  {
    id: "task-assign",
    name: "Task Assign",
    image: TaskAssignIcon,
    url: "home/taskAssign",
    access: "public",
  },
  {
    id: "picking",
    name: "Picking",
    image: PickingIcon,
    url: "home/picking",
    access: "public",
  },
  {
    id: "child-packing",
    name: "Child Packing",
    image: ChildPackingIcon,
    url: "home/childPacking",
    access: "public",
  },
  {
    id: "master-packing",
    name: "Master Packing",
    image: MasterPackingIcon,
    url: "home/masterPacking",
    access: "public",
  },
  {
    id: "delivery-note",
    name: "Delivery Note",
    image: DeliveryNoteIcon,
    url: "home/deliveryNote",
    access: "public",
  },
  {
    id: "return",
    name: "Return",
    image: ReturnIcon,
    url: "home/return",
    access: "public",
  },
  {
    id: "printer",
    name: "Print",
    image: PrinterIcon,
    url: "home/print",
    access: "public",
  },
  {
    id: "scanner",
    name: "Scan Barcode",
    image: ScannerIcon,
    url: "home/scanBarcode",
    access: "private",
  },
];

const articles = [
  {
    id: 3475241,
    bin_id: "BIN320124",
    name: "article name 1",
    outlet: "outlet name 1",
    quantity: 10,
    selected: false,
  },
  {
    id: 3475242,
    bin_id: "BIN320125",
    name: "article name 2",
    outlet: "outlet name 2",
    quantity: 5,
    selected: false,
  },
  {
    id: 3475243,
    bin_id: "BIN320126",
    name: "article name 3",
    outlet: "outlet name 3",
    quantity: 15,
    selected: false,
  },
  {
    id: 3475244,
    bin_id: "BIN320127",
    name: "article name 4",
    outlet: "outlet name 4",
    quantity: 12,
    selected: false,
  },
  {
    id: 3475245,
    bin_id: "BIN320128",
    name: "article name 5",
    outlet: "outlet name 5",
    quantity: 20,
    selected: false,
  },
];

const stoList = [
  {
    id: 8000135524,
    sku: 10,
    outlet: "outlet name 1",
    status: "picked",
  },
  {
    id: 8000135525,
    sku: 15,
    outlet: "outlet name 2",
    status: "picked",
  },
  {
    id: 8000135526,
    sku: 20,
    outlet: "outlet name 3",
    status: "loading",
  },
  {
    id: 8000135527,
    sku: 18,
    outlet: "outlet name 4",
    status: "loading",
  },
  {
    id: 8000135528,
    sku: 25,
    outlet: "outlet name 5",
    status: "loading",
  },
];

const poList = [
  {
    id: 3000000009,
    sku: 10,
  },
  {
    id: 3000000010,
    sku: 12,
  },
  {
    id: 3000000011,
    sku: 15,
  },
  {
    id: 3000000012,
    sku: 17,
  },
  {
    id: 3000000013,
    sku: 20,
  },
];

const dnList = [
  {
    _id: "dn326574usdt",
    dn_id: 9066573,
    outlet: "outlet 1",
    packed_quantity: 8,
    order_quantity: 8,
  },
  {
    _id: "dn3268713pqr",
    dn_id: 9066574,
    outlet: "outlet 2",
    packed_quantity: 10,
    order_quantity: 12,
  },
  {
    _id: "dn5318713efg",
    dn_id: 9066575,
    outlet: "outlet 3",
    packed_quantity: 15,
    order_quantity: 14,
  },
  {
    _id: "dn5318713asd",
    dn_id: 9066576,
    outlet: "outlet 4",
    packed_quantity: 12,
    order_quantity: 15,
  },
  {
    _id: "dn5318713tsh",
    dn_id: 9066577,
    outlet: "outlet 5",
    packed_quantity: 15,
    order_quantity: 13,
  },
];

export { articles, dnList, menuLists, poList, stoList };
