import React, { useState, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";

import { Offcanvas } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../../services/inventoryService";
import { toast } from "react-toastify";
import moment from "moment";

const StockSaleOutTable = () => {
  // const [searchQuery, setSearchQuery] = useState("");

  const [exportLoading, setExportLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [showOffcanvas, setShowOffCanvas] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [showData, setShowData] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleCloseOffcanvas = () => {
    setShowOffCanvas(false);
  };

  useEffect(() => {
    getCollectionData(pagination.page, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCollectionData = async (
    page = pagination.page,
    limit = pagination.limit
  ) => {
    setLoadingInventory(true);

    const params = {
      "optimize[from]": user?.stores?.[0],
      page,
      limit,
    };
    const queryString = new URLSearchParams(params).toString();

    try {
      const response = await inventoryService.stockReceive(queryString);
      if (response.success) {
        const container = response?.data?.data;
        setStockData(container);
        const totalDocs =
          container?.totalDocs ??
          container?.total ??
          (container?.docs?.length || 0);
        const currentPage = container?.page ?? page;
        const currentLimit = container?.limit ?? limit;
        const totalPages =
          container?.totalPages ??
          Math.ceil((totalDocs || 0) / (currentLimit || 1));
        const hasPrevPage =
          typeof container?.hasPrevPage === "boolean"
            ? container.hasPrevPage
            : currentPage > 1;
        const hasNextPage =
          typeof container?.hasNextPage === "boolean"
            ? container.hasNextPage
            : currentPage < totalPages;
        setPagination({
          page: currentPage,
          limit: currentLimit,
          totalDocs,
          totalPages,
          hasPrevPage,
          hasNextPage,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(" error:", error);
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
      data: finalData, // Wrap your array like this
    };
    console.log("finalPayload", finalPayload);

    setExportLoading(true);

    try {
      const response = await inventoryService.exportCsv(finalPayload);

      if (response.success) {
        const csvData = response.data; // string: e.g., "sku,barcode,price\n7STAR-9005-46,10027,1350"

        // Create a Blob from the CSV string
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "barcodes.csv"); // Set the desired filename
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setExportLoading(false);
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
          {/* <div className="input-group mt-2">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch className="text-muted" style={{ color: "#94a3b8" }} />
          </span>
          <input
            type="search"
            className="form-control border-start-0"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div> */}
        </div>
        <div className="table-responsive px-2">
          {loadingInventory ? (
            <div className="d-flex justify-content-center">
              <h4>Loading Data...</h4>
            </div>
          ) : (
            <table className="table table-sm ">
              <thead className="text-xs text-uppercase text-muted bg-light border">
                <tr>
                  <th className="custom-perchase-th">Srno</th>

                  <th className="custom-perchase-th">Date</th>
                  <th className="custom-perchase-th">from</th>
                  <th className="custom-perchase-th">to</th>
                  <th className="custom-perchase-th">number of products</th>
                  <th className="custom-perchase-th">Stock quantity</th>
                  <th className="custom-perchase-th">status</th>

                  <th className="custom-perchase-th">action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stockData?.docs?.length > 0 ? (
                  stockData.docs.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{moment(item.createdAt).format("YYYY-MM-DD")}</td>

                      <td>
                        {item.from.storeNumber}/{item.from.name}
                      </td>

                      <td>
                        {item.to.storeNumber}/{item.to.name}
                      </td>
                      <td>{item.products?.length}</td>
                      <td>{item.products?.length}</td>
                      <td>{item.status}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary"
                            onClick={() => btnClick(item?.products)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn custom-button-bgcolor"
                            onClick={() => exportProduct(item?.products)}
                            disabled={exportLoading}
                          >
                            {exportLoading ? "Downloading..." : "Download"}
                          </button>
                        </div>
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
          )}
        </div>
        <div className="d-flex flex-column px-3 pb-2 flex-sm-row justify-content-between align-items-center mt-3">
          <div className="text-sm text-muted mb-3 mb-sm-0">
            {(() => {
              const startRow =
                pagination.totalDocs === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1;
              const endRow = Math.min(
                pagination.page * pagination.limit,
                pagination.totalDocs
              );
              return (
                <>
                  Showing <span className="fw-medium">{startRow}</span> to{" "}
                  <span className="fw-medium">{endRow}</span> of{" "}
                  <span className="fw-medium">{pagination.totalDocs}</span>{" "}
                  results
                </>
              );
            })()}
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary"
              onClick={() =>
                getCollectionData(pagination.page - 1, pagination.limit)
              }
              disabled={!pagination.hasPrevPage || loadingInventory}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() =>
                getCollectionData(pagination.page + 1, pagination.limit)
              }
              disabled={!pagination.hasNextPage || loadingInventory}
            >
              Next
            </button>
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
                <span className="text-muted ">Product Name: </span>
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
                {product?.quantity}
              </p>
            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default StockSaleOutTable;
