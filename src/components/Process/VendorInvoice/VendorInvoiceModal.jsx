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
  console.log("selectedJobs", selectedJobs);

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

          // discount is % of cost price
          const discountAmount = (costPrice * flatDiscount) / 100;

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
          };
        })
      );
    }
  }, [selectedJobs]);
  // Update row values
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

          // Discount is percentage of price
          const discountAmount = (price * flatDiscount) / 100;

          // Net price after discount + charges
          const netPrice = price - discountAmount + otherCharges;

          if (taxType === "Inc") {
            updated.taxAmount = parseFloat(
              ((netPrice * taxRate) / (100 + taxRate)).toFixed(2)
            );
            updated.total = netPrice; // inclusive tax, total = net price
          } else {
            updated.taxAmount = parseFloat(
              ((netPrice * taxRate) / 100).toFixed(2)
            );
            updated.total = parseFloat(
              (netPrice + updated.taxAmount).toFixed(2)
            );
          }

          return updated;
        }
        return row;
      })
    );
  };

  const formik = useFormik({
    initialValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
    },
    validationSchema: Yup.object({
      invoiceNumber: Yup.string().required("Invoice number is required"),
      invoiceDate: Yup.date().required("Invoice date is required"),
    }),
    // onSubmit: (values) => {
    //   const payload = rows.map((r) => {
    //     const job = selectedJobs.find((j) => j._id === r._id);

    //     return {
    //       _id: r._id,
    //       lens: {
    //         item: job?.lens?.item?._id || null,
    //         barcode: job?.lens?.barcode || null,
    //         sku: job?.lens?.sku || null,
    //         mrp: job?.lens?.mrp || 0,
    //         srp: job?.lens?.srp || 0,
    //         costPrice: parseFloat(r.price) || 0, // updated costPrice
    //       },
    //       price: parseFloat(r.price) || 0,
    //       flatDiscount: parseFloat(r.flatDiscount) || 0, // 👈 NEW
    //       otherCharges: parseFloat(r.otherCharges) || 0,
    //       taxAmount: r.taxAmount,
    //       taxRate: r.taxRate,
    //       taxType: r.taxType.toLowerCase(),
    //       amount: r.total,
    //       fillStatus: "filled",
    //       notes: r.notes || null,
    //       invoiceNumber: values.invoiceNumber,
    //       invoiceDate: values.invoiceDate.getTime(),
    //       gstType: "",
    //     };
    //   });

    //   console.log("payload", payload);
    //   onSubmit(payload);
    // },
    onSubmit: (values) => {
      const payload = rows.map((r) => {
        const job = selectedJobs.find((j) => j._id === r._id);

        return {
          _id: r._id,
          lens: {
            item: {
              _id: job?.lens?.item?._id || null,
              costPrice: parseFloat(r.price) || 0,
            },
            barcode: job?.lens?.barcode || null,
            sku: job?.lens?.sku || null,
            mrp: job?.lens?.mrp || 0,
            srp: job?.lens?.srp || 0,
            // updated costPrice
          },
          status: "completed",
          // price: parseFloat(r.price) || 0,
          // flatDiscount: parseFloat(r.flatDiscount) || 0, // 👈 NEW
          // otherCharges: parseFloat(r.otherCharges) || 0,
          // taxAmount: r.taxAmount,
          // taxRate: r.taxRate,
          // taxType: r.taxType.toLowerCase(),
          // amount: r.total,
          // fillStatus: "filled",
          // notes: r.notes || null,
          // invoiceNumber: values.invoiceNumber,
          // invoiceDate: values.invoiceDate.getTime(),
          // gstType: "",
        };
      });

      console.log("payload", payload);
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
          <Table striped bordered hover size="sm" className="mt-3">
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
