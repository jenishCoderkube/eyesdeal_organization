import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import { Offcanvas } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";
import moment from "moment/moment";



const StockInTable = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [showOffcanvas , setShowOffCanvas] = useState(false)
  const [showData , setShowData] = useState([])




  const user = JSON.parse(localStorage.getItem("user"));

  const handleCloseOffcanvas = () => { 
    setShowOffCanvas(false)
  }

  useEffect(() => {
    getCollectionData();
  }, []);

  const getCollectionData = async () => {
    setLoading(true);

    const params = {
      "optimize[to]": user?.stores?.[0],
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
      console.error(" error:", error);
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
      data: finalData, // Wrap your array like this
    };
    console.log("finalPayload", finalPayload);

    setLoading(true);

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
      setLoading(false);
    }
  };

  const btnClick = (item) => { 
    setShowData(item)
    setShowOffCanvas(true)
  }


  return (
    <>
    <div className="card-body p-0">
      <div className="mb-4 col-md-6">
        <div className="input-group mt-2">
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
        </div>
      </div>

      <div className="card p-0  mt-5">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="text-xs text-uppercase text-muted bg-light border">
                <tr>
                  <th>Srno</th>

                  <th>Date</th>
                  <th>from</th>
                  <th>to</th>
                  <th>number of products</th>
                  <th>Stock quantity</th>
                  <th>status</th>

                  <th>action</th>
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
                          className="btn btn-primary btn-sm"
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
          </div>
          <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
            <div className="text-sm text-muted mb-3 mb-sm-0">
              Showing <span className="fw-medium">1</span> to{" "}
              <span className="fw-medium">{stockData?.docs?.length}</span> of{" "}
              <span className="fw-medium">{stockData?.docs?.length}</span>{" "}
              results
            </div>
            <div className="btn-group">
              <button className="btn btn-outline-primary">Previous</button>
              <button className="btn btn-outline-primary">Next</button>
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
              <span className="text-muted ">Product Name: </span>
              {product.productId?.displayName}
            </p>
            <p className="my-1">
              <span className="text-muted">Product SKU: </span>
              {product.productId?.productIdsku}
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

export default StockInTable;
