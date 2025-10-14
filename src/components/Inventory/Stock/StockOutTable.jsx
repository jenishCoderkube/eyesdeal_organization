import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import moment from "moment/moment";
import ProductModal from "./ProductModal";
import Pagination from "../../Common/Pagination";

const StockOutTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({ docs: [], totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showData, setShowData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const itemsPerPage = 20;

  const user = JSON.parse(localStorage.getItem("user"));

  // Filtered data based on searchQuery
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return stockData?.docs || [];
    }

    const lowerQuery = searchQuery.toLowerCase();
    return (stockData?.docs || []).filter((item) => {
      return (
        item.from?.name?.toLowerCase().includes(lowerQuery) ||
        String(item.from?.storeNumber).includes(lowerQuery) ||
        item.to?.name?.toLowerCase().includes(lowerQuery) ||
        String(item.to?.storeNumber).toLowerCase().includes(lowerQuery) ||
        item.status?.toLowerCase().includes(lowerQuery) ||
        moment(item.createdAt).format("YYYY-MM-DD").includes(lowerQuery) ||
        item.products?.some(
          (product) =>
            product.productId?.displayName
              ?.toLowerCase()
              .includes(lowerQuery) ||
            product.productId?.sku?.toLowerCase().includes(lowerQuery) ||
            String(product.productId?.newBarcode)
              ?.toLowerCase()
              .includes(lowerQuery)
        )
      );
    });
  }, [searchQuery, stockData]);

  useEffect(() => {
    getCollectionData(currentPage + 1);
  }, [currentPage]);

  const getCollectionData = async (page) => {
    setLoadingInventory(true);

    const params = {
      "optimize[from]": user?.stores?.[0],
      page: page,
      limit: itemsPerPage,
      search: searchQuery.trim() ? searchQuery : "",
    };
    const queryString = new URLSearchParams(params).toString();

    try {
      const response = await inventoryService.stockTransfer(queryString);
      if (response.success) {
        setStockData({
          docs: response?.data?.data?.docs || [],
          totalPages: response?.data?.data?.totalPages || 1,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
      toast.error("Failed to fetch stock data");
    } finally {
      setLoadingInventory(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on new search
      getCollectionData(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const exportProduct = async (item) => {
    const finalData = item?.map((product) => ({
      "Product Name": product?.productId?.displayName,
      "Product Sku": product?.productId?.sku,
      Barcode: product?.productId?.newBarcode,
      "Stock Quantity": product?.stockQuantity,
      Mrp: product?.productId?.MRP,
    }));

    const finalPayload = { data: finalData };
    setLoading(true);

    try {
      const response = await inventoryService.exportCsv(finalPayload);
      if (response.success) {
        const csvData = response.data;
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "barcodes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const btnClick = (item) => {
    setShowData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowData([]);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <>
      <div className="card-body p-0">
        <div className="mb-4 col-md-6">
          <div className="input-group px-2 mt-2">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" style={{ color: "#94a3b8" }} />
            </span>
            <input
              type="search"
              className="form-control border-start-0 py-2"
              placeholder="Search by store, status, date, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card p-0 shadow-none mt-3">
          <div className="card-body p-0">
            <div className="table-responsive px-2">
              {loadingInventory ? (
                <div className="d-flex justify-content-center">
                  <h4>Loading Data...</h4>
                </div>
              ) : (
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border">
                    <tr>
                      <th className="custom-perchase-th">Srno</th>
                      <th className="custom-perchase-th">Date</th>
                      <th className="custom-perchase-th">From</th>
                      <th className="custom-perchase-th">To</th>
                      <th className="custom-perchase-th">Number of Products</th>
                      <th className="custom-perchase-th">Stock Quantity</th>
                      <th className="custom-perchase-th">Status</th>
                      <th className="custom-perchase-th">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={item._id || index}>
                          <td style={{ minWidth: "50px" }}>
                            {currentPage * itemsPerPage + index + 1}
                          </td>
                          <td style={{ minWidth: "110px" }}>
                            {moment(item.createdAt).format("YYYY-MM-DD")}
                          </td>
                          <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                            {item.from?.storeNumber}/{item.from?.name}
                          </td>
                          <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                            {item.to?.storeNumber}/{item.to?.name}
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            {item.products?.length}
                          </td>
                          <td style={{ minWidth: "150px" }}>
                            {item.products?.reduce(
                              (sum, product) =>
                                sum + (product?.stockQuantity || 0),
                              0
                            )}
                          </td>
                          <td>{item.status}</td>
                          <td className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-link p-0 text-primary"
                              onClick={() => btnClick(item?.products)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="btn custom-button-bgcolor btn-sm"
                              onClick={() => exportProduct(item?.products)}
                              disabled={loading}
                            >
                              {loading ? "Downloading..." : "Download"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-3">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
              <div className="text-sm text-muted mb-3 mb-sm-0">
                Showing{" "}
                <span className="fw-medium">
                  {currentPage * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="fw-medium">
                  {Math.min(
                    (currentPage + 1) * itemsPerPage,
                    stockData.totalDocs || filteredData.length
                  )}
                </span>{" "}
                of{" "}
                <span className="fw-medium">
                  {stockData.totalDocs || filteredData.length}
                </span>{" "}
                results
              </div>

              <Pagination
                pageCount={stockData?.totalPages || 1}
                onPageChange={handlePageClick}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        show={showModal}
        handleClose={handleCloseModal}
        products={showData}
      />
    </>
  );
};

export default StockOutTable;
