import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import moment from "moment/moment";
import ProductModal from "./ProductModal";
import Pagination from "../../Common/Pagination";

const StockInTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showData, setShowData] = useState([]);

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
    getCollectionData();
  }, []);

  const getCollectionData = async (currentPage = 1) => {
    setLoading(true);

    const params = {
      "optimize[to]": user?.stores?.[0],
      page: currentPage,
      limit: 20,
    };
    const queryString = new URLSearchParams(params).toString();

    try {
      const response = await inventoryService.stockTransfer(queryString);
      if (response.success) {
        setStockData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportProduct = async (item) => {
    const finalData = [];

    item?.forEach((item) => {
      const selected = item?.productId;
      finalData.push({
        "Product Name": selected?.displayName,
        "Product Sku": selected?.sku,
        Barcode: selected?.newBarcode,
        "Stock Quantity": item?.stockQuantity,
        Mrp: selected?.MRP,
      });
    });

    const finalPayload = {
      data: finalData,
    };
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
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    setLoading(true);
    try {
      const payload = {
        ...item,
      };

      const response = await inventoryService.changeStatus(payload);
      if (response.success) {
        toast.success("Stock transfer approved successfully");
        await getCollectionData();
      } else {
        toast.error(response.message || "Failed to approve stock transfer");
      }
    } catch (error) {
      console.error("Error approving stock transfer:", error);
      toast.error("Failed to approve stock transfer");
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

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; // React Paginate is 0-based, API is 1-based
    getCollectionData(selectedPage);
  };

  return (
    <>
      <div className="card-body p-0">
        <div className="mb-4 col-md-5">
          <div className="input-group mx-2 mt-2">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" style={{ color: "#94a3b8" }} />
            </span>
            <input
              type="search"
              className="form-control border-start-0 py-2"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card p-0 shadow-none">
          <div className="card-body p-0">
            <div className="table-responsive px-2">
              <table className="table table-sm">
                <thead className="text-xs text-uppercase text-muted bg-light border">
                  <tr>
                    <th className="custom-perchase-th">Srno</th>
                    <th className="custom-perchase-th">Date</th>
                    <th className="custom-perchase-th">From</th>
                    <th className="custom-perchase-th">To</th>
                    <th className="custom-perchase-th">Number of Products</th>
                    <th className="custom-perchase-th">Stock Quantity</th>
                    <th className="custom-perchase-th">Approval Status</th>
                    <th className="custom-perchase-th">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>
                        <td>{moment(item.createdAt).format("YYYY-MM-DD")}</td>
                        <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                          {item.from.storeNumber}/{item.from.name}
                        </td>
                        <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                          {item.to.storeNumber}/{item.to.name}
                        </td>
                        <td>{item.products?.length}</td>
                        <td style={{ minWidth: "150px" }}>
                          {item.products?.reduce(
                            (sum, product) =>
                              sum + (product?.stockQuantity || 0),
                            0
                          )}
                        </td>
                        <td>
                          {item.status === "pending" ? (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(item)}
                              disabled={loading}
                            >
                              Approve
                            </button>
                          ) : (
                            item.status
                          )}
                        </td>
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
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center add_power_title py-3"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
              <div className="text-sm text-muted mb-3 mb-sm-0">
                Showing <span className="fw-medium">1</span> to{" "}
                <span className="fw-medium">{filteredData.length}</span> of{" "}
                <span className="fw-medium">{filteredData.length}</span> results
              </div>
              <div className="btn-group">
                <Pagination
                  pageCount={stockData?.totalPages || 1}
                  onPageChange={handlePageClick}
                />
              </div>
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

export default StockInTable;
