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

function EditSale() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(true);
  const [defaultStore, setDefaultStore] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
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

  // Fetch sale data on mount and populate inventoryData
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
          });

          // Populate payments
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

          // Populate inventoryData and inventoryPairs from sale.orders
          const newInventoryData = [];
          const newInventoryPairs = [];
          sale.orders.forEach((order, index) => {
            const pairId = `pair-${index}-${order._id}`;
            // Product
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
                  photos: [], // Add photos if available
                  manageStock: order.product.manageStock,
                  inclusiveTax: order.product.inclusiveTax,
                  incentiveAmount: order.product.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.product.perPieceTax,
                discount: order.product.perPieceDiscount,
                totalAmount: order.product.perPieceAmount,
                pairId,
              });
            }
            // Right Lens
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
                  photos: [], // Add photos if available
                  manageStock: order.rightLens.manageStock,
                  inclusiveTax: order.rightLens.inclusiveTax,
                  incentiveAmount: order.rightLens.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.rightLens.perPieceTax,
                discount: order.rightLens.perPieceDiscount,
                totalAmount: order.rightLens.perPieceAmount,
                pairId,
              });
            }
            // Left Lens
            if (order.leftLens) {
              newInventoryData.push({
                type: "leftLens",
                data: {
                  _id: order.leftLens

.item,
                  oldBarcode: order.leftLens.barcode,
                  sku: order.leftLens.sku,
                  productName: order.leftLens.displayName,
                  MRP: order.leftLens.mrp,
                  sellPrice: order.leftLens.perPieceAmount,
                  tax: parseFloat(order.leftLens.taxRate) || 0,
                  photos: [], // Add photos if available
                  manageStock: order.leftLens.manageStock,
                  inclusiveTax: order.leftLens.inclusiveTax,
                  incentiveAmount: order.leftLens.incentiveAmount,
                },
                quantity: 1,
                taxAmount: order.leftLens.perPieceTax,
                discount: order.leftLens.perPieceDiscount,
                totalAmount: order.leftLens.perPieceAmount,
                pairId,
              });
            }
            // Add to inventoryPairs
            newInventoryPairs.push({
              pairId,
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

  // Handle products selected from ProductSelector
  const handleProductsSelected = (selectedProducts) => {
    const newOrders = selectedProducts.map((product, index) => {
      const pairId = `pair-new-${Date.now()}-${index}`;
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
          perPieceTax: ((product.sellPrice || product.MRP) * (product.tax || 0)) / 100,
          perPieceAmount: product.sellPrice || product.MRP,
          inclusiveTax: product.inclusiveTax ?? true,
          manageStock: product.manageStock ?? true,
          incentiveAmount: product.incentiveAmount || 0,
        },
        pairId,
      };
    });

    // Update saleData
    setSaleData((prev) => ({
      ...prev,
      orders: [...(prev.orders || []), ...newOrders],
      totalQuantity: (prev.totalQuantity || 0) + newOrders.length,
      totalAmount:
        (prev.totalAmount || 0) +
        newOrders.reduce((sum, order) => sum + (order.product.perPieceAmount || 0), 0),
      totalTax:
        (prev.totalTax || 0) +
        newOrders.reduce((sum, order) => sum + (order.product.perPieceTax || 0), 0),
      netAmount:
        (prev.netAmount || 0) +
        newOrders.reduce(
          (sum, order) => sum + (order.product.perPieceAmount || 0) + (order.product.perPieceTax || 0),
          0
        ),
    }));

    // Update inventoryData
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
        photos: [], // Add photos if available
        manageStock: order.product.manageStock,
        inclusiveTax: order.product.inclusiveTax,
        incentiveAmount: order.product.incentiveAmount,
      },
      quantity: 1,
      taxAmount: order.product.perPieceTax,
      discount: order.product.perPieceDiscount,
      totalAmount: order.product.perPieceAmount,
      pairId: order.pairId,
    }));

    setInventoryData((prev) => [...prev, ...newInventoryData]);
    setInventoryPairs((prev) => [
      ...prev,
      ...newOrders.map((order) => ({
        pairId: order.pairId,
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

    // Construct orders from inventoryPairs
    const updatedOrders = inventoryPairs.map((pair) => ({
      _id: pair.pairId.includes("pair-new-") ? undefined : pair.pairId.split("-")[2], // Extract order _id if not new
      product: pair.product,
      rightLens: pair.rightLens,
      leftLens: pair.leftLens,
      store: saleData?.store?._id,
      status: "pending",
      attachments: [],
      sale: id,
      billNumber: saleData?.saleNumber?.toString(),
    })).filter((order) => order.product || order.rightLens || order.leftLens);

    const payload = {
      _id: id,
      store: saleData?.store?._id || null,
      customerName: saleData?.customerName || null,
      customerPhone: saleData?.customerPhone || null,
      customerId: saleData?.customerId || null,
      totalDiscount: saleData?.totalDiscount ?? null,
      flatDiscount: parseFloat(formData.flatDiscount) || 0,
      netDiscount: saleData?.netDiscount || 0,
      totalAmount: saleData?.totalAmount || 0,
      totalTax: saleData?.totalTax || 0,
      otherCharges: parseFloat(formData.otherCharges) || 0,
      deliveryCharges: parseFloat(formData.deliveryCharges) || 0,
      netAmount: saleData?.netAmount || 0,
      totalQuantity: saleData?.totalQuantity || 0,
      salesRep: saleData?.salesRep?._id || null,
      orders: updatedOrders,
      receivedAmount: validPayments,
      createdAt: saleData?.createdAt || null,
      updatedAt: saleData?.updatedAt || null,
      saleNumber: saleData?.saleNumber || 0,
      powerAtTime: saleData?.powerAtTime || {},
      note: formData.note || null,
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
        });
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
            value={saleData.customerName || ""}
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
            value={saleData.customerPhone || ""}
            disabled
          />
        </div>
        <div className="col-12 my-3">
          <div>
            <label htmlFor="products" className="form-label mb-1">
              Products
            </label>
          </div>

          <div className="col-md-6 col-12">
            <ProductSelector
              showProductSelector={showProductSelector}
              defaultStore={defaultStore}
              setInventoryData={setInventoryData}
              setShowProductSelector={setShowProductSelector}
              setInventoryPairs={setInventoryPairs}
              onProductsSelected={handleProductsSelected}
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
                value: saleData.totalQuantity || "0",
                disabled: true,
              },
              {
                label: "Total Amount",
                id: "TotalAmount",
                value: saleData.totalAmount || "0",
                disabled: true,
              },
              {
                label: "Total Tax",
                id: "TotalTax",
                value: saleData.totalTax || "0",
                disabled: true,
              },
              {
                label: "Total Discount",
                id: "TotalDiscount",
                value: saleData.totalDiscount ?? "0",
                disabled: true,
              },
              {
                label: "Coupon Discount",
                id: "CouponDiscount",
                value: saleData.couponDiscount || "0",
                disabled: true,
              },
              {
                label: "Flat Discount",
                id: "FlatDiscount",
                value: formData.flatDiscount,
                disabled: false,
                onChange: (e) =>
                  handleFormChange("flatDiscount", e.target.value),
              },
              {
                label: "Net Discount",
                id: "NetDiscount",
                value: saleData.netDiscount || "0",
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
                onChange: (e) =>
                  handleFormChange("otherCharges", e.target.value),
              },
              {
                label: "Net Amount",
                id: "NetAmount",
                value: saleData.netAmount || "0",
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
        </div>
      </form>
    </div>
  );
}

export default EditSale;