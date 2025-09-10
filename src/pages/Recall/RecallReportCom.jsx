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
import ReactPaginate from "react-paginate"; // Added import for react-paginate
import { recallService } from "../../services/recallService";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function RecallReportCom() {
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [NotesModalVisible, setNotesModalVisible] = useState(false);
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

  const fetchRecallData = useCallback(
    debounce(async (storeId, page) => {
      const callKey = JSON.stringify({ store: storeId, page });

      if (lastFetchParams.current === callKey) {
        return;
      }

      setLoading(true);
      lastFetchParams.current = callKey;

      try {
        const response = await recallService.getRecallByStore(
          storeId,
          page,
          pagination.limit
        );
        console.log("response is<<<<", response);

        if (response.success) {
          const recalls = response.data?.docs || [];
          setTableData(
            recalls.map((recall) => ({
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
                leftLens: order?.leftLens?.displayName,
                rightLens: order?.rightLens?.displayName,
              })),
              fullSale: recall.salesId,
              updateNotes: recall?.updateNotes,
              rescheduleNotes: recall?.rescheduleNotes,
              recallStatus: recall?.recallStatus,
            }))
          );
          setPagination({
            totalDocs: response.data.totalDocs || 0,
            totalPages: response.data.totalPages || 1,
            page: response.data.page || page,
            limit: response.data.limit || pagination.limit,
          });
        } else {
          toast.error(response.message);
          setTableData([]);
        }
      } catch (error) {
        console.log("error is<<<<", error);
        toast.error("Error fetching recall data");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [pagination.limit]
  );

  useEffect(() => {
    const storeId = "64e30076c68b7b37a98b4b4c";
    fetchRecallData(storeId, pagination.page);
  }, [fetchRecallData, pagination.page]);

  const toggleSplit = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openNotesModal = (row) => {
    setSelectedNotes(row);
    setNotesModalVisible(true);
  };

  const closeNotesModal = () => {
    setNotesModalVisible(false);
    setSelectedNotes(null);
  };

  const openCustomerNameModal = (row) => {
    setSelectedRow(row.fullSale);
    setShowCustomerModal(true);
  };

  const closeCustomerNameModal = () => {
    setShowCustomerModal(false);
    setSelectedRow(null);
  };

  const openWhatsAppModal = (row) => {
    setSelectedRow(row);
    setShowWhatsAppModal(true);
  };

  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedRow(null);
  };

  const openRecallNoteModal = (row) => {
    console.log("row<<<<<", row);
    setSelectedRow(row);
    setRecallNoteModal(true);
  };

  const closeRecallNoteModal = () => {
    setRecallNoteModal(false);
    setSelectedRow(null);
  };

  // Handle pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1; // react-paginate uses 0-based indexing
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="mt-4 max-width-90 mx-auto px-3">
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
            <p>No recall data available.</p>
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
                  <th className="py-3 custom-perchase-th px-2">
                    Last Invoice Date
                  </th>
                  <th className="py-3 custom-perchase-th px-2">
                    Customer Name
                  </th>
                  <th className="py-3 custom-perchase-th px-2">
                    Customer Number
                  </th>
                  <th className="py-3 custom-perchase-th px-2">
                    Total Invoice Value
                  </th>
                  <th className="py-3 custom-perchase-th px-2">Recall Date</th>
                  <th className="py-3 custom-perchase-th px-2">
                    Previous Notes
                  </th>
                  <th className="py-3 custom-perchase-th px-2"></th>
                  <th className="py-3 custom-perchase-th px-2">Action</th>
                  <th className="py-3 custom-perchase-th px-2">Chat</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <React.Fragment key={row._id}>
                    <tr style={{ borderTop: "1px solid #dee2e6" }}>
                      <td className="py-3 px-2">{row.lastInvoiceDate}</td>
                      <td className="py-3 px-2">{row.customerName}</td>
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
                            onClick={() => openRecallNoteModal(row)} // Assuming Reschedule uses the same modal for now
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
            {/* Pagination Section */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4">
              <div className="text-sm">
                Showing <span className="fw-bold">{tableData.length}</span> of{" "}
                <span className="fw-bold">{pagination.totalDocs}</span> results
              </div>
              <ReactPaginate
                previousLabel="← Previous"
                nextLabel="Next →"
                pageCount={pagination.totalPages}
                onPageChange={handlePageChange}
                containerClassName="pagination d-flex list-unstyled align-items-center"
                pageClassName="me-2"
                pageLinkClassName="btn border border-secondary text-muted"
                previousClassName="me-2"
                previousLinkClassName="btn border border-secondary text-muted"
                nextClassName=""
                nextLinkClassName="btn border border-secondary text-muted"
                activeClassName="active"
                activeLinkClassName="bg-indigo-500 text-white"
                disabledClassName="disabled"
                breakLabel="..."
                breakClassName="me-2"
                breakLinkClassName="btn border border-secondary text-muted"
                forcePage={pagination.page - 1} // Adjust for 0-based indexing
              />
            </div>
          </>
        )}
      </div>

      {NotesModalVisible && selectedNotes && (
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
