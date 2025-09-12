import React, { useState } from 'react'
import { FaAngleDown, FaAngleRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import BillModel from "../../components/Process/BillModel";
import CustomerNameModal from './Vendor/CustomerNameModal';

export default function SalesCommanModel({ loading, tabLoading, tableData, activeStatus, openRAModal, openNotesModal, toggleSplit, expandedRows, handleDeleteSale, openAPModal, openBillInNewTab, productTableData }) {

    const navigate = useNavigate();

    const [BillModalVisible, setBillModalVisible] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const openBillModal = (row) => {
        setSelectedBill(row.fullSale);
        setBillModalVisible(true);
    };

    const closeBillModal = () => {
        setBillModalVisible(false);
        setSelectedBill(null);
    };

    const openCustomerNameModal = (row) => {
        setSelectedRow(row.fullSale);
        setShowCustomerModal(true);
    };

    const closeCustomerNameModal = () => {
        setShowCustomerModal(false);
        setSelectedRow(null);
    };

    return (<>
        <div className="table-responsive overflow-x-auto">
            {loading || tabLoading ? (
                <div
                    style={{
                        width: "100%",
                        height: "300px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div className="spinner-border m-5" role="status">
                        <span className="sr-only"></span>
                    </div>
                </div>
            ) : tableData.length === 0 ? (
                <div
                    style={{
                        width: "100%",
                        height: "300px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <p>No data available for {activeStatus} status.</p>
                </div>
            ) : (
                <table
                    className="table"
                    style={{ minWidth: "900px", borderCollapse: "collapse" }}
                >
                    <thead>
                        <tr>
                            {activeStatus === "Returned"
                                ? [
                                    "DATE",
                                    "CUSTOMER NAME",
                                    "PHONE",
                                    "TOTAL ITEMS",
                                    "RECEIVED AMOUNT",
                                    "",
                                ]
                                : [
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
                            <React.Fragment key={row._id}>
                                <tr style={{ borderTop: "1px solid #dee2e6" }}>
                                    <td
                                        style={{
                                            minWidth: "100px",
                                            paddingTop: "12px",
                                            paddingBottom: "12px",
                                        }}
                                    >
                                        {row.date}
                                    </td>
                                    {activeStatus !== "Returned" && (
                                        <>
                                            <td
                                                style={{
                                                    minWidth: "110px",
                                                    cursor: "pointer",

                                                    textDecoration: "underline",
                                                }}
                                                className="common-text-color"
                                                onClick={() => openBillModal(row)}
                                            >
                                                {row.billNumber}
                                            </td>
                                            <td
                                                style={{
                                                    minWidth: "160px",
                                                    cursor: "pointer",

                                                    textDecoration: "underline",
                                                }}
                                                className="common-text-color"
                                                onClick={() => openCustomerNameModal(row)}
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

                                                    textDecoration: "underline",
                                                }}
                                                className="common-text-color"
                                                onClick={() => openRAModal(row)}
                                            >
                                                {row.receivedAmount}
                                            </td>
                                            <td
                                                style={{
                                                    minWidth: "100px",
                                                    paddingTop: "12px",
                                                    paddingBottom: "12px",
                                                    color:
                                                        Number(row.remainingAmount) === 0
                                                            ? "black"
                                                            : "red",
                                                }}
                                            >
                                                {row.remainingAmount}
                                            </td>
                                            <td
                                                style={{
                                                    minWidth: "150px",
                                                    maxWidth: "150px",
                                                    cursor: "pointer",

                                                    textDecoration: "underline",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                }}
                                                className="common-text-color"
                                                onClick={() => openNotesModal(row)}
                                            >
                                                {row.notes === "N/A" ? "--------" : row.notes}
                                            </td>
                                        </>
                                    )}
                                    {activeStatus === "Returned" && (
                                        <>
                                            <td style={{ minWidth: "160px" }}>
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
                                            <td style={{ minWidth: "150px" }}>
                                                {row.receivedAmount}
                                            </td>
                                        </>
                                    )}
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
                                    {activeStatus !== "Returned" && (
                                        <td className="text-center align-middle">
                                            {activeStatus === "Pending" && (
                                                <div className="d-flex flex-column align-items-center justify-content-center">
                                                    <button
                                                        className="btn btn-sm btn-danger border px-0 py-2 mb-2"
                                                        style={{ minWidth: "60px", width: "80px" }}
                                                        onClick={() => handleDeleteSale(row._id)}
                                                        disabled={loading}
                                                    >
                                                        {loading ? "Deleting..." : "Delete"}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm border  py-2 mb-2"
                                                        style={{ minWidth: "80px" }}
                                                        onClick={() => openAPModal(row)}
                                                    >
                                                        Assign Power
                                                    </button>
                                                    <button
                                                        className="btn btn-sm border px-2 py-2"
                                                        style={{ minWidth: "60px", width: "80px" }}
                                                        onClick={() => openBillInNewTab(row)}
                                                    >
                                                        View Bill
                                                    </button>
                                                </div>
                                            )}
                                            {activeStatus === "In Process" && (
                                                <button
                                                    className="btn btn-sm border px-2 py-2"
                                                    style={{ minWidth: "60px", width: "80px" }}
                                                    onClick={() => openBillInNewTab(row)}
                                                >
                                                    View Bill
                                                </button>
                                            )}
                                            {(activeStatus === "Ready" ||
                                                activeStatus === "Delivered") && (
                                                    <div className="d-flex flex-column align-items-center justify-content-center">
                                                        <button
                                                            className="btn btn-sm border px-2 py-2 mb-2 btn-primary"
                                                            style={{ minWidth: "40px", width: "60px" }}
                                                            onClick={() =>
                                                                navigate(`/process/shop/${row._id}`)
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm border px-2 py-2"
                                                            style={{ minWidth: "60px", width: "80px" }}
                                                            onClick={() => openBillInNewTab(row)}
                                                        >
                                                            View Bill
                                                        </button>
                                                    </div>
                                                )}
                                        </td>
                                    )}
                                </tr>
                                {expandedRows.includes(index) && (
                                    <tr>
                                        <td
                                            colSpan={activeStatus === "Returned" ? 6 : 10}
                                            className="p-0"
                                        >
                                            <div className="table-responsive overflow-x-auto">
                                                <table className="table mb-0">
                                                    <thead>
                                                        <tr className="small fw-semibold text-primary-emphasis bg-light">
                                                            {activeStatus !== "Returned" ? (
                                                                <>
                                                                    <th className="py-3 px-2">Select</th>
                                                                    <th className="py-3 px-2">Product Sku</th>
                                                                    <th className="py-3 px-2">Lens Sku</th>
                                                                    <th className="py-3 px-2">Status</th>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <th className="py-3 px-2">Sr No.</th>
                                                                    <th className="py-3 px-2">Product Sku</th>
                                                                    <th className="py-3 px-2">Barcode</th>
                                                                    <th className="py-3 px-2">Srp</th>
                                                                </>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {productTableData
                                                            .filter((prod) => prod.saleId === row._id)
                                                            .map((prodRow, prodIndex) => (
                                                                <tr key={prodRow.id}>
                                                                    {activeStatus !== "Returned" ? (
                                                                        <>
                                                                            <td>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    style={{
                                                                                        width: "20px",
                                                                                        height: "20px",
                                                                                    }}
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
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td style={{ minWidth: "110px" }}>
                                                                                {prodIndex + 1}
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
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {BillModalVisible && selectedBill && (
            <BillModel
                selectedBill={selectedBill}
                closeBillModal={closeBillModal}
            />
        )}
        {showCustomerModal && selectedRow && (
            <CustomerNameModal
                show={showCustomerModal}
                onHide={closeCustomerNameModal}
                selectedRow={selectedRow}
            />
        )}
    </>
    )
}
