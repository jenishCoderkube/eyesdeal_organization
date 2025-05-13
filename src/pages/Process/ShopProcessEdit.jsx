import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";

function ShopProcessEdit() {
  const { id } = useParams(); // Get sale ID from URL
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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

  // Fetch sale data on mount
  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      try {
        const response = await shopProcessService.getSaleById(id);
        console.log("res", response?.data);
        if (response.success && response.data.data.docs.length > 0) {
          const sale = response.data.data.docs[0];
          setSaleData(sale);
          // Initialize form data
          setFormData({
            flatDiscount: sale.flatDiscount?.toString() || "0",
            deliveryCharges: sale.deliveryCharges?.toString() || "0",
            otherCharges: sale.otherCharges?.toString() || "0",
            note: sale.note || "",
          });
          // Initialize payments from receivedAmount
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate payments
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

    // Prepare payload matching the provided structure
    const payload = {
      _id: id,
      store: saleData?.store || null,
      customerName: saleData?.customerName || null,
      customerPhone: saleData?.customerPhone || null,
      customerId: saleData?.customerId || null,
      totalDiscount: saleData?.totalDiscount ?? null, // Preserve null
      flatDiscount: parseFloat(formData.flatDiscount) || 0,
      netDiscount: saleData?.netDiscount || 0,
      totalAmount: saleData?.totalAmount || 0,
      totalTax: saleData?.totalTax || 0,
      otherCharges: parseFloat(formData.otherCharges) || 0,
      deliveryCharges: parseFloat(formData.deliveryCharges) || 0,
      netAmount: saleData?.netAmount || 0,
      totalQuantity: saleData?.totalQuantity || 0,
      salesRep: saleData?.salesRep || null,
      orders: saleData?.orders || [],
      receivedAmount: validPayments,
      createdAt: saleData?.createdAt || null,
      updatedAt: saleData?.updatedAt || null,
      saleNumber: saleData?.saleNumber || 0,
      powerAtTime: saleData?.powerAtTime || {},
      note: formData.note || null, // Allow null if empty
      __v: saleData?.__v || 0,
    };

    try {
      const response = await shopProcessService.updateSale(id, payload);
      if (response.success) {
        toast.success("Sale updated successfully");
        // Update saleData with response data or payload
        setSaleData((prev) => ({
          ...prev,
          ...payload,
          ...(response.data.data ? response.data.data : {}),
        }));
        // Update formData to reflect submitted values
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
            <span
              className="mx-3 btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setEditMode((prev) => !prev); // Toggle edit mode
              }}
            >
              {editMode ? "Cancel" : "Edit"}
            </span>
          </div>

          {saleData.orders?.map((order, index) => (
            <div className="d-flex gap-2 raw col-12 flex-wrap mb-3" key={index}>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`ProductSKU-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Product SKU
                </label>
                <input
                  type="text"
                  id={`ProductSKU-${index}`}
                  className="form-control"
                  value={order.product?.sku || order.lens?.sku || "N/A"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`Barcode-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Barcode
                </label>
                <input
                  type="text"
                  id={`Barcode-${index}`}
                  className="form-control"
                  value={order.product?.barcode || order.lens?.barcode || "N/A"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`MRP-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  MRP
                </label>
                <input
                  type="text"
                  id={`MRP-${index}`}
                  className="form-control"
                  value={order.product?.mrp || order.lens?.mrp || "N/A"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`SRP-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  SRP
                </label>
                <input
                  type="text"
                  id={`SRP-${index}`}
                  className="form-control"
                  value={order.perPieceAmount || "N/A"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`Discount-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Discount
                </label>
                <input
                  type="text"
                  id={`Discount-${index}`}
                  className="form-control"
                  value={order.perPieceDiscount || "0"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`TaxRate-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Tax Rate
                </label>
                <input
                  type="text"
                  id={`TaxRate-${index}`}
                  className="form-control"
                  value={order.taxRate || "N/A"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`TaxAmount-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Tax Amount
                </label>
                <input
                  type="text"
                  id={`TaxAmount-${index}`}
                  className="form-control"
                  value={order.perPieceTax || "0"}
                  disabled
                />
              </div>
              <div className="col-5 col-md-2">
                <label
                  htmlFor={`TotalAmount-${index}`}
                  className="form-label mb-1 fw-semibold"
                >
                  Total Amount
                </label>
                <input
                  type="text"
                  id={`TotalAmount-${index}`}
                  className="form-control"
                  value={order.perPieceAmount || "N/A"}
                  disabled
                />
              </div>
            </div>
          ))}

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
                value: saleData.totalDiscount ?? "0", // Handle null
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

export default ShopProcessEdit;
