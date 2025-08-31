import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";
import { IoMdClose, IoIosSave } from "react-icons/io";
import { MdEdit } from "react-icons/md";

function RAModel({ closeRAModal, selectedRA, refreshSalesData }) {
  console.log("Selected RA:", selectedRA);

  const [payments, setPayments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null); // Ref to track the modal content

  // Handle outside click
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeRAModal(); // Close modal if click is outside modal content
    }
  };

  // Add event listener for outside clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (
      selectedRA?.fullSale?.receivedAmount &&
      selectedRA.fullSale.receivedAmount.length > 0
    ) {
      const initialPayments = selectedRA.fullSale.receivedAmount.map(
        (payment) => ({
          method:
            methodOptions.find((opt) => opt.value === payment.method) || null,
          amount: payment.amount.toString(),
          date: payment.date ? new Date(payment.date) : null,
          reference: payment.reference || "",
          isEditing: true, // Set Amount field as editable by default
        })
      );
      setPayments(initialPayments);
    } else {
      setPayments([
        {
          method: null,
          amount: "",
          date: new Date(),
          reference: "",
          isEditing: true, // Set Amount field as editable by default
        },
      ]);
    }
  }, [selectedRA]);

  const methodOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Card" },
    { value: "card", label: "UPI" },
  ];

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      {
        method: null,
        amount: "",
        date: new Date(),
        reference: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedPayments = [...payments];
    updatedPayments[index][field] = value;
    setPayments(updatedPayments);
  };

  const handleRemovePayment = (index) => {
    const updatedPayments = [...payments];
    updatedPayments.splice(index, 1);
    setPayments(updatedPayments);
  };

  const handleToggleEdit = (index) => {
    const updatedPayments = [...payments];
    updatedPayments[index].isEditing = !updatedPayments[index].isEditing;
    setPayments(updatedPayments);
  };

  const handleSubmit = async () => {
    const isValid = payments.every(
      (payment) =>
        payment.method &&
        payment.amount &&
        !isNaN(payment.amount) &&
        payment.date
    );

    if (!isValid) {
      toast.error("Please fill all required fields (Method, Amount, Date)");
      return;
    }

    setIsSubmitting(true);
    const formattedPayments = payments.map((payment) => ({
      method: payment.method.value,
      amount: parseFloat(payment.amount),
      date: payment.date.toISOString(),
      reference: payment.reference || "",
    }));

    const totalReceived = formattedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const payload = {
      ...selectedRA.fullSale,
      billNumber: selectedRA.billNumber,
      receivedAmount: formattedPayments,
      finalAmount: selectedRA.netAmount || 0,
      amountDue: (selectedRA.netAmount || 0) - totalReceived,
    };

    try {
      const response = await shopProcessService.updateSale(
        selectedRA._id,
        payload
      );
      if (response.success) {
        toast.success("Payments updated successfully");
        if (refreshSalesData) {
          await refreshSalesData();
        }
        closeRAModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update payments");
      console.error("updateSale API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="modal small"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        className="modal-dialog overflow-y-auto"
        role="document"
        ref={modalRef} // Attach ref to modal content
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "500px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
          boxShadow: "0 5px 30px rgba(0,0,0,0.3)",
          padding: "0px",
        }}
      >
        <div className="modal-content border-0">
          <div className="modal-header border-none p-0">
            <button
              type="button"
              className="btn-close"
              style={{ width: "40px", height: "40px" }}
              onClick={closeRAModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="px-1 pt-3">
            <div className="px-2 pb-4">
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label
                    htmlFor="systemid"
                    className="form-label mb-0 fw-semibold"
                  >
                    System id
                  </label>
                  <input
                    type="text"
                    id="systemid"
                    className="form-control"
                    value={selectedRA._id}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <label
                    htmlFor="billnumber"
                    className="form-label mb-0 fw-semibold"
                  >
                    Bill Number
                  </label>
                  <input
                    type="text"
                    id="billnumber"
                    className="form-control"
                    value={selectedRA.billNumber}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <label
                    htmlFor="finalamount"
                    className="form-label mb-0 fw-semibold"
                  >
                    Final Amount
                  </label>
                  <input
                    type="text"
                    id="finalamount"
                    className="form-control"
                    value={selectedRA.netAmount || 0}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <label
                    htmlFor="amountdue"
                    className="form-label mb-0 fw-semibold"
                  >
                    Amount Due
                  </label>
                  <input
                    type="text"
                    id="amountdue"
                    className="form-control"
                    value={selectedRA.remainingAmount || 0}
                    disabled
                  />
                </div>
              </div>
              <button
                className="btn border-secondary-subtle text-primary fw-semibold mb-3"
                onClick={handleAddPayment}
              >
                Add
              </button>
              {payments.map((payment, index) => (
                <div
                  className="row g-3 my-3 align-items-end d-flex align-items-top"
                  key={index}
                >
                  <div className="col-2">
                    <label className="form-label mb-1 fw-semibold">
                      Method
                    </label>
                    <Select
                      options={methodOptions}
                      value={payment.method}
                      onChange={(selectedOption) =>
                        handleChange(index, "method", selectedOption)
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select method"
                    />
                  </div>
                  <div className="col-2">
                    <label className="form-label mb-1 fw-semibold">
                      Amount
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={payment.amount}
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      // disabled={!payment.isEditing}
                    />
                  </div>
                  <div className="col-3">
                    <label className="form-label mb-1 fw-semibold">Date</label>
                    <DatePicker
                      selected={payment.date} // if no date, fallback to today
                      onChange={(date) => handleChange(index, "date", date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      isClearable
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-3">
                    <label className="form-label mb-1 fw-semibold">
                      Reference
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={payment.reference}
                      onChange={(e) =>
                        handleChange(index, "reference", e.target.value)
                      }
                    />
                  </div>
                  <div className="d-flex gap-2 col-2">
                    {/* <button
                      className="btn btn-sm btn-outline-primary rounded shadow-sm"
                      onClick={() => handleToggleEdit(index)}
                      title={payment.isEditing ? "Save" : "Edit"}
                    >
                      {payment.isEditing ? <IoIosSave /> : <MdEdit />}
                    </button> */}
                    <button
                      className="btn btn-sm btn-outline-danger rounded shadow-sm"
                      onClick={() => handleRemovePayment(index)}
                      title="Remove"
                    >
                      <IoMdClose />
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RAModel;
