import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import BillModel from "../../components/Process/BillModel";
import PrescriptionModel from "../../components/Process/PrescriptionModel";
import RAModel from "../../components/Process/RAModel";
import NotesModel from "../../components/Process/NotesModel";
import AssignPowerModel from "../../components/Process/AssignPowerModel";

function ShopProcessEdit() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [activeStatus, setActiveStatus] = useState("Pending");
    const [expandedRows, setExpandedRows] = useState([]);
    const [BillModalVisible, setBillModalVisible] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [PrescriptionModelVisible, setPrescriptionModelVisible] = useState(false);
    const [selectedCust, setSelectedCust] = useState(null);
    const [RAModalVisible, setRAModalVisible] = useState(false);
    const [selectedRA, setSelectedRA] = useState(null);
    const [NotesModalVisible, setNotesModalVisible] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState(null);
    const [APModalVisible, setAPModalVisible] = useState(false);
    const [selectedAP, setSelectedAP] = useState(null);

    const options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" }
    ];

    const statuses = ["Pending", "In Process", "Ready", "Delivered", "Returned"];

    const [productTableData, setProductTableData] = useState([
        {
            id: 1,
            selected: false,
            productSku: "PROD-001",
            lensSku: "LENS-A1",
            status: "Pending"
        },
        {
            id: 2,
            selected: true,
            productSku: "PROD-002",
            lensSku: "LENS-B2",
            status: "Ready"
        }
    ]);

    const tableData = [
        {
            date: "2025-04-17",
            billNumber: "INV001",
            customerName: "John Doe",
            phone: "1234567890",
            totalItems: 5,
            receivedAmount: 200,
            remainingAmount: 50,
            notes: "Urgent",
            action: "Edit",
        },
        {
            date: "2025-04-17",
            billNumber: "INV002",
            customerName: "Sachin Bhai Shah",
            phone: "9876543210",
            totalItems: 3,
            receivedAmount: 150,
            remainingAmount: 20,
            notes: "Normal",
            action: "Edit",
        }
    ];

    const toggleSplit = (index) => {
        setExpandedRows((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleSelect = (id) => {
        setProductTableData(prev =>
            prev.map(row =>
                row.id === id ? { ...row, selected: !row.selected } : row
            )
        );
    };

    const openBillModal = (bill) => {
        setSelectedBill(bill);
        setBillModalVisible(true);
    };

    const closeBillModal = () => {
        setBillModalVisible(false);
        setSelectedBill(null);
    };

    const openPrescriptionModel = (cust) => {
        setSelectedCust(cust);
        setPrescriptionModelVisible(true);
    };

    const closePrescriptionModel = () => {
        setPrescriptionModelVisible(false);
        setSelectedCust(null);
    };

    const openRAModal = (RA) => {
        setSelectedRA(RA);
        setRAModalVisible(true);
    };

    const closeRAModal = () => {
        setRAModalVisible(false);
        setSelectedRA(null);
    };

    const openNotesModal = (Notes) => {
        setSelectedNotes(Notes);
        setNotesModalVisible(true);
    };

    const closeNotesModal = () => {
        setNotesModalVisible(false);
        setSelectedNotes(null);
    };

    const openAPModal = (AP) => {
        setSelectedAP(AP);
        setAPModalVisible(true);
    };

    const closeAPModal = () => {
        setAPModalVisible(false);
        setSelectedAP(null);
    };

    const [payments, setPayments] = useState([
        {
            method: null,
            amount: '',
            date: null,
            reference: '',
        },
    ]);

    const handleAddPayment = () => {
        setPayments([
            ...payments,
            {
                method: null,
                amount: '',
                date: null,
                reference: '',
            },
        ]);
    };

    const methodoptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
    ];

    const handleChange = (index, field, value) => {
        const updatedPayments = [...payments];
        updatedPayments[index][field] = value;
        setPayments(updatedPayments);
    };

    return (
        <div className="mt-4 px-3">
            <div className="col-12 small">
                <label htmlFor="name" className="form-label mb-1 fw-semibold">
                    Name
                </label>
                <input type="text" id="name" className="form-control" disabled />
            </div>
            <div className="col-12 mt-3 small">
                <label htmlFor="phone" className="form-label mb-1 fw-semibold">
                    Phone
                </label>
                <input type="text" id="phone" className="form-control" disabled />
            </div>
            <div className="col-12 my-3">
                <label htmlFor="phone" className="form-label mb-1">
                    Products
                </label>

                <div className="d-flex gap-2 raw col-12 flex-wrap">
                    <div className="col-5 col-md-2">
                        <label htmlFor="ProductSKU" className="form-label mb-1 fw-semibold">
                            Product SKU
                        </label>
                        <input type="text" id="ProductSKU" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="Barcode" className="form-label mb-1 fw-semibold">
                            Barcode
                        </label>
                        <input type="text" id="Barcode" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="MRP" className="form-label mb-1 fw-semibold">
                            MRP
                        </label>
                        <input type="text" id="MRP" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="SRP" className="form-label mb-1 fw-semibold">
                            SRP
                        </label>
                        <input type="text" id="SRP" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="Discount" className="form-label mb-1 fw-semibold">
                            Discount
                        </label>
                        <input type="text" id="Discount" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="TaxRate" className="form-label mb-1 fw-semibold">
                            Tax Rate
                        </label>
                        <input type="text" id="TaxRate" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="TaxAmount" className="form-label mb-1 fw-semibold">
                            Tax Amount
                        </label>
                        <input type="text" id="TaxAmount" className="form-control" disabled />
                    </div>
                    <div className="col-5 col-md-2">
                        <label htmlFor="TotalAmount" className="form-label mb-1 fw-semibold">
                            Total Amount
                        </label>
                        <input type="text" id="TotalAmount" className="form-control" disabled />
                    </div>
                </div>

                <div className="row g-3 mt-4">
                    {[
                        { label: "Total Quantity", id: "TotalQuantity", disabled: true },
                        { label: "Total Amount", id: "TotalAmount", disabled: true },
                        { label: "Total Tax", id: "TotalTax", disabled: true },
                        { label: "Total Discount", id: "TotalDiscount", disabled: true },
                        { label: "Coupon Discount", id: "CouponDiscount", disabled: true },
                        { label: "Flat Discount", id: "FlatDiscount", disabled: false },
                        { label: "Net Discount", id: "NetDiscount", disabled: true },
                        { label: "Delivery Charges", id: "DeliveryCharges", disabled: false },
                        { label: "Other Charges", id: "OtherCharges", disabled: false },
                        { label: "Net Amount", id: "NetAmount", disabled: true },
                    ].map((item, idx) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={idx}>
                            <div className="d-flex align-items-center">
                                <label htmlFor={item.id} className="form-label mb-0 me-2 fw-semibold" style={{ width: "50%" }}>
                                    {item.label}
                                </label>
                                <input
                                    type="text"
                                    id={item.id}
                                    className="form-control"
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
                    <input type="text" id="notes" className="form-control" />
                </div>

                <div className="col-12 mt-3 gap-2">
                    <div className="align-items-center d-flex">

                        <label htmlFor="" className="form-label mb-1">
                            Received Amount
                        </label>
                        <button className="btn text-primary border-secondary-subtle ms-2"
                            onClick={handleAddPayment}>
                            Add
                        </button>
                    </div>

                    {payments.map((payment, index) => (
                        <>
                            <div className="row g-3 mt-0 mb-4 justify-content-between" key={index}>
                                {/* Grouped First 3 Inputs */}
                                <div className="col-12 col-md-8">
                                    <div className="row px-0">
                                        <div className="col-4 col-md-3">
                                            <Select
                                                options={methodoptions}
                                                value={payment.method}
                                                onChange={(selectedOption) =>
                                                    handleChange(index, 'method', selectedOption)
                                                }
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                        </div>

                                        <div className="col-4 col-md-4">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Amount"
                                                value={payment.amount}
                                                onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-4 col-md-3">
                                            <DatePicker
                                                selected={payment.date}
                                                onChange={(date) => handleChange(index, 'date', date)}
                                                className="form-control"
                                                dateFormat="yyyy-MM-dd"
                                                isClearable
                                                autoComplete="off"
                                                placeholderText="Select Date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reference Field Alone */}
                                <div className="col-12 col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Reference"
                                        value={payment.reference}
                                        onChange={(e) => handleChange(index, 'reference', e.target.value)}
                                    />
                                </div>
                            </div>
                            {index !== payments.length - 1 && (
                                <div className="w-100 text-center my-2">
                                    <hr style={{ borderTop: "1px solid #ced4da", opacity: 0.6, margin: 0 }} />
                                </div>
                            )}
                        </>
                    ))}

                    <button className="btn btn-primary">Submit</button>
                </div>


            </div>
        </div>
    );
}

export default ShopProcessEdit;
