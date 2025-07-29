import logoDark from "@/assets/logo-dark.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  ArrowRight,
  BadgePercent,
  Bell,
  Box,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Edit,
  FileEdit,
  FileText,
  Hash,
  HashIcon,
  HelpCircle,
  IndianRupee,
  Menu,
  Package,
  Percent,
  Search,
  ShieldCheck,
  Truck,
  User,
  FileSearch,
  CalendarDays,
  UserCircle,
  CalendarCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { callSoapService } from "@/api/callSoapService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { convertServiceDate } from "@/utils/dateUtils";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const RfqPortalPage = () => {
  // State variables
  const [quotations, setQuotations] = useState([]);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [suppliersList, setSuppliersList] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [editableItems, setEditableItems] = useState({});
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [groupedQuotations, setGroupedQuotations] = useState({});
  const [itemSearch, setItemSearch] = useState("");

  // Dialog state for Offer/Edit
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerDialogItem, setOfferDialogItem] = useState(null);

  const { userData } = useAuth();
  

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchQuotations();
    }
  }, [selectedSupplier]);

  // Group quotations by QUOTATION_REF_NO
  useEffect(() => {
    if (quotations.length > 0) {
      const grouped = quotations.reduce((acc, current) => {
        const key = current.QUOTATION_REF_NO;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      }, {});
      setGroupedQuotations(grouped);
    }
  }, [quotations]);

  const fetchSuppliers = async () => {
    try {
      const payload = {
        DataModelName: "VENDOR_MASTER",
        WhereCodition: "",
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      if (response && Array.isArray(response)) {
        const uniqueSuppliers = response.reduce((acc, current) => {
          const x = acc.find(
            (item) => item.VENDOR_ID === current.VENDOR_ID
          );
          if (!x) {
            return acc.concat([current]);
          }
          return acc;
        }, []);

        setSuppliersList(uniqueSuppliers);
      } else {
        setSuppliersList([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch suppliers. Please try again later.",
      });
    }
  };

  const fetchQuotations = async () => {
    try {
      const payload = {
        DataModelName: "INVT_PURCHASE_QUOTMASTER",
        WhereCondition: `SELECTED_VENDOR = '${selectedSupplier.VENDOR_ID}'`,
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      if (response && Array.isArray(response)) {
        setQuotations(response);
        // Initialize editable state for each item
        const initialEditableState = {};
        response.forEach((item) => {
          initialEditableState[`${item.ITEM_CODE}-${item.QUOTATION_REF_NO}`] = {
            quantity: false,
            rate: false,
            discount: false,
            qty: item.QTY,
            suggestedRate: item.SUGGESTED_RATE,
            discountValue: item.DISCOUNT,
          };
        });
        setEditableItems(initialEditableState);
      } else {
        setQuotations([]);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quotations. Please try again later.",
      });
    }
  };

  const handleSupplierSelection = (supplierValue) => {
    const selected = suppliersList.find(
      (sup) =>
        `${sup.VENDOR_ID}-${sup.VENDOR_NAME}` === supplierValue
    );

    if (selected) {
      setSelectedSupplier(selected);
      setOpenSupplier(false);
      setSearchSupplier("");
    }
  };

  const toggleEditable = (itemCode, quotationRefNo, field) => {
    const uniqueKey = `${itemCode}-${quotationRefNo}`;
    setEditableItems((prev) => ({
      ...prev,
      [uniqueKey]: {
        ...prev[uniqueKey],
        [field]: !prev[uniqueKey]?.[field],
      },
    }));
  };

  const handleFieldChange = (itemCode, quotationRefNo, field, value) => {
    const uniqueKey = `${itemCode}-${quotationRefNo}`;
    setEditableItems((prev) => ({
      ...prev,
      [uniqueKey]: {
        ...prev[uniqueKey],
        [field]: value,
      },
    }));
  };

  const saveFieldValue = (itemCode, quotationRefNo, field) => {
    const uniqueKey = `${itemCode}-${quotationRefNo}`;
    toggleEditable(itemCode, quotationRefNo, field);
  };

  const calculateItemValues = (item) => {
    const uniqueKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}`;
    const editableItem = editableItems[uniqueKey] || {};
    const rate =
      parseFloat(editableItem.suggestedRate || item.SUGGESTED_RATE) || 0;
    const qty = parseFloat(editableItem.qty || item.QTY) || 0;
    const discount =
      parseFloat(editableItem.discountValue || item.DISCOUNT) || 0;

    const totalValue = rate * qty;
    const discountValue = totalValue * (discount / 100);
    const actualValue = totalValue - discountValue;

    return {
      totalValue,
      discountValue,
      actualValue,
    };
  };

  // Filter items by search
  const filterItems = (items) => {
    if (!itemSearch.trim()) return items;
    return items.filter(
      (item) =>
        item.ITEM_CODE?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.DESCRIPTION?.toLowerCase().includes(itemSearch.toLowerCase())
    );
  };

  // Dialog handlers
  const openOfferDialog = (item) => {
    setOfferDialogItem(item);
    setOfferDialogOpen(true);
  };

  const closeOfferDialog = () => {
    setOfferDialogOpen(false);
    setOfferDialogItem(null);
  };

  const renderItemCards = (items) => {
    return filterItems(items).map((item, index) => {
      const { totalValue, actualValue } = calculateItemValues(item);
      const uniqueKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}`;
      const editableItem = editableItems[uniqueKey] || {};

      return (
        <motion.div
          key={`${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${index}`}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-blue-50 to-slate-100 shadow-lg hover:shadow-xl transition-all"
        >
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center  justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-2 shadow">
                    <Box className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-indigo-700">
                      {item.ITEM_CODE}
                    </CardTitle>
                    <CardDescription className="text-xs sm:max-w-[250px] w-full sm:truncate truncate-none text-slate-500">
                      {item.DESCRIPTION}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-indigo-200">
                  {item.UOM}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4 pb-2">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs text-gray-500">
                  <HashIcon className="h-3 w-3" />
                  Quantity
                </Label>
                {editableItem.quantity ? (
                  <Input
                    type="number"
                    value={editableItem.qty}
                    onChange={(e) =>
                      handleFieldChange(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "qty",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      saveFieldValue(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "quantity"
                      )
                    }
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex h-8 items-center rounded-md px-2 text-sm cursor-pointer hover:bg-indigo-50"
                    onClick={() =>
                      toggleEditable(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "quantity"
                      )
                    }
                  >
                    {editableItem.qty || item.QTY}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs text-gray-500">
                  <IndianRupee className="h-3 w-3" />
                  Rate
                </Label>
                {editableItem.rate ? (
                  <Input
                    type="number"
                    value={editableItem.suggestedRate}
                    onChange={(e) =>
                      handleFieldChange(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "suggestedRate",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      saveFieldValue(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "rate"
                      )
                    }
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex h-8 items-center rounded-md px-2 text-sm cursor-pointer hover:bg-indigo-50"
                    onClick={() =>
                      toggleEditable(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "rate"
                      )
                    }
                  >
                    ₹{editableItem.suggestedRate || item.SUGGESTED_RATE}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs text-gray-500">
                  <Percent className="h-3 w-3" />
                  Discount
                </Label>
                {editableItem.discount ? (
                  <Input
                    type="number"
                    value={editableItem.discountValue}
                    onChange={(e) =>
                      handleFieldChange(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "discountValue",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      saveFieldValue(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "discount"
                      )
                    }
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex h-8 items-center rounded-md px-2 text-sm cursor-pointer hover:bg-indigo-50"
                    onClick={() =>
                      toggleEditable(
                        item.ITEM_CODE,
                        item.QUOTATION_REF_NO,
                        "discount"
                      )
                    }
                  >
                    ({editableItem.discountValue || item.DISCOUNT}%)
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Total Value</Label>
                <div className="text-sm font-semibold text-indigo-700">
                  ₹{totalValue.toFixed(2)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-3">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">Net:</span>
                <span className="font-semibold text-green-600">
                  ₹{actualValue.toFixed(2)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-indigo-200 hover:bg-indigo-50"
                onClick={() => openOfferDialog(item)}
              >
                <Edit className="h-3 w-3" />
                <span>Offer</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    });
  };

  const renderItemTable = (items) => {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="overflow-x-auto"
      >
        <Table>
          <TableHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <TableRow>
              <TableHead className="w-[120px]">Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">UOM</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[120px]">Rate (₹)</TableHead>
              <TableHead className="w-[100px]">Discount %</TableHead>
              <TableHead className="w-[120px]">Total (₹)</TableHead>
              <TableHead className="w-[120px]">Net Value (₹)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterItems(items).map((item, index) => {
              const { totalValue, actualValue } = calculateItemValues(item);
              const uniqueKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}`;
              const editableItem = editableItems[uniqueKey] || {};

              return (
                <TableRow
                  key={`${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${index}`}
                  className="hover:bg-indigo-50/50 transition"
                >
                  <TableCell className="font-medium text-indigo-700">
                    {item.ITEM_CODE}
                  </TableCell>
                  <TableCell>{item.DESCRIPTION}</TableCell>
                  <TableCell>{item.UOM}</TableCell>
                  <TableCell>
                    {editableItem.quantity ? (
                      <Input
                        type="number"
                        value={editableItem.qty}
                        onChange={(e) =>
                          handleFieldChange(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "qty",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          saveFieldValue(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "quantity"
                          )
                        }
                        className="h-8 w-20 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-indigo-100 p-2 rounded"
                        onClick={() =>
                          toggleEditable(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "quantity"
                          )
                        }
                      >
                        {editableItem.qty || item.QTY}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editableItem.rate ? (
                      <Input
                        type="number"
                        value={editableItem.suggestedRate}
                        onChange={(e) =>
                          handleFieldChange(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "suggestedRate",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          saveFieldValue(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "rate"
                          )
                        }
                        className="h-8 w-24 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-indigo-100 p-2 rounded"
                        onClick={() =>
                          toggleEditable(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "rate"
                          )
                        }
                      >
                        ₹{editableItem.suggestedRate || item.SUGGESTED_RATE}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editableItem.discount ? (
                      <Input
                        type="number"
                        value={editableItem.discountValue}
                        onChange={(e) =>
                          handleFieldChange(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "discountValue",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          saveFieldValue(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "discount"
                          )
                        }
                        className="h-8 w-16 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-indigo-100 p-2 rounded"
                        onClick={() =>
                          toggleEditable(
                            item.ITEM_CODE,
                            item.QUOTATION_REF_NO,
                            "discount"
                          )
                        }
                      >
                        {editableItem.discountValue || item.DISCOUNT}%
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{totalValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ₹{actualValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => openOfferDialog(item)}
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
    );
  };

  const calculateSummary = (items) => {
    let totalValue = 0;
    let totalDiscount = 0;
    let actualValue = 0;

    items.forEach((item) => {
      const values = calculateItemValues(item);
      totalValue += values.totalValue;
      totalDiscount += values.discountValue;
      actualValue += values.actualValue;
    });

    const discountPercentage =
      totalValue > 0 ? ((totalDiscount / totalValue) * 100).toFixed(2) : 0;

    return {
      totalValue,
      totalDiscount,
      actualValue,
      discountPercentage,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-md">
        <div className="flex h-16 items-center justify-between bg-zinc-900 px-4 text-white">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                RFQ Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute right-1 top-1 h-4 w-4 justify-center p-0 bg-pink-600 text-white">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-white/20 p-1 pr-3 bg-white/10 shadow">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:block">
                John Doe
              </span>
              <ChevronDown className="hidden h-4 w-4 text-white/70 sm:block" />
            </div>
            <div className="h-8 w-20">
              <img src={logoDark} alt="Logo" className="h-8 w-20" />
            </div>
          </div>
        </div>
      </header>

      {/* Supplier Selection */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-2 p-2"
      >
        <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSupplier}
              className="w-full justify-between bg-white border-2 border-indigo-100 shadow hover:border-indigo-300 transition"
            >
              {selectedSupplier
                ? `${selectedSupplier.VENDOR_NAME || ""} (${selectedSupplier.VENDOR_ID || ""
                })`
                : "Select supplier..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 rounded-xl shadow-lg border-indigo-100">
            <Command className="h-[300px] overflow-y-auto">
              <CommandInput
                placeholder="Search suppliers..."
                value={searchSupplier}
                onValueChange={setSearchSupplier}
              />
              <CommandEmpty>No supplier found.</CommandEmpty>
              <CommandGroup className="overflow-y-auto">
                {suppliersList
                  .filter(
                    (supplier) =>
                      supplier.VENDOR_NAME?.toLowerCase().includes(searchSupplier.toLowerCase()) ||
                      String(supplier.VENDOR_ID || "").toLowerCase().includes(searchSupplier.toLowerCase())
                  )
                  .map((supplier) => (
                    <CommandItem
                      key={`${supplier.VENDOR_ID}-${supplier.VENDOR_NAME}`}
                      value={`${supplier.VENDOR_ID}-${supplier.VENDOR_NAME}`}
                      onSelect={handleSupplierSelection}
                      className="cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex justify-between truncate items-center">
                          <span className="font-medium truncate">
                            {supplier.VENDOR_NAME}
                          </span>
                          <span className="text-xs bg-indigo-100 truncate px-2 py-1 rounded-full text-gray-500">
                            Vendor Id - {supplier.VENDOR_ID}
                          </span>
                        </div>

                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </motion.div>

      
      

      {selectedSupplier && quotations.length > 0 ? (
        <Accordion type="single" collapsible className="w-full px-4">
          <AnimatePresence>
            {Object.entries(groupedQuotations).map(([quotationRefNo, items]) => {
              const firstItem = items[0];
              const {
                totalValue,
                totalDiscount,
                actualValue,
                discountPercentage,
              } = calculateSummary(items);

              return (
                <motion.div
                  key={quotationRefNo}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className=""
                >
                  <AccordionItem
                    value={quotationRefNo}
                    className="rounded-2xl overflow-hidden shadow-lg border-0 mb-1"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline bg-gradient-to-r from-indigo-100 via-blue-100 to-white rounded-t-2xl border-0">
                      <div className="w-full rounded-lg">
                        <div className="flex w-full items-center justify-between ">
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-indigo-900 dark:text-gray-100">
                              {firstItem.SELECTED_VENDOR_NAME}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-indigo-700">
                              {items.length} {items.length > 1 ? "items" : "item"}
                            </div>
                            <div className="rounded-md bg-blue-200 px-3 py-1 text-sm font-medium text-blue-900 dark:bg-blue-800 dark:text-blue-100">
                              <span className="font-medium text-xs">
                                Quotation Ref No: {quotationRefNo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
                      {/* Main Content */}
                      <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="space-y-1"
                      >
                        {/* Quotation Details */}
                        <div className=" grid grid-cols-1 gap-1 lg:grid-cols-4">
                          {/* Quotation Details Card */}
                          <Card className="border-indigo-100   shadow-sm rounded-xl">
                            <CardHeader className="py-2 px-2">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">
                                    Quotation Details
                                  </CardTitle>
                                  <CardDescription className="text-sm">
                                    Quotation Ref No: {quotationRefNo}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Quotation Date
                                    </p>
                                    <p className="text-sm font-medium">
                                      {convertServiceDate(
                                        firstItem.QUOTATION_REF_DATE
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Last Submission
                                    </p>
                                    <p className="text-sm font-medium">
                                      {convertServiceDate(firstItem.ENT_DATE)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Offer Valid Till
                                    </p>
                                    <p className="text-sm font-medium">
                                      {convertServiceDate(
                                        firstItem.EXPECTED_DATE
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Supplier Card */}
                          <Card className="border-indigo-100 col-span-2 shadow-sm rounded-xl">
                            <CardHeader className="py-2 px-2">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">
                                    Supplier Details
                                  </CardTitle>
                                  <CardDescription className="text-sm">
                                    {firstItem.SELECTED_VENDOR_NAME} - VENDOR ID{" "}
                                    {firstItem.SELECTED_VENDOR}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-1 space-y-1">
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <FileSearch className="h-4 w-4 text-gray-500" />{" "}
                                    Supplier Quotation No
                                  </p>
                                  <p className="text-sm font-medium">
                                    <Input
                                      value={firstItem.SUBMITTED_BY}
                                      placeholder="e.g. QUT-2024-001"
                                    />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4 text-gray-500" />{" "}
                                    Supplier Quotation Date
                                  </p>
                                  <p className="text-sm font-medium">
                                    <Input
                                      value={firstItem.SUBMITTED_BY}
                                      placeholder="Select date"
                                      type="date"
                                    />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <UserCircle className="h-4 w-4 text-gray-500" />{" "}
                                    Submitted By
                                  </p>
                                  <p className="text-sm font-medium">
                                    <Input
                                      value={firstItem.SUBMITTED_BY}
                                      placeholder="e.g. John Doe"
                                    />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <CalendarCheck className="h-4 w-4 text-gray-500" />{" "}
                                    Last Submission Date
                                  </p>
                                  <p className="text-sm font-medium">
                                    <Input
                                      value={firstItem.SUBMITTED_BY}
                                      placeholder="Select date"
                                      type="date"
                                    />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-gray-500" />{" "}
                                    Offer Valid Till
                                  </p>
                                  <p className="text-sm font-medium">
                                    <Input
                                      value={firstItem.SUBMITTED_BY}
                                      placeholder="Select date"
                                      type="date"
                                    />
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Terms Card */}
                          <Card className="border-indigo-100  shadow-sm rounded-xl bg-blue-50">
                            <CardHeader className="py-2 px-2">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                  <FileEdit className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                                  <CardDescription className="text-sm">
                                    Payment and Delivery Terms
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {/* No of Payments */}
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center justify-center h-8 w-6">
                                    <BadgePercent className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <div className="flex items-center justify-between w-full">
                                    <p className="text-xs text-gray-500 w-40 whitespace-nowrap">
                                      No of Payments
                                    </p>
                                    <Input className="w-32 h-8" value={firstItem.DELIVERY_TERMS} placeholder="Enter Payments  " />
                                  </div>
                                </div>

                                {/* Credit Days */}
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center justify-center h-8 w-6">
                                    <Truck className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <div className="flex items-center justify-between w-full">
                                    <p className="text-xs text-gray-500 w-40 whitespace-nowrap">
                                      Credit Days
                                    </p>
                                    <Input className="w-32 h-8" value={firstItem.DELIVERY_TERMS} placeholder="Enter Credit days  " />
                                  </div>
                                </div>

                                {/* Delivery Days */}
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center justify-center h-8 w-6">
                                    <Package className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <div className="flex items-center justify-between w-full">
                                    <p className="text-xs text-gray-500 w-40 whitespace-nowrap">
                                      Delivery Days
                                    </p>
                                    <Input className="w-32 h-8" value={firstItem.DELIVERY_TERMS} placeholder="Delivery days  " />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>



                        </div>

                        {/* Items Section */}
                        <div className="border  shadow-sm rounded-xl">
                          <CardHeader className="py-2  border-b-indigo-100 border-b   px-3">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                              <div>
                                <CardTitle>Items List</CardTitle>
                                <CardDescription>
                                  {items.length} items found
                                </CardDescription>
                              </div>
                              <div className="flex w-full gap-2 sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                  <Input
                                    type="search"
                                    placeholder="Search items..."
                                    className="w-full pl-10 rounded-lg border-indigo-100"
                                    value={itemSearch}
                                    onChange={(e) =>
                                      setItemSearch(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="flex">
                                  <Button
                                    variant={
                                      viewMode === "cards" ? "default" : "outline"
                                    }
                                    size="sm"
                                    className={cn(
                                      "rounded-r-none",
                                      viewMode === "cards"
                                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                                        : "border-indigo-200"
                                    )}
                                    onClick={() => setViewMode("cards")}
                                  >
                                    Cards
                                  </Button>
                                  <Button
                                    variant={
                                      viewMode === "table" ? "default" : "outline"
                                    }
                                    size="sm"
                                    className={cn(
                                      "rounded-l-none",
                                      viewMode === "table"
                                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                                        : "border-indigo-200"
                                    )}
                                    onClick={() => setViewMode("table")}
                                  >
                                    Table
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-1">
                            <AnimatePresence mode="wait">
                              {viewMode === "cards" ? (
                                <motion.div
                                  key="cards"
                                  variants={fadeIn}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3"
                                >
                                  {renderItemCards(items)}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="table"
                                  variants={fadeIn}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="rounded-lg border bg-white shadow-sm"
                                >
                                  {renderItemTable(items)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>

                          {/* Summary Section */}
                          <div className="grid grid-cols-1 gap-1 p-1 md:grid-cols-3">
                            <div className="col-span-2 rounded-lg border  p-4 shadow-sm hover:shadow-lg">
                              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
                                <FileEdit className="h-5 w-5 text-indigo-600" />
                                Additional Notes
                              </h3>
                              <Textarea
                                placeholder="Enter any additional terms or conditions..."
                                className="min-h-[120px] border-indigo-100"
                              />
                            </div>
                            <div className="rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-lg">
                              <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                                <BadgePercent className="h-5 w-5 text-indigo-600" />
                                Pricing Summary
                              </h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Total Value
                                  </span>
                                  <span className="font-medium">
                                    ₹{totalValue.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Total Discount
                                  </span>
                                  <span className="font-medium text-red-600">
                                    -₹{totalDiscount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Discount Percentage
                                  </span>
                                  <span className="font-medium">
                                    {discountPercentage}%
                                  </span>
                                </div>
                                <div className="my-3 border-t border-gray-200"></div>
                                <div className="flex justify-between text-lg font-semibold">
                                  <span>Total Amount</span>
                                  <span className="text-indigo-600">
                                    ₹{actualValue.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer with Submit Button */}
                          <CardFooter className="flex justify-between border-t bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600"
                            >
                              <HelpCircle className="mr-2 h-4 w-4" />
                              Help
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-indigo-200"
                              >
                                Save Draft
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow"
                              >
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Submit Quotation
                              </Button>
                            </div>
                          </CardFooter>
                        </div>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}

          </AnimatePresence>
        </Accordion>
      ) : (
        <div className="flex items-center leading-loose text-gray-400  justify-center h-screen">
          Select the Vendor to see the RFQ
        </div>
      )}

    </motion.div>
  );
};

export default RfqPortalPage;
