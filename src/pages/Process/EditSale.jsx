// EditSale.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";
import ProductSelector from "../../components/Sale/ProductSelector";
import InventoryData from "../../components/Sale/InventoryData";
import AsyncSelect from "react-select/async";
import { v4 as uuidv4 } from "uuid";
import { saleService } from "../../services/saleService";

function EditSale() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(true);
  const [defaultStore, setDefaultStore] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [errors, setErrors] = useState({});
  const [inventoryPairs, setInventoryPairs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [formData, setFormData] = useState({
    flatDiscount: "0",
    deliveryCharges: "0",
    otherCharges: "0",
    note: "",
  });
  const [payments, setPayments] = useState([
    {
      method: null,
      amount: "",
      date: null,
      reference: "",
    },
  ]);
  const recallOptions = [
    { value: "3 month", label: "3 month" },
    { value: "6 month", label: "6 month" },
    { value: "9 month", label: "9 month" },
    { value: "12 month", label: "12 month" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.stores && user.stores.length > 0) {
      const storeId = user.stores[0];
      setDefaultStore({ value: storeId, label: storeId });
    } else {
      console.error("No store found in localStorage user data");
      toast.error("No store found in user data");
    }
  }, []);

  const loadRecallOptions = (inputValue, callback) => {
    const filtered = recallOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filtered);
  };

  const handleAddProduct = async (selectedProduct) => {
    if (
      !selectedProduct ||
      !selectedProduct.value ||
      !defaultStore ||
      !defaultStore.value
    ) {
      console.warn("Selected product or default store is missing.");
      toast.error("Please select a product and ensure a store is selected.");
      return;
    }

    const productDetails = await fetchInventoryDetails(
      selectedProduct.value,
      defaultStore.value
    );
    if (productDetails) {
      const pairId = uuidv4();
      const groupId = uuidv4();

      setInventoryData((prev) => [
        ...prev,
        {
          type: "product",
          data: productDetails,
          pairId,
          groupId,
          quantity: 1,
          taxAmount: 0,
          discount: 0,
          totalAmount: parseFloat(productDetails.sellPrice) || 0,
        },
        { type: "lensDropdown", pairId, groupId },
      ]);

      const newPair = {
        pairId,
        groupId,
        product: {
          item: productDetails._id,
          unit: productDetails.unit?.name || "Pieces",
          displayName: productDetails.productName,
          barcode: productDetails.oldBarcode,
          sku: productDetails.sku,
          mrp: parseFloat(productDetails.MRP) || 0,
          srp: parseFloat(productDetails.sellPrice) || 0,
          perPieceDiscount: 0,
          taxRate: `${productDetails.tax || 0} (Inc)`,
          perPieceTax: 0,
          perPieceAmount: parseFloat(productDetails.sellPrice) || 0,
          inclusiveTax: productDetails.inclusiveTax ?? true,
          manageStock: productDetails.manageStock ?? true,
          incentiveAmount: productDetails.incentiveAmount || 0,
        },
        rightLens: null,
        leftLens: null,
      };
      setInventoryPairs((prev) => [...prev, newPair]);
    } else {
      toast.error("Failed to fetch product details or product out of stock.");
    }
  };

  const fetchInventoryDetails = async (prodID, storeID) => {
    try {
      const response = await saleService.checkInventory(prodID, storeID);
      if (response.success) {
        const newItem = response?.data?.data?.docs?.[0];
        if (newItem) {
          return newItem.product;
        }
        if (response.data.data.docs.length === 0) {
          toast.error("Product out of stock");
          return null;
        }
      } else {
        console.error(response.data.message);
        toast.error(response.data.message || "Error fetching inventory");
        return null;
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Error fetching inventory");
      return null;
    }
  };

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let taxAmount = 0;
    let totalDiscount = 0;
    let flatDiscount = Number(formData.flatDiscount) || 0;
    let couponDiscount = Number(formData.couponDiscount) || 0;
    let otherCharges = Number(formData.otherCharges) || 0;

    inventoryData.forEach((item) => {
      if (item.type !== "lensDropdown" && item.data) {
        totalQuantity += item.quantity || 1;
        totalAmount += item.totalAmount || 0;
        taxAmount += item.taxAmount || 0;
        totalDiscount += item.discount || 0;
      }
    });

    totalDiscount += flatDiscount + couponDiscount;
    const netAmount =
      totalAmount - flatDiscount + otherCharges - couponDiscount;

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalAmount,
      totalTax: taxAmount,
      netDiscount: totalDiscount,
      netAmount,
    }));

    // Update saleData to reflect totals
    setSaleData((prev) => ({
      ...prev,
      totalQuantity,
      totalAmount,
      totalTax: taxAmount,
      totalDiscount,
      netDiscount: totalDiscount,
      netAmount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [
    inventoryData,
    formData.flatDiscount,
    formData.otherCharges,
    formData.couponDiscount,
  ]);

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      try {
        const response = await shopProcessService.getSaleById(id);
        if (response.success && response.data.data.docs.length > 0) {
          const sale = response.data.data.docs[0];
          setSaleData(sale);
          setFormData({
            flatDiscount: sale.flatDiscount?.toString() || "0",
            deliveryCharges: sale.deliveryCharges?.toString() || "0",
            otherCharges: sale.otherCharges?.toString() || "0",
            note: sale.note || "",
            recallOption: sale.recallOption || "",
            recallDate: sale.recallDate || "",
          });

          if (sale.receivedAmount?.length > 0) {
            setPayments(
              sale.receivedAmount.map((payment) => ({
                method:
                  methodoptions.find((opt) => opt.value === payment.method) ||
                  null,
                amount: payment.amount?.toString() || "",
                date: payment.date ? new Date(payment.date) : null,
                reference: payment.reference || "",
              }))
            );
          }

          const newInventoryData = [];
          const newInventoryPairs = [];
          sale.orders.forEach((order, index) => {
            const pairId = `pair-${index}-${order._id}`;
            const groupId = pairId;

            if (order.product) {
              newInventoryData.push({
                type: "product",
                data: {
                  _id: order.product.item,
                  oldBarcode: order.product.barcode,
                  sku: order.product.sku,
                  productName: order.product.displayName,
                  MRP: order.product.mrp,
                  sellPrice: order.product.perPieceAmount,
                  tax: parseFloat(order.product.taxRate) || 0,
                  photos: [],
                  manageStock: order.product.manageStock,
                  inclusiveTax: order.product.inclusiveTax,
                  incentiveAmount: order.product.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.product.perPieceTax,
                discount: order.product.perPieceDiscount,
                totalAmount: order.product.perPieceAmount,
                pairId,
                groupId,
              });
            }

            if (order.rightLens) {
              newInventoryData.push({
                type: "rightLens",
                data: {
                  _id: order.rightLens.item,
                  oldBarcode: order.rightLens.barcode,
                  sku: order.rightLens.sku,
                  productName: order.rightLens.displayName,
                  MRP: order.rightLens.mrp,
                  sellPrice: order.rightLens.perPieceAmount,
                  tax: parseFloat(order.rightLens.taxRate) || 0,
                  photos: [],
                  manageStock: order.rightLens.manageStock,
                  inclusiveTax: order.rightLens.inclusiveTax,
                  incentiveAmount: order.rightLens.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.rightLens.perPieceTax,
                discount: order.rightLens.perPieceDiscount,
                totalAmount: order.rightLens.perPieceAmount,
                pairId,
                groupId,
              });
            }

            if (order.leftLens) {
              newInventoryData.push({
                type: "leftLens",
                data: {
                  _id: order.leftLens.item,
                  oldBarcode: order.leftLens.barcode,
                  sku: order.leftLens.sku,
                  productName: order.leftLens.displayName,
                  MRP: order.leftLens.mrp,
                  sellPrice: order.leftLens.perPieceAmount,
                  tax: parseFloat(order.leftLens.taxRate) || 0,
                  photos: [],
                  manageStock: order.leftLens.manageStock,
                  inclusiveTax: order.leftLens.inclusiveTax,
                  incentiveAmount: order.leftLens.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.leftLens.perPieceTax,
                discount: order.leftLens.perPieceDiscount,
                totalAmount: order.leftLens.perPieceAmount,
                pairId,
                groupId,
              });
            }

            newInventoryData.push({
              type: "lensDropdown",
              pairId,
              groupId,
            });

            newInventoryPairs.push({
              pairId,
              groupId,
              product: order.product || null,
              rightLens: order.rightLens || null,
              leftLens: order.leftLens || null,
            });
          });
          setInventoryData(newInventoryData);
          setInventoryPairs(newInventoryPairs);
        } else {
          toast.error(response.message || "Sale not found");
        }
      } catch (error) {
        toast.error("Failed to fetch sale data");
        console.error("getSaleById API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  const methodoptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
  ];

  const handleProductsSelected = (selectedProducts) => {
    const newOrders = selectedProducts.map((product, index) => {
      const pairId = `pair-new-${Date.now()}-${index}`;
      const groupId = pairId;
      return {
        product: {
          item: product._id,
          unit: product.unit?._id || "Pieces",
          displayName: product.productName,
          barcode: product.newBarcode || product.oldBarcode,
          sku: product.sku,
          mrp: product.MRP,
          srp: product.sellPrice || product.MRP,
          perPieceDiscount: product.discount || 0,
          taxRate: `${product.tax || 0} (Inc)`,
          perPieceTax:
            ((product.sellPrice || product.MRP) * (product.tax || 0)) /
            (100 + (product.tax || 0)),
          perPieceAmount: product.sellPrice || product.MRP,
          inclusiveTax: product.inclusiveTax ?? true,
          manageStock: product.manageStock ?? true,
          incentiveAmount: product.incentiveAmount || 0,
        },
        pairId,
        groupId,
      };
    });

    setSaleData((prev) => ({
      ...prev,
      orders: [...(prev.orders || []), ...newOrders],
      totalQuantity: (prev.totalQuantity || 0) + newOrders.length,
      totalAmount:
        (prev.totalAmount || 0) +
        newOrders.reduce(
          (sum, order) => sum + (order.product.perPieceAmount || 0),
          0
        ),
      totalTax:
        (prev.totalTax || 0) +
        newOrders.reduce(
          (sum, order) => sum + (order.product.perPieceTax || 0),
          0
        ),
      netAmount:
        (prev.netAmount || 0) +
        newOrders.reduce(
          (sum, order) =>
            sum +
            (order.product.perPieceAmount || 0) +
            (order.product.perPieceTax || 0),
          0
        ),
    }));

    const newInventoryData = newOrders.map((order) => ({
      type: "product",
      data: {
        _id: order.product.item,
        oldBarcode: order.product.barcode,
        sku: order.product.sku,
        productName: order.product.displayName,
        MRP: order.product.mrp,
        sellPrice: order.product.perPieceAmount,
        tax: parseFloat(order.product.taxRate) || 0,
        photos: [],
        manageStock: order.product.manageStock,
        inclusiveTax: order.product.inclusiveTax,
        incentiveAmount: order.product.incentiveAmount,
      },
      quantity: 1,
      taxAmount: order.product.perPieceTax,
      discount: order.product.perPieceDiscount,
      totalAmount: order.product.perPieceAmount,
      pairId: order.pairId,
      groupId: order.groupId,
    }));

    setInventoryData((prev) => [
      ...prev,
      ...newInventoryData,
      ...newOrders.map((order) => ({
        type: "lensDropdown",
        pairId: order.pairId,
        groupId: order.groupId,
      })),
    ]);

    setInventoryPairs((prev) => [
      ...prev,
      ...newOrders.map((order) => ({
        pairId: order.pairId,
        groupId: order.groupId,
        product: order.product,
        rightLens: null,
        leftLens: null,
      })),
    ]);

    setShowProductSelector(false);
  };

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      {
        method: null,
        amount: "",
        date: null,
        reference: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedPayments = [...payments];
    updatedPayments[index][field] = value;
    setPayments(updatedPayments);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const validPayments = payments
      .filter(
        (payment) =>
          payment.method &&
          payment.amount &&
          !isNaN(payment.amount) &&
          parseFloat(payment.amount) > 0
      )
      .map((payment) => ({
        method: payment.method.value,
        amount: parseFloat(payment.amount),
        date: payment.date ? payment.date.toISOString() : null,
        reference: payment.reference || "",
      }));

    console.log("inventoryData:", inventoryData);
    console.log("inventoryPairs:", inventoryPairs);

    // Construct orders from inventoryData and inventoryPairs
    const updatedOrders = inventoryPairs
      .map((pair, index) => {
        // Use groupId if available, otherwise fallback to pairId
        const groupId = pair.groupId || pair.pairId;

        // Find corresponding inventoryData items for the pair
        const groupItems = inventoryData
          ? inventoryData.filter((item) => item.groupId === groupId)
          : [];

        let product = null;
        let rightLens = null;
        let leftLens = null;

        // Log for debugging
        console.log(`Processing pair ${index}:`, { groupId, groupItems });

        // Check for multiple rightLens or leftLens items
        const rightLensItems = groupItems.filter(
          (item) => item.type === "rightLens"
        );
        const leftLensItems = groupItems.filter(
          (item) => item.type === "leftLens"
        );
        if (rightLensItems.length > 1) {
          console.warn(
            `Multiple rightLens items found for groupId: ${groupId}`
          );
        }
        if (leftLensItems.length > 1) {
          console.warn(`Multiple leftLens items found for groupId: ${groupId}`);
        }

        // Helper function to create lens or product object
        const createItem = (source, itemType, inventoryItem = null) => {
          if (!source) return null;
          const data = inventoryItem?.data || source; // Fallback to source if no inventory data
          return {
            item: data._id || source.item,
            unit: data.unit?.name || source.unit || "Pieces",
            displayName: data.productName || source.displayName || "",
            barcode: data.oldBarcode || data.newBarcode || source.barcode || "",
            sku: data.sku || source.sku || "",
            mrp: parseFloat(data.MRP || source.mrp) || 0,
            srp: parseFloat(data.sellPrice || source.srp) || 0,
            perPieceDiscount:
              inventoryItem?.discount ||
              source.perPieceDiscount ||
              data.discount ||
              0,
            taxRate: `${data.tax || source.taxRate || 0} (Inc)`,
            perPieceTax: inventoryItem?.taxAmount || source.perPieceTax || 0,
            perPieceAmount:
              inventoryItem?.totalAmount ||
              source.perPieceAmount ||
              data.sellPrice ||
              0,
            inclusiveTax: data.inclusiveTax ?? source.inclusiveTax ?? true,
            manageStock:
              data.manageStock ??
              source.manageStock ??
              (itemType === "product" ? true : false),
            incentiveAmount:
              data.incentiveAmount || source.incentiveAmount || 0,
          };
        };

        // Update product details
        const productItem = groupItems.find((item) => item.type === "product");
        if (productItem) {
          product = createItem(pair.product, "product", productItem);
        } else if (pair.product) {
          // Fallback to pair.product if no inventoryData match
          product = createItem(pair.product, "product");
        }

        // Update rightLens details
        const rightLensItem = rightLensItems[0];
        if (rightLensItem) {
          rightLens = createItem(pair.rightLens, "rightLens", rightLensItem);
        } else if (pair.rightLens) {
          // Fallback to pair.rightLens if no inventoryData match
          rightLens = createItem(pair.rightLens, "rightLens");
        }

        // Update leftLens details
        const leftLensItem = leftLensItems[0];
        if (leftLensItem) {
          leftLens = createItem(pair.leftLens, "leftLens", leftLensItem);
        } else if (pair.leftLens) {
          // Fallback to pair.leftLens if no inventoryData match
          leftLens = createItem(pair.leftLens, "leftLens");
        }

        // Validate lens pairs (warn but don’t skip)
        if ((rightLens && !leftLens) || (!rightLens && leftLens)) {
          console.warn(
            `Incomplete lens pair for groupId: ${groupId}. RightLens: ${
              rightLens ? "present" : "missing"
            }, LeftLens: ${leftLens ? "present" : "missing"}`
          );
        }

        // Only include orders with at least one item
        if (product || rightLens || leftLens) {
          const pairIdParts = pair.pairId.split("-");
          const orderId =
            pairIdParts.length === 3 && !pair.pairId.includes("pair-new-")
              ? pairIdParts[2]
              : undefined;

          return {
            _id: orderId,
            product,
            rightLens,
            leftLens,
            store: saleData?.store?._id,
            status: "pending",
            attachments: [],
            sale: id,
            billNumber: saleData?.saleNumber?.toString(),
          };
        }

        console.warn(`No valid items for pair ${index} (groupId: ${groupId})`);
        return null;
      })
      .filter((order) => order !== null);

    console.log("updatedOrders:", updatedOrders);

    // Calculate totals for payload
    const totalQuantity = formData.totalQuantity || 0;
    const totalAmount = formData.totalAmount || 0;
    const totalTax = formData.totalTax || 0;
    const flatDiscount = parseFloat(formData.flatDiscount) || 0;
    const couponDiscount = parseFloat(formData.couponDiscount) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const deliveryCharges = parseFloat(formData.deliveryCharges) || 0;
    const totalDiscount =
      (formData.netDiscount || 0) - flatDiscount - couponDiscount;
    const netDiscount = formData.netDiscount || 0;
    const netAmount = formData.netAmount || 0;

    const payload = {
      _id: id,
      store: saleData?.store?._id || null,
      customerName: saleData?.customerName || null,
      customerPhone: saleData?.customerPhone || null,
      customerId: saleData?.customerId || null,
      totalDiscount,
      flatDiscount,
      netDiscount,
      totalAmount,
      totalTax,
      otherCharges,
      deliveryCharges,
      netAmount,
      totalQuantity,
      salesRep: saleData?.salesRep?._id || null,
      orders: updatedOrders,
      receivedAmount: validPayments,
      createdAt: saleData?.createdAt || null,
      updatedAt: new Date().toISOString(),
      saleNumber: saleData?.saleNumber || 0,
      powerAtTime: saleData?.powerAtTime || {},
      note: formData.note || null,
      recallOption: formData.recallOption || null,
      recallDate: formData.recallDate || null,
      __v: saleData?.__v || 0,
    };

    try {
      const response = await shopProcessService.updateSale(id, payload);
      if (response.success) {
        toast.success("Sale updated successfully");
        setSaleData((prev) => ({
          ...prev,
          ...payload,
          ...(response.data.data ? response.data.data : {}),
        }));
        setFormData({
          flatDiscount: payload.flatDiscount.toString(),
          deliveryCharges: payload.deliveryCharges.toString(),
          otherCharges: payload.otherCharges.toString(),
          note: payload.note || "",
          recallOption: payload.recallOption || "",
          recallDate: payload.recallDate || "",
        });
        navigate("/process/shop");
      } else {
        toast.error(response.message || "Failed to update sale");
      }
    } catch (error) {
      toast.error("Error updating sale");
      console.error("updateSale API Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    );
  }

  if (!saleData) {
    return <div>No sale data found.</div>;
  }

  return (
    <div className="mt-4 px-3">
      <form onSubmit={handleSubmit}>
        <div className="col-12 small">
          <label htmlFor="name" className="form-label mb-1 fw-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={saleData?.customerName || ""}
            disabled
          />
        </div>
        <div className="col-12 mt-3 small">
          <label htmlFor="phone" className="form-label mb-1 fw-semibold">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            className="form-control"
            value={saleData?.customerPhone || ""}
            disabled
          />
        </div>

        <div className="row">
          <div className="col-md-6 col-12">
            <ProductSelector
              showProductSelector={showProductSelector}
              defaultStore={defaultStore}
              setInventoryData={setInventoryData}
              setShowProductSelector={setShowProductSelector}
              setInventoryPairs={setInventoryPairs}
            />
            {!showProductSelector && (
              <button
                type="button"
                className="btn btn-sm btn-primary my-2 w-25"
                onClick={() => setShowProductSelector(true)}
              >
                Add Another Pair
              </button>
            )}
          </div>

          <div className="col-md-6 col-12">
            <label htmlFor="recallOption" className="custom-label">
              Recall Date <span className="text-danger">*</span>
            </label>
            {formData.recallOption !== "other" ? (
              <AsyncSelect
                cacheOptions
                defaultOptions={recallOptions}
                loadOptions={loadRecallOptions}
                value={
                  recallOptions.find(
                    (opt) => opt.value === formData.recallOption
                  ) || null
                }
                onChange={(selected) => {
                  setFormData({
                    ...formData,
                    recallOption: selected ? selected.value : "",
                    recallDate: "",
                  });
                  if (errors.recallOption || errors.recallDate) {
                    setErrors({
                      ...errors,
                      recallOption: "",
                      recallDate: "",
                    });
                  }
                }}
                placeholder="Select..."
                className={errors.recallOption ? "is-invalid" : ""}
              />
            ) : (
              <DatePicker
                selected={
                  formData.recallDate ? new Date(formData.recallDate) : null
                }
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    recallDate: date ? date.toISOString().split("T")[0] : "",
                  });
                  if (errors.recallDate) {
                    setErrors({ ...errors, recallDate: "" });
                  }
                }}
                className={`form-control ${
                  errors.recallDate ? "is-invalid" : ""
                }`}
                placeholderText="Select date"
                dateFormat="yyyy-MM-dd"
                required
              />
            )}
            {errors.recallOption && (
              <div className="invalid-feedback">{errors.recallOption}</div>
            )}
            {errors.recallDate && (
              <div className="invalid-feedback">{errors.recallDate}</div>
            )}
          </div>
        </div>

        <InventoryData
          inventoryData={inventoryData}
          setInventoryData={setInventoryData}
          inventoryPairs={inventoryPairs}
          setInventoryPairs={setInventoryPairs}
        />

        <div className="row g-3 mt-4">
          {[
            {
              label: "Total Quantity",
              id: "TotalQuantity",
              value: formData.totalQuantity || "0",
              disabled: true,
            },
            {
              label: "Total Amount",
              id: "TotalAmount",
              value: formData.totalAmount || "0",
              disabled: true,
            },
            {
              label: "Total Tax",
              id: "TotalTax",
              value: formData.totalTax || "0",
              disabled: true,
            },
            {
              label: "Total Discount",
              id: "TotalDiscount",
              value: formData.netDiscount || "0",
              disabled: true,
            },
            {
              label: "Coupon Discount",
              id: "CouponDiscount",
              value: formData.couponDiscount || "0",
              disabled: true,
            },
            {
              label: "Flat Discount",
              id: "FlatDiscount",
              value: formData.flatDiscount,
              disabled: false,
              onChange: (e) => handleFormChange("flatDiscount", e.target.value),
            },
            {
              label: "Net Discount",
              id: "NetDiscount",
              value: formData.netDiscount || "0",
              disabled: true,
            },
            {
              label: "Delivery Charges",
              id: "DeliveryCharges",
              value: formData.deliveryCharges,
              disabled: false,
              onChange: (e) =>
                handleFormChange("deliveryCharges", e.target.value),
            },
            {
              label: "Other Charges",
              id: "OtherCharges",
              value: formData.otherCharges,
              disabled: false,
              onChange: (e) => handleFormChange("otherCharges", e.target.value),
            },
            {
              label: "Net Amount",
              id: "NetAmount",
              value: formData.netAmount || "0",
              disabled: true,
            },
          ].map((item, idx) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={idx}>
              <div className="d-flex align-items-center">
                <label
                  htmlFor={item.id}
                  className="form-label mb-0 me-2 fw-semibold"
                  style={{ width: "50%" }}
                >
                  {item.label}
                </label>
                <input
                  type="text"
                  id={item.id}
                  className="form-control"
                  value={item.value}
                  onChange={item.onChange}
                  disabled={item.disabled}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="col-12 mt-3 small">
          <label htmlFor="notes" className="form-label mb-1 fw-semibold">
            Notes
          </label>
          <input
            type="text"
            id="notes"
            className="form-control"
            value={formData.note}
            onChange={(e) => handleFormChange("note", e.target.value)}
          />
        </div>

        <div className="col-12 mt-3 gap-2">
          <div className="align-items-center d-flex">
            <label htmlFor="" className="form-label mb-1">
              Received Amount
            </label>
            <button
              type="button" // Added type="button" to prevent form submission
              className="btn text-primary border-secondary-subtle ms-2"
              onClick={handleAddPayment}
              disabled={submitting}
            >
              Add
            </button>
          </div>

          {payments.map((payment, index) => (
            <React.Fragment key={index}>
              <div className="row g-3 mt-0 mb-4 justify-content-between">
                <div className="col-12 col-md-8">
                  <div className="row px-0">
                    <div className="col-4 col-md-3">
                      <Select
                        options={methodoptions}
                        value={payment.method}
                        onChange={(selectedOption) =>
                          handleChange(index, "method", selectedOption)
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={submitting}
                      />
                    </div>
                    <div className="col-4 col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Amount"
                        value={payment.amount}
                        onChange={(e) =>
                          handleChange(index, "amount", e.target.value)
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-4 col-md-3">
                      <DatePicker
                        selected={payment.date}
                        onChange={(date) => handleChange(index, "date", date)}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        isClearable
                        autoComplete="off"
                        placeholderText="Select Date"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Reference"
                    value={payment.reference}
                    onChange={(e) =>
                      handleChange(index, "reference", e.target.value)
                    }
                    disabled={submitting}
                  />
                </div>
              </div>
              {index !== payments.length - 1 && (
                <div className="w-100 text-center my-2">
                  <hr
                    style={{
                      borderTop: "1px solid #ced4da",
                      opacity: 0.6,
                      margin: 0,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSale;
