import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "react-toastify";
import CustomerNameModal from "../../components/Process/Vendor/CustomerNameModal";
import PreviousNotesModel from "../../components/ReCall/PreviousNotesModel";
import WhatsAppModal from "../../components/ReCall/WhatsAppModal";
import UpdateRecallNoteModel from "../../components/ReCall/UpdateRecallNoteModel";
import ReactPaginate from "react-paginate";
import { recallService } from "../../services/recallService";
import { useRecallByStore } from "../../hooks/useRecallByStore";
// Validate recall data
const validateRecallData = (recall) => {
  if (!recall?._id) return false;
  if (!recall?.salesId) return false;
  if (!recall.salesId.createdAt) return false;
  if (!recall.salesId.customerName) return false;
  if (!recall.salesId.customerPhone) return false;
  if (
    recall.salesId.netAmount === undefined ||
    recall.salesId.netAmount === null
  )
    return false;
  if (!recall.recallDate) return false;
  if (!Array.isArray(recall.salesId.orders)) return false;
  return true;
};

function RecallReportCom() {
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [recallNoteModal, setRecallNoteModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const storeId = user?.stores?.[0];
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // can keep fixed limit
  const { data, isLoading, isError } = useRecallByStore(storeId, page, limit);
  const isMounted = useRef(false); // Track component mount status
  const isFetching = useRef(false); // Track API call in progress

  const pagination = {
    totalDocs: data?.data?.totalDocs || 0,
    totalPages: data?.data?.totalPages || 1,
    page,
    limit,
  };
  const tableData =
    data?.data?.docs?.filter(validateRecallData).map((recall) => ({
      _id: recall._id,
      lastInvoiceDate: new Date(recall.salesId.createdAt).toLocaleDateString(
        "en-GB"
      ),
      customerName: recall.salesId.customerName,
      customerNumber: recall.salesId.customerPhone,
      totalInvoiceValue: recall.salesId.netAmount,
      recallDate: new Date(recall.recallDate).toLocaleDateString("en-GB"),
      notes: recall.salesId.note || "View Notes",
      orders: recall.salesId.orders.map((order, index) => ({
        id: `${recall._id}-${index + 1}`,
        productSku: order.product?.sku || "N/A",
        lensSku: order.lens?.sku || "N/A",
        status: order.status || "N/A",
        leftLens: order?.leftLens?.displayName || "N/A",
        rightLens: order?.rightLens?.displayName || "N/A",
      })),
      fullSale: recall.salesId,
      updateNotes: recall?.updateNotes || "",
      rescheduleNotes: recall?.rescheduleNotes || "",
      recallStatus: recall?.recallStatus || "N/A",
    })) || [];
  const fetchData = async (storeId) => {
    console.log("storeid<<<", storeId, {
      page: pagination.page,
      limit: pagination.limit,
    });
    if (isFetching.current) {
      console.log("Skipping API call: already fetching");
      return;
    }

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await recallService.getRecallByStore(
        storeId,
        pagination.page,
        pagination.limit
      );

      if (response.success) {
        const recalls = response.data?.docs || [];
        const validRecalls = recalls.filter(validateRecallData);

        setTableData(
          validRecalls.map((recall) => ({
            _id: recall._id,
            lastInvoiceDate: new Date(recall.salesId.createdAt)
              .toLocaleDateString("en-GB")
              .split("/")
              .join("/"),
            customerName: recall.salesId.customerName,
            customerNumber: recall.salesId.customerPhone,
            totalInvoiceValue: recall.salesId.netAmount,
            recallDate: new Date(recall.recallDate)
              .toLocaleDateString("en-GB")
              .split("/")
              .join("/"),
            notes: recall.salesId.note || "View Notes",
            orders: recall.salesId.orders.map((order, index) => ({
              id: `${recall._id}-${index + 1}`,
              productSku: order.product?.sku || "N/A",
              lensSku: order.lens?.sku || "N/A",
              status: order.status || "N/A",
              leftLens: order?.leftLens?.displayName || "N/A",
              rightLens: order?.rightLens?.displayName || "N/A",
            })),
            fullSale: recall.salesId,
            updateNotes: recall?.updateNotes || "",
            rescheduleNotes: recall?.rescheduleNotes || "",
            recallStatus: recall?.recallStatus || "N/A",
          }))
        );

        setPagination((prev) => ({
          ...prev,
          totalDocs: response.data.totalDocs || 0,
          totalPages: response.data.totalPages || 1,
          // Only update page if explicitly needed, e.g., if API corrects it
        }));
      } else {
        setError(response.message || "Failed to fetch recall data");
        toast.error(response.message || "Failed to fetch recall data");
        setTableData([]);
      }
    } catch (error) {
      const errorMessage = error.message || "Error fetching recall data";
      setError(errorMessage);
      toast.error(errorMessage);
      setTableData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };
  const toggleSplit = useCallback((index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const openNotesModal = useCallback((row) => {
    if (!row) {
      toast.error("Invalid row data for notes");
      return;
    }
    setSelectedNotes(row);
    setNotesModalVisible(true);
  }, []);

  const closeNotesModal = useCallback(() => {
    setNotesModalVisible(false);
    setSelectedNotes(null);
  }, []);

  const openCustomerNameModal = useCallback((row) => {
    if (!row?.fullSale) {
      toast.error("Invalid row data for customer modal");
      return;
    }
    setSelectedRow(row.fullSale);
    setShowCustomerModal(true);
  }, []);

  const closeCustomerNameModal = useCallback(() => {
    setShowCustomerModal(false);
    setSelectedRow(null);
  }, []);

  const openWhatsAppModal = useCallback((row) => {
    if (!row) {
      toast.error("Invalid row data for WhatsApp modal");
      return;
    }
    setSelectedRow(row);
    setShowWhatsAppModal(true);
  }, []);

  const closeWhatsAppModal = useCallback(() => {
    setShowWhatsAppModal(false);
    setSelectedRow(null);
  }, []);

  const openRecallNoteModal = useCallback((row) => {
    if (!row) {
      toast.error("Invalid row data for recall note modal");
      return;
    }
    setSelectedRow(row);
    setRecallNoteModal(true);
  }, []);

  const closeRecallNoteModal = useCallback(() => {
    setRecallNoteModal(false);
    setSelectedRow(null);
  }, []);

  const handlePageChange = ({ selected }) => {
    setPage(selected + 1); // ReactPaginate uses 0-based index
  };

  return (
    <div className="mt-4 max-width-90 mx-auto px-3">
      <style>
        {`
          .pagination {
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 20px;
          }
          .pagination .page-item {
            margin: 0;
          }
          .pagination .page-link {
            border: 1px solid #dee2e6;
            color: #495057;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
            cursor: pointer;
            background-color: #fff;
          }
          .pagination .page-link:hover {
            background-color: #e9ecef;
            border-color: #ced4da;
          }
          .pagination .active .page-link {
            background-color: #007bff;
            border-color: #007bff;
            color: white;
          }
          .pagination .disabled .page-link {
            color: #6c757d;
            cursor: not-allowed;
            background-color: #f8f9fa;
          }
          .pagination .break-link {
            cursor: default;
            background-color: transparent;
            border: none;
          }
          .error-message {
            color: #dc3545;
            text-align: center;
            padding: 20px;
            background-color: #f8d7da;
            border-radius: 4px;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
            width: 100%;
          }
        `}
      </style>
      <div className="table-responsive overflow-x-auto">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="loading-container">
            <p>No valid recall data available.</p>
          </div>
        ) : (
          <>
            <table
              className="table"
              style={{ minWidth: "900px", borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  className="text-uppercase small fw-semibold"
                  style={{ backgroundColor: "#f8fafc", color: "#64748b" }}
                >
                  <th className="py-3 px-2">Last Invoice Date</th>
                  <th className="py-3 px-2">Customer Name</th>
                  <th className="py-3 px-2">Customer Number</th>
                  <th className="py-3 px-2">Total Invoice Value</th>
                  <th className="py-3 px-2">Recall Date</th>
                  <th className="py-3 px-2">Previous Notes</th>
                  <th className="py-3 px-2"></th>
                  <th className="py-3 px-2">Action</th>
                  <th className="py-3 px-2">Chat</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <React.Fragment key={row._id}>
                    <tr style={{ borderTop: "1px solid #dee2e6" }}>
                      <td className="py-3 px-2">{row.lastInvoiceDate}</td>
                      <td
                        className="py-3 px-2 text-primary text-decoration-underline cursor-pointer"
                        onClick={() => openCustomerNameModal(row)}
                      >
                        {row.customerName}
                      </td>
                      <td className="py-3 px-2">{row.customerNumber}</td>
                      <td className="py-3 px-2 text-primary">
                        {row.totalInvoiceValue}
                      </td>
                      <td className="py-3 px-2">{row.recallDate}</td>
                      <td
                        className="py-3 px-2 text-primary text-decoration-underline cursor-pointer"
                        onClick={() => openNotesModal(row)}
                      >
                        {row.notes}
                      </td>
                      <td
                        className="py-3 px-2 text-center cursor-pointer"
                        onClick={() => toggleSplit(index)}
                      >
                        {expandedRows.includes(index) ? (
                          <FaAngleDown />
                        ) : (
                          <FaAngleRight />
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ minWidth: "80px" }}
                            onClick={() => openRecallNoteModal(row)}
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ minWidth: "80px" }}
                          >
                            Reschedule
                          </button>
                        </div>
                      </td>
                      <td
                        className="py-3 px-2 cursor-pointer"
                        onClick={() => openWhatsAppModal(row)}
                      >
                        <FaWhatsapp size={30} color="green" />
                      </td>
                    </tr>
                    {expandedRows.includes(index) && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <div className="table-responsive overflow-x-auto">
                            <table className="table mb-0">
                              <thead>
                                <tr className="small fw-semibold text-primary-emphasis bg-light">
                                  <th className="py-3 px-2">Product SKU</th>
                                  <th className="py-3 px-2">Right Lens Sku</th>
                                  <th className="py-3 px-2">Left Lens Sku</th>
                                  <th className="py-3 px-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.orders.map((order) => (
                                  <tr key={order.id}>
                                    <td className="py-3 px-2">
                                      {order.productSku}
                                    </td>
                                    <td className="py-3 px-2">
                                      {order.rightLens}
                                    </td>
                                    <td className="py-3 px-2">
                                      {order.leftLens}
                                    </td>
                                    <td className="py-3 px-2">
                                      {order.status}
                                    </td>
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
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4">
              <div className="text-sm mb-3 mb-sm-0">
                Showing{" "}
                <span className="fw-bold">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                –{" "}
                <span className="fw-bold">
                  {Math.min(
                    (pagination.page - 1) * pagination.limit + tableData.length,
                    pagination.totalDocs
                  )}
                </span>{" "}
                of <span className="fw-bold">{pagination.totalDocs}</span>{" "}
                results
              </div>

              <ReactPaginate
                previousLabel="← Previous"
                nextLabel="Next →"
                pageCount={pagination.totalPages}
                onPageChange={handlePageChange}
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
                disabledClassName="disabled"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link break-link"
                forcePage={pagination.page - 1}
              />
            </div>
          </>
        )}
      </div>

      {notesModalVisible && selectedNotes && (
        <PreviousNotesModel
          closeNotesModal={closeNotesModal}
          selectedNotes={selectedNotes}
        />
      )}
      {showCustomerModal && selectedRow && (
        <CustomerNameModal
          show={showCustomerModal}
          onHide={closeCustomerNameModal}
          selectedRow={selectedRow}
        />
      )}
      {showWhatsAppModal && selectedRow && (
        <WhatsAppModal
          closeModal={closeWhatsAppModal}
          selectedRow={selectedRow}
        />
      )}
      {recallNoteModal && selectedRow && (
        <UpdateRecallNoteModel
          closeModal={closeRecallNoteModal}
          selectedRecall={selectedRow}
        />
      )}
    </div>
  );
}

export default RecallReportCom;
