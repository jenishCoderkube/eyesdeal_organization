import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "react-toastify";
import CustomerNameModal from "../../components/Process/Vendor/CustomerNameModal";
import PreviousNotesModel from "../../components/ReCall/PreviousNotesModel";
import WhatsAppModal from "../../components/ReCall/WhatsAppModal";
import UpdateRecallNoteModel from "../../components/ReCall/UpdateRecallNoteModel";
import RescheduleRecallDateModal from "../../components/ReCall/RescheduleRecallDateModal";
import ReactPaginate from "react-paginate";
import { recallService } from "../../services/recallService";

// Debounce function to limit API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Validate recall data to ensure required fields are present
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
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [recallNoteModal, setRecallNoteModal] = useState(false);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  const lastFetchParams = useRef(null);
  const debouncedFetchRef = useRef(null);

  // Initialize debounced fetch function once
  useEffect(() => {
    debouncedFetchRef.current = debounce(async (storeId, page, limit) => {
      const callKey = JSON.stringify({ store: storeId, page, limit });

      if (lastFetchParams.current === callKey) {
        console.log("Skipping duplicate API call:", callKey);
        return;
      }

      console.log("Fetching data with params:", callKey);
      setLoading(true);
      lastFetchParams.current = callKey;

      try {
        const response = await recallService.getRecallByStore(
          storeId,
          page,
          limit
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
          if (response.data.page !== pagination.page) {
            setPagination({
              totalDocs: response.data.totalDocs || 0,
              totalPages: response.data.totalPages || 1,
              page: response.data.page || page,
              limit: response.data.limit || limit,
            });
          }
        } else {
          console.error("API error:", response.message);
          toast.error(response.message);
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching recall data:", error);
        toast.error("Error fetching recall data");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Fetch data when storeId, page, or limit changes
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storeId = user?.stores[0];
    if (storeId && debouncedFetchRef.current) {
      debouncedFetchRef.current(storeId, pagination.page, pagination.limit);
    } else {
      console.warn("No storeId or debouncedFetchRef available");
      toast.error("Unable to fetch data: No store ID found");
    }
  }, [pagination.page]);

  const toggleSplit = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openNotesModal = (row) => {
    if (!row) {
      toast.error("Invalid row data for notes");
      return;
    }
    setSelectedNotes(row);
    setNotesModalVisible(true);
  };

  const closeNotesModal = () => {
    setNotesModalVisible(false);
    setSelectedNotes(null);
  };

  const openCustomerNameModal = (row) => {
    if (!row?.fullSale) {
      toast.error("Invalid row data for customer modal");
      return;
    }
    setSelectedRow(row.fullSale);
    setShowCustomerModal(true);
  };

  const closeCustomerNameModal = () => {
    setShowCustomerModal(false);
    setSelectedRow(null);
  };

  const openWhatsAppModal = (row) => {
    if (!row) {
      toast.error("Invalid row data for WhatsApp modal");
      return;
    }
    setSelectedRow(row);
    setShowWhatsAppModal(true);
  };

  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedRow(null);
  };

  const openRecallNoteModal = (row) => {
    if (!row) {
      toast.error("Invalid row data for recall note modal");
      return;
    }
    setSelectedRow(row);
    setRecallNoteModal(true);
  };

  const closeRecallNoteModal = () => {
    setRecallNoteModal(false);
    setSelectedRow(null);
  };

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1; // react-paginate uses 0-based indexing
    setPagination((prev) => ({ ...prev, page: newPage }));
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
        `}
      </style>
      <div className="table-responsive overflow-x-auto">
        {loading ? (
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
                  {(pagination.page - 1) * pagination.limit + tableData.length}
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
