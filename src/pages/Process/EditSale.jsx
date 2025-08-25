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

    // Construct orders from inventoryData and inventoryPairs
    const updatedOrders = inventoryPairs
      .map((pair) => {
        // Find corresponding inventoryData items
        const groupItems = inventoryData.filter(
          (item) => item.groupId === pair.groupId
        );

        let product = null; // Initialize product as null
        let rightLens = null;
        let leftLens = null;

        // Update product details if it exists
        const productItem = groupItems.find((item) => item.type === "product");
        if (productItem && productItem.data) {
          product = {
            item: productItem.data._id,
            unit: productItem.data.unit?.name || "Pieces",
            displayName:
              productItem.data.productName || productItem.data.displayName,
            barcode: productItem.data.oldBarcode || productItem.data.newBarcode,
            sku: productItem.data.sku,
            mrp: parseFloat(productItem.data.MRP) || 0,
            srp: parseFloat(productItem.data.sellPrice) || 0,
            perPieceDiscount: productItem.discount || 0,
            taxRate: `${productItem.data.tax || 0} (Inc)`,
            perPieceTax: productItem.taxAmount || 0,
            perPieceAmount: productItem.totalAmount || 0,
            inclusiveTax: productItem.data.inclusiveTax ?? true,
            manageStock: productItem.data.manageStock ?? true,
            incentiveAmount: productItem.data.incentiveAmount || 0,
          };
        }

        // Update rightLens details
        const rightLensItem = groupItems.find(
          (item) => item.type === "rightLens"
        );
        if (rightLensItem && rightLensItem.data) {
          rightLens = {
            item: rightLensItem.data._id,
            unit: rightLensItem.data.unit?.name || "Pieces",
            displayName:
              rightLensItem.data.productName || rightLensItem.data.displayName,
            barcode:
              rightLensItem.data.oldBarcode || rightLensItem.data.newBarcode,
            sku: rightLensItem.data.sku,
            mrp: parseFloat(rightLensItem.data.MRP) || 0,
            srp: parseFloat(rightLensItem.data.sellPrice) || 0,
            perPieceDiscount: rightLensItem.discount || 0,
            taxRate: `${rightLensItem.data.tax || 0} (Inc)`,
            perPieceTax: rightLensItem.taxAmount || 0,
            perPieceAmount: rightLensItem.totalAmount || 0,
            inclusiveTax: rightLensItem.data.inclusiveTax ?? true,
            manageStock: rightLensItem.data.manageStock ?? false,
            incentiveAmount: rightLensItem.data.incentiveAmount || 0,
          };
        }

        // Update leftLens details
        const leftLensItem = groupItems.find(
          (item) => item.type === "leftLens"
        );
        if (leftLensItem && leftLensItem.data) {
          leftLens = {
            item: leftLensItem.data._id,
            unit: leftLensItem.data.unit?.name || "Pieces",
            displayName:
              leftLensItem.data.productName || leftLensItem.data.displayName,
            barcode:
              leftLensItem.data.oldBarcode || leftLensItem.data.newBarcode,
            sku: leftLensItem.data.sku,
            mrp: parseFloat(leftLensItem.data.MRP) || 0,
            srp: parseFloat(leftLensItem.data.sellPrice) || 0,
            perPieceDiscount: leftLensItem.discount || 0,
            taxRate: `${leftLensItem.data.tax || 0} (Inc)`,
            perPieceTax: leftLensItem.taxAmount || 0,
            perPieceAmount: leftLensItem.totalAmount || 0,
            inclusiveTax: leftLensItem.data.inclusiveTax ?? true,
            manageStock: leftLensItem.data.manageStock ?? false,
            incentiveAmount: leftLensItem.data.incentiveAmount || 0,
          };
        }

        // Only include orders with at least one item (product, rightLens, or leftLens)
        if (product || rightLens || leftLens) {
          return {
            _id: pair.pairId.includes("pair-new-")
              ? undefined
              : pair.pairId.split("-")[2],
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
        return null;
      })
      .filter((order) => order !== null);

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
        // Optionally navigate back to sales list
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
