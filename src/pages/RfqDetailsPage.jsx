import { callSoapService } from "@/api/callSoapService";
import Header from "@/components/rfqPortal/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useImageAPI } from "@/hooks/useImgApi";
import { cn } from "@/lib/utils";
import { convertDataModelToStringData } from "@/utils/dataModelConverter";
import { convertServiceDate } from "@/utils/dateUtils";
import getExpirationStatus from "@/utils/rfqportalUtils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Check,
  ClipboardList,
  Edit,
  FileEdit,
  File as FileIcon,
  FileSearch,
  HelpCircle,
  Info,
  Package,
  Search,
  UploadCloud,
  User,
  UserCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  CalendarCheck,
  X,
  Coins,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Animation variants for smooth transitions
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAKlBMVEXMzMzy8vL19fXS0tLh4eHZ2dnr6+vv7+/JycnPz8/k5OTc3NzV1dXo6Og1EEG5AAAFxklEQVR4nO2b2XajMAxAjXfZ5v9/d7wRjAMpBCKSOboPnbbpFN/IktcyRhAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRBfj43c3YaLsEwE78Pv61gLyrvRcC7F3W05RexaIokMnA8R95OhgfQhhUQ+RBL67na9ibVCamOGBSdc3azDpMLlY0SakEz4H+tnOSSzR/6Xxy9L0tzdut2kRAE/dgHhg3EKgi5JA3c3cicglDO8NYmfmlGKNFxaltPHqB/oZyBC7lu8E1FsGvety6/5e9v5B7GtQqV07yPivGBNGKz/9qSxScTptnPFz4x2PgDrOhTkV791EmAhNIP7ZBJFlOhF8o8bnpMGv6F/EFM6ZvtyKInRSUkitupVThrDvyxpYkoHWUX45BFnkS6LbFYrq9IPc/c9xTmFJI4ki3EkhcS1EQHIk4A+Zyz/pqSJE8fgSv1t81371L626Ra8NqNfxgBsrnj8O5Im1FkKr9U357MLdSRpWm597oG8n1bKHBqJ2eaOPEcBkWcpi7JldHzvV5fCcvqhzkZkmfHOpIGgnOaLaUoSkWEr18Nj3t83vPzfu5ImTrdkWu+2MTGpAK+HpCDnnx0WCWJL5Wi/hzRTs0mkmziWd3aU3ssXmMZ8bF/wI++/h1ANLIvrXaeHoReZq3EZW1Z5KtzdC+23EGbRabq1JXIxn94VSF17OQT+JB+WgYWJGc306XbPOszjAeazLlbUR8VHjnFwF3rS0pdhImXs/axMnFeVsX0Yy0y+yHBnrwVKaftwZOpwwDWUQlMjc3nVyWPr52XqXL1+WWT05TL5935cplSAx1SkPvSMzOpxRsCRsaUD1DlUicwJmbxRoETnY7Fkcm5Oc6jTMsKZNDXt18tI3YyVpJEwP/R9GatqEe7PM7Bk6q7QJTLwGH65XPwOrALAdF5Iifmhb8tYyecxeLG6wYpMXeCq+aHvyzQnNMvlP5pMKMU5r5nPycDQyCyyBk1GlC378zLA2hmyv0WGufxOisdD35dp153qHhlfivM80Vw7Z3wz3b+nADBVivN5GfYIDY+BaW3wZPKTDL9AxoZp0Ox2//BkWD7nykmzIbP/Jkw6rx2Gsd+IQZTxw5Q0qzIgpNt/pg8hPJ90IMqotD2TJ/6rMnEhemibaCWOiDJCp8MXDrAqY3PgBnlmkYMoU5MmvvlrMnEBn2ZvcY7wPogythTncVUmnVmUaqvfvwyDKRPqjGZNJvXBOniUA9eS3cfOKjC7GZQt+2BXZHy7yylbB+V3hwpTpp5MyBUZ0V68iokjptfS4sXInQHClCkFKybNs4zsNvpNvXtp88rBjPuCgxqZugyAJxlur10bspmRT1MisHZc4iEKsPywwbVyYCV/bkAL1diagFMH+aetw2qjHU1v7vIiGGNMdjQppL/c+6GK6NKK7vI1E215+CkvfbmpfGrZBjk3NAqt/4hI9ZcJqHFa3nqtl3acGXYmC+OyTYyYM3zLdINtXxN5ltkrMzv9NjK1L6308aoF2MOskzIjSp3k6dupvfFZfJx2zcYkLsZa8pTlfEHVIY8E9086UeWaQtXkYll+uDhc1z6w3pdw5ZRnYyV263eDs64viLF7mbQycChjHnYmNXgYMvYuVMlGavMi0ZvuaQPeuXPgNBlxqXMG71s4vnKHLYMC48RMncz9/7Vk+e7megybBGZMzLD0815dBmrr5NJS9J7ZfxV3az8kvZCLX43C0uZcy6RZk8XXwamYnxJZOYV9i0ybCrOWUaZC26aueU1FkwZ38qw8Oqi6U78fTKh7WYJOMn0iy26DFio+0o/e0WrBaaNpR2bR4eom4yo1YzVZQAfFIgr8QZdprnZf76QdWXtBhmYZ85X3nCeztNxZfpt8mvBljm4h3FQ5voq+RJwl6fLDPpfOkLw6lME+z1/HEgQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEH8D/wDnXg4+PJhj2oAAAAASUVORK5CYII=";

function RfqDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { quotation, supplier, items: passedItems } = location.state || {};
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const initializeQuotationData = (item) => ({
    COMPANY_CODE: quotation?.COMPANY_CODE || 1,
    BRANCH_CODE: quotation?.BRANCH_CODE || 1,
    QUOTATION_REF_NO: id,
    QUOTATION_REF_DATE:
      convertServiceDate(quotation?.QUOTATION_REF_DATE) ||
      quotation?.QUOTATION_REF_DATE ||
      new Date().toISOString(),
    QUOTATION_SERIAL_NO: item?.SERIAL_NO || "",
    VENDOR_ID: quotation?.SELECTED_VENDOR || "",
    ITEM_CODE: item?.ITEM_CODE || "",
    DESCRIPTION: item?.DESCRIPTION || "",
    QTY: 0,
    RATE: 0,
    DISCOUNT_RATE: 0,
    DISCOUNT_PTG: 0,
    EXPECTED_DATE:
      convertServiceDate(quotation?.EXPECTED_DATE) ||
      quotation?.EXPECTED_DATE ||
      "",
    RECEIVED_DATE:
      convertServiceDate(quotation?.RECEIVED_DATE) || new Date().toISOString(),
    VENDOR_OFFER: "",
    RECEIVED_STATUS: false,
    SELECTED_STATUS: false,
    CLOSED_STATUS: false,
    USER_NAME: "",
    QUOTATION_STATUS: "",
    ENT_DATE:
      convertServiceDate(quotation?.ENT_DATE) || new Date().toISOString(),
    WORK_REF_SERIAL_NO: null,
    EST_EXT_COMPONENTS_SNO: null,
    QUOTATION_STATUS: null,
    VENDOR_NAME: quotation?.SELECTED_VENDOR_NAME || "",
    CREDIT_DAYS: null,
    NO_OF_PAYMENTS: null,
    DELIVERY_DAYS: null,
    ATTN_TO: null,
    EMAIL_ADDRESS: null,
    UOM: item?.UOM || null,
    FILE_PATH: null,
    FILE_NAME: null,
    VALUE: 0,
    TOTAL_VALUE: 0,
    DISCOUNT_VALUE: 0,
    NET_VALUE: 0,
    FILE_PATH_PDF: null,
    FILE_NAME_PDF: null,
  });

  const [items, setItems] = useState(passedItems || []);
  const [itemSearch, setItemSearch] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [editableItems, setEditableItems] = useState({});
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerDialogItem, setOfferDialogItem] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [terms, setTerms] = useState({
    payments: quotation?.NO_OF_PAYMENTS || "",
    creditDays: quotation?.CREDIT_DAYS || "",
    deliveryDays: quotation?.DELIVERY_DAYS || "",
  });
  const [supplierDetails, setSupplierDetails] = useState({
    quotationNo: quotation?.QUOTATION_REF_NO || "",
    quotationDate: quotation?.QUOTATION_REF_DATE || "",
    submittedBy: quotation?.SUBMITTED_BY || "",
    lastSubmissionDate: quotation?.ENT_DATE || "",
    offerValidTill: quotation?.EXPECTED_DATE || "",
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const { fetchImageUrl } = useImageAPI();

  useEffect(() => {
    fetchImage();
  }, [userData]);

  const fetchImage = async () => {
    try {
      const url = await fetchImageUrl("product", items[0]?.ITEM_CODE || "");
      setImageUrl(url || PLACEHOLDER_IMAGE);
    } catch (error) {
      console.error("Error fetching image:", error);
      setImageUrl(PLACEHOLDER_IMAGE);
    }
  };

  const handlePaymentTermsUpdate = (field, value) => {
    setTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSupplierDetailsUpdate = (field, value) => {
    setSupplierDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterItemsBySearchQuery = (items) => {
    if (!itemSearch) return items;
    const searchLower = itemSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.ITEM_CODE.toLowerCase().includes(searchLower) ||
        item.DESCRIPTION.toLowerCase().includes(searchLower)
    );
  };

  const calculateItemPricing = (item) => {
    const itemKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}`;
    const editableItem = editableItems[itemKey] || {};

    const quantity = parseFloat(editableItem.qty || item.QTY || 0);
    const rate = parseFloat(
      editableItem.suggestedRate || item.SUGGESTED_RATE || 0
    );
    const discountPercentage = parseFloat(
      editableItem.discountValue || item.DISCOUNT || 0
    );

    const grossValue = quantity * rate;
    const discountAmount = grossValue * (discountPercentage / 100);
    const netValue = grossValue - discountAmount;

    return {
      grossValue,
      netValue,
      discountAmount,
      discountPercentage,
    };
  };

  const toggleItemFieldEditMode = (itemCode, refNo, serialNo, field) => {
    const itemKey = `${itemCode}-${refNo}-${serialNo}`;
    const item = items.find(
      (i) => i.ITEM_CODE === itemCode && i.SERIAL_NO === serialNo
    );

    setEditableItems((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: !prev[itemKey]?.[field],
        qty: prev[itemKey]?.qty || item?.QTY || 0,
        suggestedRate:
          prev[itemKey]?.suggestedRate || item?.SUGGESTED_RATE || 0,
        discountValue: prev[itemKey]?.discountValue || item?.DISCOUNT || 0,
        offered: prev[itemKey]?.offered || false,
      },
    }));
  };

  const handleFile = async (file) => {
    try {
      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        preview: "",
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileInfo.preview = e.target.result;
          setUploadedFile(fileInfo);
        };
        reader.onerror = () => {
          console.error(`Error reading file: ${file.name}`);
          setUploadedFile(fileInfo);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFile(fileInfo);
      }

      if (
        !file.type.startsWith("image/") &&
        file.type !== "application/pdf" &&
        !file.type.startsWith("text/") &&
        !file.type.includes("document")
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image, PDF, or document.",
          variant: "destructive",
        });
        setUploadedFile(null);
        return;
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      toast({
        title: "File upload failed",
        description: "An error occurred while processing the uploaded file.",
        variant: "destructive",
      });
      setUploadedFile(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  useEffect(() => {
    return () => {
      if (uploadedFile?.preview) {
        try {
          URL.revokeObjectURL(uploadedFile.preview);
        } catch (error) {
          console.error(`Error revoking URL for ${uploadedFile.name}:`, error);
        }
      }
    };
  }, [uploadedFile]);

  const updateEditableItemField = (itemCode, refNo, serialNo, field, value) => {
    const itemKey = `${itemCode}-${refNo}-${serialNo}`;
    setEditableItems((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: value,
      },
    }));
  };

  const openItemOfferDialog = (item) => {
    setOfferDialogItem(item);
    setOfferDialogOpen(true);
  };

  const closeItemOfferDialog = () => {
    setOfferDialogOpen(false);
    setOfferDialogItem(null);
  };

  const submitSupplierQuotation = async () => {
    const quotationsArray = items.map((item) => {
      const itemKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}`;
      const editableItem = editableItems[itemKey] || {};
      const { grossValue, discountAmount, netValue, discountPercentage } =
        calculateItemPricing(item);

      return {
        ...initializeQuotationData(item),
        NO_OF_PAYMENTS: terms.payments,
        CREDIT_DAYS: terms.creditDays,
        DELIVERY_DAYS: terms.deliveryDays,
        QUOTATION_REF_NO: supplierDetails.quotationNo,
        QUOTATION_REF_DATE:
          convertServiceDate(supplierDetails.quotationDate) ||
          supplierDetails.quotationDate,
        SUBMITTED_BY: supplierDetails.submittedBy,
        ENT_DATE:
          convertServiceDate(supplierDetails.lastSubmissionDate) ||
          supplierDetails.lastSubmissionDate,
        EXPECTED_DATE:
          convertServiceDate(supplierDetails.offerValidTill) ||
          supplierDetails.offerValidTill,
        ITEM_CODE: item.ITEM_CODE,
        DESCRIPTION: item.DESCRIPTION,
        UOM: item.UOM,
        QTY: parseFloat(editableItem.qty) || parseFloat(item.QTY) || 0,
        RATE:
          parseFloat(editableItem.suggestedRate) ||
          parseFloat(item.SUGGESTED_RATE) ||
          0,
        DISCOUNT_PTG: parseFloat(discountPercentage) || 0,
        DISCOUNT_RATE: parseFloat(discountAmount) || 0,
        QUOTATION_STATUS: "SUBMITTED",
        VENDOR_OFFER: editableItem.notes || "",
        OFFERED: editableItem.offered || false,
        TOTAL_VALUE: grossValue,
        DISCOUNT_VALUE: quotationSummary.discountAmount,
        NET_VALUE: netValue,
        FILE_NAME: uploadedFile?.name || null,
        FILE_PATH_: uploadedFile?.preview || null,
      };
    });

    try {
      for (const quotation of quotationsArray) {
        const convertedData = convertDataModelToStringData(
          "INVT_PURCHASE_QUOTDETAILS",
          quotation
        );
        console.log("Converted data:", convertedData);

        const payload = {
          UserName: userData.userName,
          DModelData: convertedData,
        };
        console.log("Payload:", payload);

        const response = await callSoapService(
          userData.clientURL,
          "DataModel_SaveData",
          payload
        );
        console.log("Response:", response);
      }

      toast({
        title: "Quotation submitted successfully",
        description: "All items have been processed successfully.",
      });
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your quotation.",
        variant: "destructive",
      });
    }

    navigate("/rfq-offcial");
  };

  const renderItemCardsView = (items) => {
    return (
      <div className="relative min-w-[900px]">
        {/* Header Row */}
        <div className="flex gap-1 sticky top-0 z-[9999999] left-0 w-full px-1 bg-white mt-1 py-1 items-center shadow-sm">
          <Label className="w-12 hover:text-gray-700">Image</Label>
          <Label className="sm:w-44 min-w-[90px] text-center hover:text-gray-700">
            Description
          </Label>
          <Label className="w-16 hover:text-gray-700 text-right">UOM</Label>
          <Label className="w-12 text-right hover:text-gray-700">Qty</Label>
          <Label className="w-28 text-right hover:text-gray-700">Rate</Label>
          <Label className="w-32 text-right hover:text-gray-700">Total</Label>
          <Label className="w-36 text-right hover:text-gray-700">
            Discount
          </Label>
          <Label className="w-24 flex-1 pr-3 text-right hover:text-gray-700">
            Net Value
            <span className="text-[9px] ml-1 text-green-700">
              [{userData?.companyCurrSymbol || "-"}]
            </span>
          </Label>
          <Label className="w-10 text-center mr-2 hover:text-gray-700">
            Offer
          </Label>
        </div>

        {/* Content Rows */}
        <div
          className="overflow-y-auto overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {filterItemsBySearchQuery(items).map((item, index) => {
            const { grossValue, netValue, discountAmount, discountPercentage } =
              calculateItemPricing(item);
            const itemKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}`;
            const editableItem = editableItems[itemKey] || {};

            return (
              <motion.div
                key={`${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}-${index}`}
                className="rounded-lg border border-gray-300/50 shadow-sm mt-1"
              >
                <Card className="border-0 bg-transparent">
                  <CardContent className="p-0">
                    <div className="flex gap-1 px-1 py-1 items-center w-full">
                      {/* Image Column */}
                      <div className="w-12 flex-shrink-0 flex justify-center">
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                          {item.IMAGE ? (
                            <img
                              src="https://via.placeholder.com/150"
                              alt={""}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f3f4f6' width='80' height='80'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' dy='.35em' x='50%' y='50%' text-anchor='middle'%3E80x80%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            <div className="flex justify-center items-center text-gray-400">
                              <p className="text-[8px] text-center font-normal">
                                img not found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description Column */}
                      <div className="flex-shrink-0 min-w-[90px] sm:w-44 space-y-2 px-2">
                        <div className="text-xs text-gray-700 font-medium line-clamp-2">
                          {item.DESCRIPTION}
                        </div>
                      </div>

                      {/* UOM Column */}
                      <div className="w-16 flex-shrink-0 text-gray-600 rounded-lg px-1 text-xs font-medium text-right">
                        {item.UOM}
                      </div>

                      {/* Quantity Column */}
                      <div className="w-12 flex-shrink-0 text-gray-600 text-right">
                        <div className="flex h-6 text-right items-end justify-end rounded-lg px-1 text-sm cursor-pointer hover:bg-gold-50 transition-colors">
                          {editableItem.qty || item.QTY}
                        </div>
                      </div>

                      {/* Rate Column */}
                      <div className="w-28 flex-shrink-0 text-right">
                        {editableItem.rate ? (
                          <Input
                            value={editableItem.suggestedRate || ""}
                            onChange={(e) =>
                              updateEditableItemField(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "suggestedRate",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              saveItemFieldValue(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "rate"
                              )
                            }
                            className="h-6 border-gray-200 text-right focus:ring-gold-300 focus:border-gold-500"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex h-6 items-end justify-end text-right rounded-lg px-1 text-sm cursor-pointer hover:bg-gold-50 transition-colors border border-transparent hover:border-gray-200"
                            onClick={() =>
                              toggleItemFieldEditMode(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "rate"
                              )
                            }
                          >
                            {editableItem.suggestedRate ||
                              item.SUGGESTED_RATE ||
                              "0.00"}
                          </div>
                        )}
                      </div>

                      {/* Total Value Column */}
                      <div className="w-32 flex-shrink-0 text-right">
                        <div className="text-sm font-semibold py-[2px] px-1 rounded-lg text-right text-orange-700">
                          {grossValue.toFixed(2)}
                        </div>
                      </div>

                      {/* Discount Column */}
                      <div className="w-36 text-right">
                        {editableItem.discount ? (
                          <Input
                            type="number"
                            value={editableItem.discountValue || ""}
                            onChange={(e) =>
                              updateEditableItemField(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "discountValue",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              saveItemFieldValue(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "discount"
                              )
                            }
                            className="h-6 border-gray-200 text-right focus:ring-gold-300 focus:border-gold-500"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex h-6 items-center truncate justify-end text-right rounded-lg px-1 text-sm cursor-pointer hover:bg-gold-50 transition-colors border border-transparent hover:border-gray-200"
                            onClick={() =>
                              toggleItemFieldEditMode(
                                item.ITEM_CODE,
                                item.QUOTATION_REF_NO,
                                item.SERIAL_NO,
                                "discount"
                              )
                            }
                          >
                            {discountAmount.toFixed(2)}{" "}
                            <span className="text-red-500 font-semibold ml-1">
                              ({editableItem.discountValue || item.DISCOUNT}
                              %)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Net Value Column */}
                      <div className="w-24 flex-1 text-right">
                        <div className="text-sm font-semibold px-1 rounded-lg text-right text-green-700">
                          {netValue.toFixed(2)}
                        </div>
                      </div>

                      {/* Offer Column */}
                      <div className="w-10 flex-shrink-0 flex justify-center">
                        <Button
                          variant={editableItem.offered ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-6 w-6 gap-2 rounded-full",
                            editableItem.offered
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                              : "border-gold-300 text-gold-700 hover:bg-gold-100"
                          )}
                          onClick={() => openItemOfferDialog(item)}
                        >
                          {editableItem.offered ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 neutrinos-medium w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderItemsTableView = (items) => {
    return (
      <div className="overflow-x-auto min-w-[900px]">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-lg border border-gray-300/50 shadow-lg"
        >
          <Table>
            <TableHeader className="bg-gradient-to-r from-navy-50 to-gray-50">
              <TableRow>
                <TableHead className="w-[90px] text-center text-navy-700">
                  S.No
                </TableHead>
                <TableHead className="text-navy-700">Description</TableHead>
                <TableHead className="w-[80px] text-navy-700">UOM</TableHead>
                <TableHead className="w-[80px] text-right text-navy-700">
                  Qty
                </TableHead>
                <TableHead className="w-[120px] text-right text-navy-700">
                  Rate
                </TableHead>
                <TableHead className="w-[100px] text-right text-navy-700">
                  Total
                </TableHead>
                <TableHead className="w-[120px] text-right text-navy-700">
                  Discount
                </TableHead>
                <TableHead className="w-[120px] text-right text-navy-700">
                  Net Value
                </TableHead>
                <TableHead className="w-[100px] text-navy-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterItemsBySearchQuery(items).map((item, index) => {
                const { grossValue, netValue, discountAmount } =
                  calculateItemPricing(item);
                const itemKey = `${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}`;
                const editableItem = editableItems[itemKey] || {};

                return (
                  <TableRow
                    key={`${item.ITEM_CODE}-${item.QUOTATION_REF_NO}-${item.SERIAL_NO}-${index}`}
                    className="hover:bg-gold-50/30 transition"
                  >
                    <TableCell className="font-medium text-center text-navy-700">
                      {item.SERIAL_NO}
                    </TableCell>
                    <TableCell className="font-medium text-navy-700 w-48">
                      {item.DESCRIPTION}
                    </TableCell>
                    <TableCell>{item.UOM}</TableCell>
                    <TableCell>
                      <div className="cursor-pointer text-right hover:bg-gold-100 p-2 rounded">
                        {editableItem.qty || item.QTY}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editableItem.rate ? (
                        <Input
                          value={editableItem.suggestedRate || ""}
                          onChange={(e) =>
                            updateEditableItemField(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "suggestedRate",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            saveItemFieldValue(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "rate"
                            )
                          }
                          className="h-6 w-full text-right p-0 border-gray-200 focus:ring-gold-300 focus:border-gold-500"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer text-right text-green-700 hover:bg-gold-100 p-1 rounded"
                          onClick={() =>
                            toggleItemFieldEditMode(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "rate"
                            )
                          }
                        >
                          {editableItem.suggestedRate ||
                            item.SUGGESTED_RATE ||
                            "0.00"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-orange-500 text-right">
                      {grossValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {editableItem.discount ? (
                        <Input
                          value={editableItem.discountValue}
                          onChange={(e) =>
                            updateEditableItemField(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "discountValue",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            saveItemFieldValue(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "discount"
                            )
                          }
                          className="h-6 w-full p-0 text-right border-gray-200 focus:ring-gold-300 focus:border-gold-500"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer flex items-end justify-end text-right hover:bg-gold-100 p-1 rounded"
                          onClick={() =>
                            toggleItemFieldEditMode(
                              item.ITEM_CODE,
                              item.QUOTATION_REF_NO,
                              item.SERIAL_NO,
                              "discount"
                            )
                          }
                        >
                          {discountAmount.toFixed(2) || "0.00"}{" "}
                          <span className="text-red-500">
                            {" "}
                            ({editableItem.discountValue || item.DISCOUNT}%)
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-medium text-right text-green-600">
                      {netValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={editableItem.offered ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-10 gap-2 rounded-full",
                          editableItem.offered
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                            : "border-gold-300 text-gold-700 hover:bg-gold-100"
                        )}
                        onClick={() => openItemOfferDialog(item)}
                      >
                        {editableItem.offered ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                        <span>
                          {editableItem.offered ? "Offered" : "Offer"}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    );
  };

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-gray-100">
        <Header />
        <div className="p-6">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-center py-12 shadow-xl rounded-2xl border border-gray-300/50"
          >
            <p className="text-lg text-navy-700">
              No quotation data found. Please go back and select a quotation.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const quotationSummary = items.reduce(
    (acc, item) => {
      const { grossValue, netValue, discountAmount } =
        calculateItemPricing(item);
      return {
        totalValue: acc.totalValue + grossValue,
        netValue: acc.netValue + netValue,
        discountAmount: acc.discountAmount + discountAmount,
      };
    },
    { totalValue: 0, netValue: 0, discountAmount: 0 }
  );

  const overallDiscountPercentage =
    quotationSummary.totalValue > 0
      ? (
          (quotationSummary.discountAmount / quotationSummary.totalValue) *
          100
        ).toFixed(2)
      : 0;

  // Update isExpanded based on quotationSummary.netValue
  useEffect(() => {
    setIsExpanded(quotationSummary.netValue > 0);
  }, [quotationSummary.netValue]);

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <div className="p-2.5 bg-slate-50">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
            <DialogContent className="max-w-md border border-gray-300/50 rounded-2xl shadow-2xl">
              {offerDialogItem && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-navy-800">
                      Edit Offer
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      {offerDialogItem.DESCRIPTION}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Attachment
                      </Label>
                      <div
                        className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center cursor-pointer transition-all hover:border-gold-300 hover:bg-gold-50/30"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add(
                            "border-gold-300",
                            "bg-gold-50/30"
                          );
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-gold-300",
                            "bg-gold-50/30"
                          );
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-gold-300",
                            "bg-gold-50/30"
                          );
                          if (
                            e.dataTransfer.files &&
                            e.dataTransfer.files.length > 0
                          ) {
                            handleFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf,text/*,.doc,.docx"
                          onChange={(e) =>
                            e.target.files && handleFile(e.target.files[0])
                          }
                        />
                        {uploadedFile ? (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                              <div className="flex items-center gap-3">
                                {uploadedFile.type.startsWith("image/") &&
                                uploadedFile.preview ? (
                                  <img
                                    src={uploadedFile.preview}
                                    alt={`${uploadedFile.name} Preview`}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <FileIcon className="w-6 h-6 text-gray-500" />
                                )}
                                <div className="overflow-hidden">
                                  <p className="text-sm text-navy-700 truncate">
                                    {uploadedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(uploadedFile.size / 1024).toFixed(1)} KB •{" "}
                                    {new Date(
                                      uploadedFile.lastModified
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                                onClick={removeFile}
                              >
                                <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <UploadCloud className="w-10 h-10 text-gray-400" />
                            <p className="font-medium text-navy-700">
                              Drag & drop a file here or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                              Supports images, PDFs, and documents
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Notes
                      </Label>
                      <Textarea
                        value={
                          editableItems[
                            `${offerDialogItem.ITEM_CODE}-${offerDialogItem.QUOTATION_REF_NO}-${offerDialogItem.SERIAL_NO}`
                          ]?.notes ||
                          offerDialogItem.NOTES ||
                          ""
                        }
                        onChange={(e) =>
                          updateEditableItemField(
                            offerDialogItem.ITEM_CODE,
                            offerDialogItem.QUOTATION_REF_NO,
                            offerDialogItem.SERIAL_NO,
                            "notes",
                            e.target.value
                          )
                        }
                        className="min-h-[100px] border-gray-200 focus:ring-gold-300 focus:border-gold-500"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                      <Button
                        variant="outline"
                        className="border-gold-300 text-gold-700 hover:bg-gold-100 rounded-full"
                        onClick={closeItemOfferDialog}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="text-white hover:from-gold-600 hover:to-gold-700 rounded-full shadow-md"
                        onClick={async () => {
                          const itemKey = `${offerDialogItem.ITEM_CODE}-${offerDialogItem.QUOTATION_REF_NO}-${offerDialogItem.SERIAL_NO}`;
                          setEditableItems((prev) => ({
                            ...prev,
                            [itemKey]: {
                              ...prev[itemKey],
                              offered: true,
                              attachment: uploadedFile,
                            },
                          }));
                          closeItemOfferDialog();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          <div className="grid lg:grid-cols-4 grid-cols-1 gap-1">
            <div className="flex flex-col gap-1">
              {/* --- Quotation Header Card --- */}
              <motion.div>
                <Card className="border bg-white border-gray-300/50 rounded-lg shadow-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="p-2 border-b border-gray-300/50 bg-gradient-to-r from-navy-50 to-gray-50">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-center gap-1">
                        <div className="p-2 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl shadow-sm">
                          <ClipboardList className="h-4 w-4 text-gold-600" />
                        </div>
                        <div className="flex flex-col truncate">
                          <CardTitle className="text-lg font-semibold">
                            Quotation Details
                          </CardTitle>
                        </div>
                      </div>
                      <Badge
                        variant={"outline"}
                        className="text-[0.7rem] font-medium truncate flex items-center gap-1"
                      >
                        Ref No - {quotation.QUOTATION_REF_NO}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 flex flex-col gap-2">
                    <Badge
                      variant={"secondary"}
                      className="text-xs py-1 text-orange-500 bg-orange-100 flex items-center gap-2"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Last Submission{" - "}
                      {convertServiceDate(quotation.EXPECTED_DATE)}
                    </Badge>

                    {quotation.EXPECTED_DATE && (
                      <div className="flex flex-col gap-1">
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1.05 }}
                          transition={{
                            repeat: 3,
                            repeatType: "reverse",
                            duration: 0.7,
                            ease: "easeInOut",
                          }}
                          whileHover={{ scale: 1 }}
                        >
                          <Badge
                            variant={"secondary"}
                            className={`text-xs flex items-center gap-2 ${
                              getExpirationStatus(
                                convertServiceDate(quotation.EXPECTED_DATE)
                              ).badgeClass
                            } relative transition-all duration-150`}
                          >
                            {
                              getExpirationStatus(
                                convertServiceDate(quotation.EXPECTED_DATE)
                              ).icon
                            }
                            {
                              getExpirationStatus(
                                convertServiceDate(quotation.EXPECTED_DATE)
                              ).daysText
                            }

                            {/* Animated notification dot */}
                            <motion.span
                              className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-current"
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: 3,
                                ease: "easeInOut",
                              }}
                            />
                          </Badge>
                        </motion.div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* --- Floating Total Amount Widget --- */}
              <motion.div
                className={`fixed bottom-4 right-4 z-50 flex items-center justify-center ${
                  isExpanded ? "justify-between gap-3 w-[280px]" : "w-12"
                } bg-gradient-to-r from-green-500 to-teal-500 rounded-full px-5 py-2 shadow-lg text-sm font-semibold text-white transition-all duration-300`}
                initial={{ width: isExpanded ? 280 : 48 }}
                animate={{ width: isExpanded ? 280 : 48 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  {isExpanded && <span>Total Amount</span>}
                </div>
                {isExpanded && (
                  <span className="text-lg font-bold">
                    {quotationSummary.netValue.toFixed(2)} {userData?.companyCurrSymbol}
                  </span>
                )}
              </motion.div>

              {/* --- Vendor Details Card --- */}
              <motion.div>
                <Card className="border bg-white border-gray-300/50 rounded-lg shadow-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="p-2 bg-gradient-to-r from-navy-50 to-gray-50 border-b border-gray-300/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl shadow-sm">
                        <User className="h-4 w-4 text-gold-600" />
                      </div>
                      <div className="truncate">
                        <CardTitle className="text-xl font-semibold">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-blue-500 text-ellipsis">
                            {quotation.SELECTED_VENDOR_NAME}{" "}
                          </span>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 grid lg:grid-cols-2 grid-cols-1 gap-2">
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-gold-600" />
                        <span className="truncate">
                          {" "}
                          Supplier Quotation No{" "}
                        </span>
                      </Label>
                      <Input
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={supplierDetails.quotationNo}
                        onChange={(e) =>
                          handleSupplierDetailsUpdate(
                            "quotationNo",
                            e.target.value
                          )
                        }
                        placeholder="QUT-2024-001"
                      />
                    </div>
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gold-600" />
                        Quotation Date
                      </Label>
                      <Input
                        type="date"
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={supplierDetails.quotationDate}
                        onChange={(e) =>
                          handleSupplierDetailsUpdate(
                            "quotationDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gold-600" />
                        Offer Valid Till
                      </Label>
                      <Input
                        type="date"
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={supplierDetails.offerValidTill}
                        onChange={(e) =>
                          handleSupplierDetailsUpdate(
                            "offerValidTill",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <BadgePercent className="h-4 w-4 text-gold-600" />
                        Credit Days
                      </Label>
                      <Input
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={terms.payments}
                        onChange={(e) =>
                          handlePaymentTermsUpdate("payments", e.target.value)
                        }
                        placeholder="No. of payments"
                      />
                    </div>
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <BadgePercent className="h-4 w-4 text-gold-600" />
                        Payment Terms
                      </Label>
                      <Input
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={terms.creditDays}
                        onChange={(e) =>
                          handlePaymentTermsUpdate("creditDays", e.target.value)
                        }
                        placeholder="Credit days"
                      />
                    </div>
                    <div className="space-y-2 mb-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <Package className="h-4 w-4 text-gold-600" />
                        Delivery
                      </Label>
                      <Input
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={terms.deliveryDays}
                        onChange={(e) =>
                          handlePaymentTermsUpdate(
                            "deliveryDays",
                            e.target.value
                          )
                        }
                        placeholder="Delivery in days"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-gold-600" />
                        Submitted By
                      </Label>
                      <Input
                        className="h-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 transition-all rounded-lg"
                        value={supplierDetails.submittedBy}
                        onChange={(e) =>
                          handleSupplierDetailsUpdate(
                            "submittedBy",
                            e.target.value
                          )
                        }
                        placeholder="John Doe"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            {/* --- Items List --- */}
            <motion.div className="md:col-span-3 col-span-2 overflow-y-auto max-h-[500px]">
              <div className="flex flex-col">
                <CardHeader className="p-2 border bg-white border-gray-300/50 rounded-lg">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-semibold">
                        Items List
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search items..."
                          className="h-8 pl-10 border-gray-200 focus:ring-gold-300 focus:border-gold-500 rounded-full"
                          value={itemSearch}
                          onChange={(e) => setItemSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                      <Badge
                        variant={"outline"}
                        size={"xs"}
                        className="bg-slate-300 text-xs rounded-full"
                      >
                        {items.length} items found
                      </Badge>
                      <Badge
                        variant={"outline"}
                        size={"xs"}
                        className="bg-green-600 text-xs text-green-100 rounded-full"
                      >
                        {userData.companyCurrName +
                          " " +
                          userData.companyCurrSymbol}
                      </Badge>
                      <div className="flex">
                        <Button
                          variant={viewMode === "cards" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 rounded-r-none rounded-l-full",
                            viewMode === "cards"
                              ? "text-white hover:from-gold-600 hover:to-gold-700 shadow-md"
                              : "border-gold-300 text-gold-700 hover:bg-gold-100"
                          )}
                          onClick={() => setViewMode("cards")}
                        >
                          Cards
                        </Button>
                        <Button
                          variant={viewMode === "table" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 rounded-l-none rounded-r-full",
                            viewMode === "table"
                              ? "text-white hover:from-gold-600 hover:to-gold-700 shadow-md"
                              : "border-gold-300 text-gold-700 hover:bg-gold-100"
                          )}
                          onClick={() => setViewMode("table")}
                        >
                          Table
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                  <AnimatePresence mode="wait">
                    {viewMode === "cards" ? (
                      <motion.div
                        key="cards"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="grid grid-cols-1 gap-1"
                      >
                        <div className="relative flex-1 overflow-x-auto">
                          {renderItemCardsView(items)}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="table"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="rounded-lg border border-gray-300/50 shadow-sm"
                      >
                        {renderItemsTableView(items)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
                <div className="grid grid-cols-1 gap-1 p-1 md:grid-cols-3">
                  <motion.div className="col-span-2">
                    <Card className="bg-gradient-to-r from-navy-50 to-gray-50 border border-gray-300/50 rounded-2xl shadow-sm hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-800">
                          <FileEdit className="h-5 w-5 text-gold-600" />
                          Additional Notes
                        </h3>
                        <Textarea
                          placeholder="Enter any additional terms or conditions..."
                          className="min-h-[150px] border-gray-200 focus:ring-gold-300 focus:border-gold-500 rounded-lg"
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div>
                    <Card className="border border-gray-300/50 rounded-2xl shadow-sm hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-800">
                          <BadgePercent className="h-5 w-5 text-gold-600" />
                          Pricing Summary
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Value</span>
                            <span className="font-medium text-orange-400">
                              {quotationSummary.totalValue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Total Discount
                            </span>
                            <span className="font-medium text-red-600">
                              {quotationSummary.discountAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Discount Percentage
                            </span>
                            <span className="font-medium text-green-700">
                              {overallDiscountPercentage}%
                            </span>
                          </div>
                          <div className="my-3 border-t border-gray-300/50"></div>
                          <div className="flex justify-between text-lg font-semibold">
                            <span className="text-navy-800">Total Amount</span>
                            <span className="text-green-800">
                              {quotationSummary.netValue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <CardFooter className="flex sm:flex-row flex-col justify-between border rounded-lg border-gray-300/50 bg-white p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gold-600 hover:bg-gold-50 rounded-full"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    Help
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gold-300 text-gold-700 hover:bg-gold-100 rounded-full"
                    >
                      Save Draft
                    </Button>

                    <Button
                      size="sm"
                      className="text-white hover:from-gold-600 hover:to-gold-700 rounded-full shadow-md"
                      onClick={submitSupplierQuotation}
                      disabled={
                        getExpirationStatus(
                          convertServiceDate(quotation.EXPECTED_DATE)
                        ).status === "Expired" || !items.length
                      }
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Submit Quotation
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RfqDetailsPage;