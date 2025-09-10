import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import { Offcanvas } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import moment from "moment/moment";

const StockOutTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [showOffcanvas, setShowOffCanvas] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

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

  const handleCloseOffcanvas = () => {
    setShowOffCanvas(false);
  };

  useEffect(() => {
    getCollectionData();
  }, []);

  const getCollectionData = async () => {
    setLoadingInventory(true);

    const params = {
      "optimize[from]": user?.stores?.[0],
      page: 1,
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
      setLoadingInventory(false);
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

  const btnClick = (item) => {
    setShowData(item);
    setShowOffCanvas(true);
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
              placeholder="Search..."
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
                        <tr key={item.id || index}>
                          <td style={{ minWidth: "50px" }}>{index + 1}</td>
                          <td style={{ minWidth: "110px" }}>
                            {moment(item.createdAt).format("YYYY-MM-DD")}
                          </td>
                          <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                            {item.from.storeNumber}/{item.from.name}
                          </td>
                          <td style={{ minWidth: "180px", maxWidth: "200px" }}>
                            {item.to.storeNumber}/{item.to.name}
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            {item.products?.length}
                          </td>
                          <td style={{ minWidth: "150px" }}>
                            {item.products?.length}
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
                            >
                              Download
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
                Showing <span className="fw-medium">1</span> to{" "}
                <span className="fw-medium">{filteredData.length}</span> of{" "}
                <span className="fw-medium">{filteredData.length}</span> results
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-outline-primary">
                  Previous
                </button>
                <button type="button" className="btn btn-outline-primary">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
        style={{ width: "420px" }}
      >
        <Offcanvas.Header className="bg-light border-bottom">
          <Offcanvas.Title className="text-dark font-semibold">
            Products
          </Offcanvas.Title>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={handleCloseOffcanvas}
          />
        </Offcanvas.Header>
        <Offcanvas.Body className="p-4">
          <div className="text-xs d-inline-flex font-medium bg-secondary-subtle text-secondary rounded-pill text-black text-center px-2 py-1 mb-4">
            Number Of Products: {showData?.length}
          </div>
          {showData?.map((product, index) => (
            <div
              key={index}
              className="p-3 mb-2 border rounded"
              style={{ borderColor: "rgb(214, 199, 199)" }}
            >
              <p className="my-1">
                <span className="text-muted">Product Name: </span>
                {product.productId?.displayName}
              </p>
              <p className="my-1">
                <span className="text-muted">Product SKU: </span>
                {product.productId?.sku}
              </p>
              <p className="my-1">
                <span className="text-muted">Barcode: </span>
                {product.productId?.newBarcode}
              </p>
              <p className="my-1">
                <span className="text-muted">Stock Quantity: </span>
                {product?.stockQuantity}
              </p>
            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default StockOutTable;
