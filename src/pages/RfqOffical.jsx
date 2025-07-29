import { callSoapService } from "@/api/callSoapService";
import Header from "@/components/rfqPortal/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Box,
  CalendarDays,
  Clock,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { convertServiceDate } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import getExpirationStatus from "@/utils/rfqportalUtils";

function RfqOffical() {
  const [quotation, setQuotation] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchQuotations();
    } else {
      setQuotation([]); // Clear quotations if no supplier is selected
    }
  }, [selectedSupplier]);

  const groupQuotations = (quotations) => {
    if (!quotations || !Array.isArray(quotations)) return [];

    const grouped = {};
    quotations.forEach((quote) => {
      const refNo = quote.QUOTATION_REF_NO;
      if (!grouped[refNo]) {
        grouped[refNo] = {
          ...quote,
          items: [{ ...quote, SERIAL_NO: quote.SERIAL_NO || "" }],
          itemCount: 1,
        };
      } else {
        grouped[refNo].items.push({
          ...quote,
          SERIAL_NO: quote.SERIAL_NO || "",
        });
        grouped[refNo].itemCount++;
      }
    });
    return Object.values(grouped);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const payload = {
        DataModelName: "VENDOR_MASTER",
        WhereCondition: "",
        Orderby: "",
      };
      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );
      console.log("Suppliers response:", response); // Debug log
      if (response && Array.isArray(response)) {
        setSupplier(response);
      } else {
        setSupplier([]);
        toast({
          variant: "destructive",
          title: "No suppliers found",
          description: "The server returned no supplier data.",
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch suppliers",
        description:
          error.message || "An error occurred while fetching suppliers.",
      });
      setSupplier([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSupplier = (supplierName) => {
    const foundSupplier = supplier.find((s) => s.VENDOR_NAME === supplierName);
    if (foundSupplier) {
      console.log("Selected supplier:", foundSupplier); // Debug log
      setSelectedSupplier(foundSupplier);
    } else {
      console.warn("No supplier found for:", supplierName);
      setSelectedSupplier(null);
    }
    setOpenSupplier(false);
    setSearchSupplier(""); // Reset search input
  };

  const fetchQuotations = async () => {
    if (!selectedSupplier?.VENDOR_ID) {
      console.warn("No VENDOR_ID provided for fetching quotations");
      setQuotation([]);
      return;
    }

    try {
      setLoading(true);
      const vendorId = String(selectedSupplier.VENDOR_ID).trim(); // Ensure no extra spaces
      const payload = {
        DataModelName: "INVT_PURCHASE_QUOTMASTER",
        WhereCondition: `SELECTED_VENDOR = '${vendorId}'`,
        Orderby: "",
      };
      console.log("Quotation fetch payload:", payload); // Debug log
      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );
      console.log("Quotations response:", response); // Debug log

      if (response && Array.isArray(response) && response.length > 0) {
        const groupedQuotations = groupQuotations(response);
        console.log("Grouped quotations:", groupedQuotations); // Debug log
        setQuotation(groupedQuotations);
      } else {
        setQuotation([]);
        toast({
          variant: "warning",
          title: "No quotations found",
          description: `No quotations found for supplier ${selectedSupplier.VENDOR_NAME} (ID: ${vendorId}).`,
        });
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch quotations",
        description:
          error.message || "An error occurred while fetching quotations.",
      });
      setQuotation([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-1">
        <div className="flex flex-col gap-2 mt-2">
          <Label>Select Supplier</Label>
          <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSupplier}
                className="w-[400px] justify-between"
                disabled={loading}
              >
                {selectedSupplier
                  ? `${selectedSupplier.VENDOR_NAME} (${selectedSupplier.VENDOR_ID})`
                  : "Select Supplier..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput
                  value={searchSupplier}
                  onValueChange={setSearchSupplier}
                  placeholder="Search Supplier..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No supplier found.</CommandEmpty>
                  <CommandGroup>
                    {supplier
                      .filter(
                        (suppliers) =>
                          suppliers.VENDOR_NAME.toLowerCase().includes(
                            searchSupplier.toLowerCase()
                          ) ||
                          String(suppliers.VENDOR_ID || "")
                            .toLowerCase()
                            .includes(searchSupplier.toLowerCase())
                      )
                      .map((suppliers) => (
                        <CommandItem
                          key={suppliers.VENDOR_ID}
                          value={suppliers.VENDOR_NAME}
                          onSelect={(currentValue) => {
                            handleSelectSupplier(currentValue);
                          }}
                        >
                          {suppliers.VENDOR_NAME} ({suppliers.VENDOR_ID})
                          <Check
                            className={cn(
                              "ml-auto",
                              selectedSupplier?.VENDOR_ID ===
                                suppliers.VENDOR_ID
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {loading && <div className="mt-4">Loading...</div>}

        {quotation.length > 0 ? (
          <div className="mt-2 space-y-1 p-2">
            {quotation.map((quoteGroup) => (
              <div
                key={quoteGroup.QUOTATION_REF_NO}
                className="group px-4 py-3 rounded-xl hover:no-underline bg-gradient-to-r from-indigo-100 via-blue-100 to-white rounded-t-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() =>
                  navigate(`/rfq-details/${quoteGroup.QUOTATION_REF_NO}`, {
                    state: {
                      quotation: quoteGroup,
                      supplier: selectedSupplier,
                      items: quoteGroup.items.map((item) => ({
                        ...item,
                        SERIAL_NO: item.SERIAL_NO || "",
                      })),
                    },
                  })
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs bg-gray-100 text-gray-800 font-medium px-2.5 py-1 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Ref No: {quoteGroup.QUOTATION_REF_NO}
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      Ref Date:{" "}
                      {convertServiceDate(quoteGroup.QUOTATION_REF_DATE)}
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Last Sub Date:{" "}
                      {convertServiceDate(quoteGroup.EXPECTED_DATE)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-700">
                    <div className="flex items-center gap-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                      <Box className="h-4 w-4 text-gray-500" />
                      Items: {quoteGroup.itemCount}
                    </div>
                    <div
                      className={`flex items-center gap-2  text-xs font-medium px-2.5 py-1 rounded ${
                        getExpirationStatus(
                          convertServiceDate(quoteGroup.EXPECTED_DATE)
                        ).badgeClass
                      }`}
                    >
                      {
                        getExpirationStatus(
                          convertServiceDate(quoteGroup.EXPECTED_DATE)
                        ).icon
                      }
                      {
                        getExpirationStatus(
                          convertServiceDate(quoteGroup.EXPECTED_DATE)
                        ).status
                      }
                    </div>

                    <div className="flex justify-end">
                      <button className="flex items-center text-sm font-medium bg-gradient-to-br rounded-sm px-2 py-1 from-purple-500 via-blue-500 to-cyan-500 text-white hover:text-gray-100 transition">
                        {
                          getExpirationStatus(
                            convertServiceDate(quoteGroup.EXPECTED_DATE)
                          ).daysText
                        }
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          selectedSupplier && (
            <div className="mt-4 text-muted-foreground">
              No quotations found for supplier {selectedSupplier.VENDOR_NAME}{" "}
              (ID: {selectedSupplier.VENDOR_ID}).
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default RfqOffical;
