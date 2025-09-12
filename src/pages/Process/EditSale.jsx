// EditSale.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";
import ProductSelector from "../../pages/Sale/new/ProductSelector";
import InventoryData from "../../pages/Sale/new/InventoryPairs";
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



const calculateTotals = () => {
  let totalQuantity = 0;
  let totalAmount = 0;
  let taxAmount = 0;
  let totalDiscount = 0;
  let flatDiscount = Number(formData.flatDiscount) || 0;
  let couponDiscount = Number(formData.couponDiscount) || 0;
  let otherCharges = Number(formData.otherCharges) || 0;

  console.log("inventoryPairs<<<<<<<,,", inventoryPairs);

  // Iterate over inventoryPairs to calculate totals for product, leftLens, and rightLens
  inventoryPairs.forEach((pair) => {
    const { product, leftLens, rightLens } = pair;

    // Calculate totals for the product (if available)
    if (product) {
      const productQuantity =  1; // Assuming 1 unit per product
      const productAmount = product.srp * productQuantity; // SRP is the price
      const productTaxAmount = product.perPieceTax || 0;
      const productDiscount = product.perPieceDiscount || 0;

      totalQuantity += productQuantity;
      totalAmount += productAmount;
      taxAmount += productTaxAmount;
      totalDiscount += productDiscount;
    }

    // Calculate totals for the right lens (if available)
    if (rightLens) {
      const rightLensQuantity =  1; // Assuming 1 unit per right lens
      const rightLensAmount = rightLens.srp * rightLensQuantity;
      const rightLensTaxAmount = rightLens.perPieceTax || 0;
      const rightLensDiscount = rightLens.perPieceDiscount || 0;

      totalQuantity += rightLensQuantity;
      totalAmount += rightLensAmount;
      taxAmount += rightLensTaxAmount;
      totalDiscount += rightLensDiscount;
    }

    // Calculate totals for the left lens (if available)
    if (leftLens) {
      const leftLensQuantity =  1; // Assuming 1 unit per left lens
      const leftLensAmount = leftLens.srp * leftLensQuantity;
      const leftLensTaxAmount = leftLens.perPieceTax || 0;
      const leftLensDiscount = leftLens.perPieceDiscount || 0;

      totalQuantity += leftLensQuantity;
      totalAmount += leftLensAmount;
      taxAmount += leftLensTaxAmount;
      totalDiscount += leftLensDiscount;
    }
  });

  // Add any global discounts and charges
  totalDiscount += flatDiscount + couponDiscount;
  const netAmount = totalAmount - flatDiscount + otherCharges - couponDiscount;

  // Update the formData state with the totals
  setFormData((prev) => ({
    ...prev,
    totalQuantity,
    totalAmount,
    totalTax: taxAmount,
    netDiscount: totalDiscount,
    netAmount,
  }));

  // Update saleData with the totals
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
    inventoryPairs,
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
                  _id: order.product.item ?? order.product.id ?? order.product._id,
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
                  _id: order.rightLens.item ?? order.rightLens.id ?? order.rightLens._id,
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
                  _id: order.leftLens.item ?? order.leftLens.id ?? order.leftLens._id,
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
              product: order.product ? {...order.product, quantity:1} : null || null,
              rightLens: order.rightLens ? {...order.rightLens,quantity:1} :null || null,
              leftLens: order.leftLens ?{...order.leftLens,quantity:1}: null || null,
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

     if (!inventoryPairs || inventoryPairs.length === 0) {
        return;
      }

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
    const transformInventoryPairs = (inventoryPairs) => {
      return inventoryPairs.map((pair) => {
        console.log("pair<<,", pair);

        return {
          product: pair.product
            ? {
              product: pair.product.id || pair.product._id || pair.product.item || pair.product.product, // id for backend
              productObject: pair.product.raw || pair.product.productObject || {}, // keep full raw for reference
              quantity: 1,
              barcode:
                pair.product.barcode ||
                pair.product.newBarcode ||
                pair.product.oldBarcode ||
                pair.product.raw?.newBarcode ||
                pair.product.raw?.oldBarcode ||
                null,
              stock:
                // pair.product.quantity ||
                // pair.product.stock ||
                // pair.product.raw?.quantity ||
                // pair.product.inventory?.totalQuantity ||
                0,
              sku:
                pair.product.sku ||
                pair.product.raw?.sku ||
                "",
              photos:
                pair.product.photos ||
                pair.product.raw?.photos ||
                [],
              mrp:
                pair.product.mrp ||
                pair.product.MRP ||
                pair.product.raw?.MRP ||
                0,
              srp:
                pair.product.srp ||
                pair.product.sellPrice ||
                pair.product.raw?.sellPrice ||
                0,
              taxRate: `${pair.product.taxRate || pair.product.raw?.tax || 0}`,
              taxAmount: pair.product.taxAmount || 0,
              discount: pair.product.discount || pair.product.raw?.discount || 0,
              displayName: pair.product.displayName || pair.product.raw?.displayName,
              unit:
                pair.product.unit?.name ||
                pair.product.unit ||
                pair.product.raw?.unit ||
                "",
              netAmount:
                (pair.product.srp ||
                  pair.product.sellPrice ||
                  pair.product.raw?.sellPrice ||
                  0) -
                (pair.product.discount || pair.product.raw?.discount || 0),
              inclusiveTax:
                pair.product.inclusiveTax ??
                pair.product.raw?.inclusiveTax ??
                true,
              manageStock:
                pair.product.manageStock ??
                pair.product.raw?.manageStock ??
                true,
              resellerPrice:
                pair.product.resellerPrice ||
                pair.product.raw?.resellerPrice ||
                0,
              incentiveAmount:
                pair.product.incentiveAmount ||
                pair.product.raw?.incentiveAmount ||
                0,
            }
            : null,


          rightLens: pair.rightLens
            ? {
              product: pair.rightLens.id || pair.rightLens._id || pair.rightLens.item || pair.rightLens.product,
              quantity: 1,
              barcode: pair.rightLens.oldBarcode || pair.rightLens.barcode,
              stock: pair.rightLens.stock || 0,
              sku: pair.rightLens.sku,
              photos: pair.rightLens.photos || [],
              mrp: pair.rightLens.MRP || pair.rightLens.mrp || 0,
              srp: pair.rightLens.sellPrice || pair.rightLens.srp || 0,
              taxRate: `${pair.rightLens.tax || pair.rightLens.taxRate} (Inc)`,
              taxAmount:
                pair.rightLens.perPieceTax || pair.rightLens.taxAmount || 0,
              discount:
                pair.rightLens.perPieceDiscount || pair.rightLens.discount || 0,
              netAmount:
                (pair.rightLens.sellPrice || pair.rightLens.srp || 0) -
                (pair.rightLens.perPieceDiscount ||
                  pair.rightLens.discount ||
                  0),
              inclusiveTax: pair.rightLens.inclusiveTax ?? true,
              manageStock: pair.rightLens.manageStock ?? false,
              displayName:
                pair.rightLens.displayName ||
                pair.rightLens.productName ||
                "Lens",
              unit: pair.rightLens.unit?.name || pair.rightLens.unit || "Pieces",
              incentiveAmount: pair.rightLens.incentiveAmount || 0,
            }
            : null,

          leftLens: pair.leftLens
            ? {
              product: pair.leftLens.id || pair.leftLens._id || pair.leftLens.item || pair.leftLens.product,
              quantity: 1,
              barcode: pair.leftLens.oldBarcode || pair.leftLens.barcode,
              stock: pair.leftLens.stock || 0,
              sku: pair.leftLens.sku,
              photos: pair.leftLens.photos || [],
              mrp: pair.leftLens.MRP || pair.leftLens.mrp || 0,
              srp: pair.leftLens.sellPrice || pair.leftLens.srp || 0,
              taxRate: `${pair.leftLens.tax || pair.leftLens.taxRate} (Inc)`,
              taxAmount:
                pair.leftLens.perPieceTax || pair.leftLens.taxAmount || 0,
              discount:
                pair.leftLens.perPieceDiscount || pair.leftLens.discount || 0,
              netAmount:
                (pair.leftLens.sellPrice || pair.leftLens.srp || 0) -
                (pair.leftLens.perPieceDiscount ||
                  pair.leftLens.discount ||
                  0),
              inclusiveTax: pair.leftLens.inclusiveTax ?? true,
              manageStock: pair.leftLens.manageStock ?? false,
              displayName:
                pair.leftLens.displayName ||
                pair.leftLens.productName ||
                "Lens",
              unit: pair.leftLens.unit?.name || pair.leftLens.unit || "Pieces",
              incentiveAmount: pair.leftLens.incentiveAmount || 0,
            }
            : null,
        };
      });
    };

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
      orders: transformInventoryPairs(inventoryPairs),
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
          <div className="col-md-6 col-12 mt-2">

            <ProductSelector
              showProductSelector={showProductSelector}
              defaultStore={defaultStore}
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
                className={`form-control ${errors.recallDate ? "is-invalid" : ""
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
          inventoryPairs={inventoryPairs}
          setInventoryPairs={setInventoryPairs}
          defaultStore={defaultStore}
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
