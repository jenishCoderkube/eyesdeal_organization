import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { useFormik } from "formik";
import * as Yup from "yup";

const TAX_OPTIONS = [
  { value: "Inc", label: "Inc" },
  { value: "Exc", label: "Exc" },
];

function VendorInvoiceModal({ onSubmit, show, onHide, loading, selectedJobs }) {
  const [rows, setRows] = useState([]);

  // Initialize rows from selectedJobs
  useEffect(() => {
    if (selectedJobs?.length) {
      setRows(
        selectedJobs.map((job) => {
          const costPrice = job.lens?.item?.costPrice || 0;
          const taxRate = job.lens?.item?.tax || 0;
          const taxType = job.lens?.item?.inclusiveTax ? "Inc" : "Exc";
          const flatDiscount = 0; // default
          const otherCharges = 0; // default

          // discount is flat amount
          const discountAmount = flatDiscount;

          // net price after discount + charges
          const netPrice = costPrice - discountAmount + otherCharges;

          const taxAmount =
            taxType === "Inc"
              ? (netPrice * taxRate) / (100 + taxRate)
              : (netPrice * taxRate) / 100;

          const total = taxType === "Inc" ? netPrice : netPrice + taxAmount;

          return {
            _id: job._id,
            customerName: job.customerName,
            sku: job.lens?.sku || "N/A",
            price: costPrice,
            side: job.side || "N/A",
            flatDiscount,
            otherCharges,
            taxRate,
            taxType,
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            notes: "",
            lens: {
              item: {
                _id: job?.lens?.item?._id || null,
                costPrice: parseFloat(costPrice) || 0,
              },
              barcode: job?.lens?.barcode || null,
              sku: job?.lens?.sku || null,
              mrp: job?.lens?.mrp || 0,
              srp: job?.lens?.srp || 0,
            },
          };
        })
      );
    }
  }, [selectedJobs]);

  // Update row values
  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row._id === id) {
          const updated = { ...row, [field]: value };

          // Ensure numbers
          const price = parseFloat(updated.price) || 0;
          const taxRate = parseFloat(updated.taxRate) || 0;
          const flatDiscount = parseFloat(updated.flatDiscount) || 0;
          const otherCharges = parseFloat(updated.otherCharges) || 0;
          const taxType = updated.taxType || "Inc";

          // Net price after discount + charges
          const netPrice = price - flatDiscount + otherCharges;

          const taxAmount =
            taxType === "Inc"
              ? (netPrice * taxRate) / (100 + taxRate)
              : (netPrice * taxRate) / 100;

          updated.taxAmount = parseFloat(taxAmount.toFixed(2));
          updated.total = parseFloat(
            (taxType === "Inc" ? netPrice : netPrice + taxAmount).toFixed(2)
          );

          return updated;
        }
        return row;
      })
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      totalQuantity: rows.length,
      flatDiscount: 0,
      otherCharges: 0,
      taxAmount: 0,
      totalAmount: 0,
    };

    rows.forEach((row) => {
      totals.flatDiscount += parseFloat(row.flatDiscount) || 0;
      totals.otherCharges += parseFloat(row.otherCharges) || 0;
      totals.taxAmount += parseFloat(row.taxAmount) || 0;
      totals.totalAmount += parseFloat(row.total) || 0;
    });

    // Round to 2 decimal places where applicable
    totals.flatDiscount = parseFloat(totals.flatDiscount.toFixed(2));
    totals.otherCharges = parseFloat(totals.otherCharges.toFixed(2));
    totals.taxAmount = parseFloat(totals.taxAmount.toFixed(2));
    totals.totalAmount = parseFloat(totals.totalAmount.toFixed(2));

    return totals;
  };

  const totals = calculateTotals();

  const formik = useFormik({
    initialValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
    },
    validationSchema: Yup.object({
      invoiceNumber: Yup.string().required("Invoice number is required"),
      invoiceDate: Yup.date().required("Invoice date is required"),
    }),
    onSubmit: async (values) => {
      const user = JSON.parse(localStorage.getItem("user"));
      const storeId = user?.stores?.[0] || null;
      const vendorId = selectedJobs?.[0]?.vendor?._id || null;

      const payload = {
        store: storeId,
        vendor: vendorId,
        invoiceNumber: values.invoiceNumber,
        invoiceDate: values.invoiceDate.toISOString().split("T")[0],

        // ✅ invoice-level summary
        flatDiscount: totals.flatDiscount,
        otherCharges: totals.otherCharges,
        totalAmount: totals.totalAmount,
        totalQuantity: totals.totalQuantity,
        taxAmount: totals.taxAmount,

        // ✅ row-wise job work details
        jobWork: rows.map((r) => {
          const job = selectedJobs.find((j) => j._id === r._id);
          return {
            _id: r._id,
            fillStatus: "filled",
            flatDiscount: parseFloat(r.flatDiscount) || 0,
            otherCharges: parseFloat(r.otherCharges) || 0,
            taxAmount: parseFloat(r.taxAmount) || 0,
            taxType: r.taxType?.toLowerCase() || "inc",
            totalAmount: parseFloat(r.total) || 0,
            lens: {
              item: {
                _id: job?.lens?.item?._id || null,
                costPrice: parseFloat(r.price) || 0,
              },
              barcode: job?.lens?.barcode || null,
              sku: job?.lens?.sku || null,
              mrp: job?.lens?.mrp || 0,
              srp: job?.lens?.srp || 0,
            },
          };
        }),
      };

      // ✅ Send to parent instead of making API call here
      onSubmit(payload);
    },
  });

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Vendor Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          {/* Invoice Header */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control
                  type="text"
                  name="invoiceNumber"
                  value={formik.values.invoiceNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.invoiceNumber && formik.errors.invoiceNumber
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.invoiceNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Invoice Date</Form.Label>
                <DatePicker
                  selected={formik.values.invoiceDate}
                  onChange={(date) => formik.setFieldValue("invoiceDate", date)}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  autoComplete="off"
                />
                {formik.touched.invoiceDate && formik.errors.invoiceDate && (
                  <div className="text-danger small">
                    {formik.errors.invoiceDate}
                  </div>
                )}
              </Form.Group>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-responsive mt-3">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product SKU</th>
                  <th>Price</th>
                  <th>Side</th>
                  <th>Flat Discount</th>
                  <th>Other Charges</th>
                  <th>Tax Rate</th>
                  <th>Tax Type</th>
                  <th>Tax Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.customerName}</td>
                    <td>{row.sku}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          updateRow(row._id, "price", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>
                    <td>{row.side}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.flatDiscount}
                        onChange={(e) =>
                          updateRow(row._id, "flatDiscount", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.otherCharges}
                        onChange={(e) =>
                          updateRow(row._id, "otherCharges", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>
                    <td>{row.taxRate}</td>
                    <td style={{ minWidth: "120px" }}>
                      <Select
                        options={TAX_OPTIONS}
                        value={TAX_OPTIONS.find((t) => t.value === row.taxType)}
                        onChange={(selected) =>
                          updateRow(row._id, "taxType", selected.value)
                        }
                        isDisabled={loading}
                      />
                    </td>
                    <td>{(row.taxAmount ?? 0).toFixed(2)}</td>
                    <td>{(row.total ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Totals Summary */}
          <div className="mt-3">
            <h5>Summary</h5>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <td>
                    <strong>Total Quantity</strong>
                  </td>
                  <td>{totals.totalQuantity}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total Flat Discount</strong>
                  </td>
                  <td>{totals.flatDiscount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total Other Charges</strong>
                  </td>
                  <td>{totals.otherCharges.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total Tax Amount</strong>
                  </td>
                  <td>{totals.taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total Amount</strong>
                  </td>
                  <td>{totals.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="secondary"
              onClick={onHide}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default VendorInvoiceModal;
