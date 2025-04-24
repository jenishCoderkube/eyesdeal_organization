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
import { useNavigate } from "react-router-dom";
import CustomerNameModal from "../../components/Process/Vendor/CustomerNameModal";

function ShopProcess() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeStatus, setActiveStatus] = useState("Pending");
  const [expandedRows, setExpandedRows] = useState([]);
  const [BillModalVisible, setBillModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] =
    useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [RAModalVisible, setRAModalVisible] = useState(false);
  const [selectedRA, setSelectedRA] = useState(null);
  const [NotesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [APModalVisible, setAPModalVisible] = useState(false);
  const [selectedAP, setSelectedAP] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const statuses = ["Pending", "In Process", "Ready", "Delivered", "Returned"];

  const [productTableData, setProductTableData] = useState([
    {
      id: 1,
      selected: false,
      productSku: "PROD-001",
      lensSku: "LENS-A1",
      status: "Pending",
      barcode: "100231",
      srp: "1000",
    },
    {
      id: 2,
      selected: true,
      productSku: "PROD-002",
      lensSku: "LENS-B2",
      status: "Ready",
      barcode: "60001",
      srp: "2000",
    },
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
    },
  ];

  const toggleSplit = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelect = (id) => {
    setProductTableData((prev) =>
      prev.map((row) =>
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
    setSelectedRow(cust);
    setShowCustomerModal(true);
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

  return (
    <div className="mt-4 px-3">
      <div className="row g-1 align-items-end">
        <div className="col-12 col-md-6 d-flex flex-nowrap gap-3 align-items-end pe-3">
          {/* Start Date */}
          <div className="col-6 col-md-4">
            <label htmlFor="startDate" className="form-label font-weight-600">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              isClearable
              autoComplete="off"
            />
          </div>

          {/* End Date */}
          <div className="col-6 col-md-4">
            <label htmlFor="endDate" className="form-label font-weight-600">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              isClearable
              autoComplete="off"
            />
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="row g-3 align-items-end">
            {/* Search */}
            <div className="col-6">
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search..."
              />
            </div>

            {/* Dropdown */}
            <div className="col-6">
              <label className="form-label font-weight-600">Stores</label>
              <Select
                options={options}
                value={selectedOption}
                onChange={setSelectedOption}
                isMulti
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary mt-4">Submit</button>

      {/* Status Tabs */}
      <div className="overflow-x-auto mt-4">
        <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`bg-transparent border-0 pb-2 px-1 fw-medium 
                                    ${
                                      activeStatus === status
                                        ? "text-primary border-bottom border-primary"
                                        : "text-secondary"
                                    } 
                                    hover:text-dark focus:outline-none`}
              style={{ boxShadow: "none", outline: "none" }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Separator Line */}
      <div
        className="border-bottom"
        style={{ margin: "-9px 0px 33px 0px" }}
      ></div>

      {activeStatus === "Returned" ? (
        <>
          {/* Table */}
          <div className="table-responsive overflow-x-auto">
            <table
              className="table"
              style={{ minWidth: "900px", borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  className="text-white small"
                  style={{ backgroundColor: "#64748b" }}
                >
                  {[
                    "DATE",
                    "CUSTOMER NAME",
                    "PHONE",
                    "TOTAL ITEMS",
                    "RECEIVED AMOUNT",
                    "",
                  ].map((heading, idx) => (
                    <th
                      key={idx}
                      className="border-top border-bottom text-uppercase small fw-semibold"
                      style={{
                        backgroundColor: "#f2f7fc",
                        color: "#64748b",
                        padding: "12px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <>
                    <tr key={index} style={{ borderTop: "1px solid #dee2e6" }}>
                      <td
                        style={{
                          minWidth: "100px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.date}
                      </td>
                      <td style={{ minWidth: "160px" }}>{row.customerName}</td>
                      <td
                        style={{
                          minWidth: "102px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.phone}
                      </td>
                      <td
                        style={{
                          minWidth: "105px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.totalItems}
                      </td>
                      <td style={{ minWidth: "150px" }}>
                        {row.receivedAmount}
                      </td>
                      <td
                        style={{
                          minWidth: "20px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                        onClick={() => toggleSplit(index)}
                      >
                        {expandedRows.includes(index) ? (
                          <FaAngleDown />
                        ) : (
                          <FaAngleRight />
                        )}
                      </td>

                      {activeStatus === "Pending" && (
                        <>
                          <td className="text-center align-middle">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <button
                                className="btn btn-sm btn-danger border px-0 py-2 mb-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                Delete
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2 mb-2"
                                style={{ minWidth: "80px", width: "100px" }}
                                onClick={() => openAPModal(row)}
                              >
                                Assign Power
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                View Bill
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {activeStatus === "In Process" && (
                        <>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-sm border px-2 py-2"
                              style={{ minWidth: "60px", width: "80px" }}
                            >
                              View Bill
                            </button>
                          </td>
                        </>
                      )}

                      {(activeStatus === "Ready" ||
                        activeStatus === "Delivered") && (
                        <>
                          <td className="text-center align-middle">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <button
                                className="btn btn-sm border px-2 py-2 mb-2 btn-primary"
                                style={{ minWidth: "40px", width: "60px" }}
                                // onClick={() => openAPModal(row)}
                                onClick={() => navigate("/process/shop/id")}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                View Bill
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Expanded product table row */}
                    {expandedRows.includes(index) && (
                      <tr>
                        <td colSpan="10" className="p-0">
                          <div className="table-responsive overflow-x-auto">
                            <table className="table mb-0">
                              <thead>
                                <tr className="small fw-semibold text-primary-emphasis bg-light">
                                  <th className="py-3 px-2">Sr No.</th>
                                  <th className="py-3 px-2">Product Sku</th>
                                  <th className="py-3 px-2">Barcode</th>
                                  <th className="py-3 px-2">Srp</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productTableData.map((prodRow, prodIndex) => (
                                  <tr key={prodIndex}>
                                    <td style={{ minWidth: "110px" }}>
                                      {prodRow.id}
                                    </td>
                                    <td style={{ minWidth: "110px" }}>
                                      {prodRow.productSku}
                                    </td>
                                    <td style={{ minWidth: "200px" }}>
                                      {prodRow.barcode}
                                    </td>
                                    <td style={{ minWidth: "70px" }}>
                                      {prodRow.srp}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}

                {BillModalVisible && selectedBill && (
                  <BillModel
                    selectedBill={selectedBill}
                    closeBillModal={closeBillModal}
                  />
                )}

                {PrescriptionModelVisible && selectedCust && (
                  <PrescriptionModel
                    closePrescriptionModel={closePrescriptionModel}
                  />
                )}

                {RAModalVisible && selectedRA && (
                  <RAModel closeRAModal={closeRAModal} />
                )}

                {NotesModalVisible && selectedNotes && (
                  <NotesModel closeNotesModal={closeNotesModal} />
                )}

                {APModalVisible && selectedAP && (
                  <AssignPowerModel closeAPModal={closeAPModal} />
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Table */}
          <div className="table-responsive overflow-x-auto">
            <table
              className="table"
              style={{ minWidth: "900px", borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  className="text-white small"
                  style={{ backgroundColor: "#64748b" }}
                >
                  {[
                    "DATE",
                    "BILL NUMBER",
                    "CUSTOMER NAME",
                    "PHONE",
                    "TOTAL ITEMS",
                    "RECEIVED AMOUNT",
                    "REMAINING AMOUNT",
                    "NOTES",
                    "",
                    "ACTION",
                  ].map((heading, idx) => (
                    <th
                      key={idx}
                      className="border-top border-bottom text-uppercase small fw-semibold"
                      style={{
                        backgroundColor: "#f2f7fc",
                        color: "#64748b",
                        padding: "12px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <>
                    <tr key={index} style={{ borderTop: "1px solid #dee2e6" }}>
                      <td
                        style={{
                          minWidth: "100px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.date}
                      </td>
                      <td
                        style={{
                          minWidth: "110px",
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                        onClick={() => openBillModal(row)}
                      >
                        {row.billNumber}
                      </td>
                      <td
                        style={{
                          minWidth: "160px",
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                        onClick={() => openPrescriptionModel(row)}
                      >
                        {row.customerName}
                      </td>
                      <td
                        style={{
                          minWidth: "102px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.phone}
                      </td>
                      <td
                        style={{
                          minWidth: "105px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.totalItems}
                      </td>
                      <td
                        style={{
                          minWidth: "150px",
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                        onClick={() => openRAModal(row)}
                      >
                        {row.receivedAmount}
                      </td>
                      <td
                        style={{
                          minWidth: "165px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.remainingAmount}
                      </td>
                      <td
                        style={{
                          minWidth: "450px",
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                        onClick={() => openNotesModal(row)}
                      >
                        {row.notes}
                      </td>
                      <td
                        style={{
                          minWidth: "20px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                        onClick={() => toggleSplit(index)}
                      >
                        {expandedRows.includes(index) ? (
                          <FaAngleDown />
                        ) : (
                          <FaAngleRight />
                        )}
                      </td>

                      {activeStatus === "Pending" && (
                        <>
                          <td className="text-center align-middle">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <button
                                className="btn btn-sm btn-danger border px-0 py-2 mb-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                Delete
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2 mb-2"
                                style={{ minWidth: "80px", width: "100px" }}
                                onClick={() => openAPModal(row)}
                              >
                                Assign Power
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                View Bill
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {activeStatus === "In Process" && (
                        <>
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-sm border px-2 py-2"
                              style={{ minWidth: "60px", width: "80px" }}
                            >
                              View Bill
                            </button>
                          </td>
                        </>
                      )}

                      {(activeStatus === "Ready" ||
                        activeStatus === "Delivered") && (
                        <>
                          <td className="text-center align-middle">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <button
                                className="btn btn-sm border px-2 py-2 mb-2 btn-primary"
                                style={{ minWidth: "40px", width: "60px" }}
                                // onClick={() => openAPModal(row)}
                                onClick={() => navigate("/process/shop/id")}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm border px-2 py-2"
                                style={{ minWidth: "60px", width: "80px" }}
                              >
                                View Bill
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Expanded product table row */}
                    {expandedRows.includes(index) && (
                      <tr>
                        <td colSpan="10" className="p-0">
                          <div className="table-responsive overflow-x-auto">
                            <table className="table mb-0">
                              <thead>
                                <tr className="small fw-semibold text-primary-emphasis bg-light">
                                  <th className="py-3 px-2">Select</th>
                                  <th className="py-3 px-2">Product Sku</th>
                                  <th className="py-3 px-2">Lens Sku</th>
                                  <th className="py-3 px-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productTableData.map((prodRow, prodIndex) => (
                                  <tr key={prodIndex}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={prodRow.selected}
                                        onChange={() =>
                                          handleSelect(prodRow.id)
                                        }
                                      />
                                    </td>
                                    <td style={{ minWidth: "110px" }}>
                                      {prodRow.productSku}
                                    </td>
                                    <td style={{ minWidth: "200px" }}>
                                      {prodRow.lensSku}
                                    </td>
                                    <td style={{ minWidth: "70px" }}>
                                      {prodRow.status}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}

                {BillModalVisible && selectedBill && (
                  <BillModel
                    selectedBill={selectedBill}
                    closeBillModal={closeBillModal}
                  />
                )}

                {showCustomerModal && (
                  <CustomerNameModal
                    show={showCustomerModal}
                    onHide={() => setShowCustomerModal(false)}
                    // selectedRow={selectedRow}
                    // onSubmit={handleVendorNoteSubmit}
                  />
                )}

                {RAModalVisible && selectedRA && (
                  <RAModel closeRAModal={closeRAModal} />
                )}

                {NotesModalVisible && selectedNotes && (
                  <NotesModel closeNotesModal={closeNotesModal} />
                )}

                {APModalVisible && selectedAP && (
                  <AssignPowerModel closeAPModal={closeAPModal} />
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ShopProcess;
