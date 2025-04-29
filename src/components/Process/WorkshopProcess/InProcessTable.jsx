import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import EditVendorModal from "./EditVendorModal";
import { workshopService } from "../../../services/Process/workshopService";
import OrderImageTemplate from "./OrderImageTemplate.jsx"; // Import the new component

const InProcessTable = ({ orders, loading, refreshSalesData }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [pageSize] = useState(100);
  const [downloadOrder, setDownloadOrder] = useState(null); // State to hold the order being downloaded
  const downloadRef = useRef(null); // Ref to hold the template DOM element

  // Derive tableData and productTableData from orders
  const { tableData, productTableData } = useMemo(() => {
    const tableData = orders.map((order) => ({
      id: order._id,
      date: new Date(order.createdAt).toISOString().split("T")[0],
      billNumber: order.billNumber,
      customerName: order.sale?.customerName || "N/A",
      store: order.store?.name || "N/A",
      notes: order.sale?.note || "",
      fullOrder: order,
    }));

    const productTableData = orders.map((order, index) => ({
      id: `${order._id}-${index + 1}`,
      saleId: order._id,
      selected: false,
      productSku: order.product?.sku || "N/A",
      lensSku: order.lens?.sku || "N/A",
      status: order.status || "N/A",
      vendor: order.sale?.vendor || "",
      orderId: order._id,
      fullOrder: order,
    }));

    return { tableData, productTableData };
  }, [orders]);

  const [localProductTableData, setLocalProductTableData] =
    useState(productTableData);

  // Sync localProductTableData when productTableData changes
  useEffect(() => {
    setLocalProductTableData(productTableData);
  }, [productTableData]);

  const hasSelectedRows = selectedRows.length > 0;

  // Compute whether all selected orders are ready for fitting
  const isSendForFittingDisabled = useMemo(() => {
    if (!hasSelectedRows) return true;

    return !localProductTableData
      .filter((row) => selectedRows.includes(row.id))
      .every((row) => {
        const order = row.fullOrder;
        return (
          order.currentLeftJobWork?.status === "received" &&
          order.currentRightJobWork?.status === "received"
        );
      });
  }, [selectedRows, localProductTableData, hasSelectedRows]);

  // Handle checkbox selection
  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
    setLocalProductTableData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, selected: !row.selected } : row
      )
    );
  };

  // Handle Edit Vendor
  const handleEditVendor = () => {
    if (selectedRows.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    setShowEditVendorModal(true);
  };

  // Handle EditVendorModal submit
  const handleEditVendorSubmit = async (data) => {
    console.log("Edit vendor data submitted:", data);
    setShowEditVendorModal(false);
    refreshSalesData();
  };

  // Handle Send for Fitting
  const handleSendForFitting = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          "inFitting"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: "inFitting", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent for fitting successfully`);
      refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to send order ${orderId} for fitting: ${message}`);
      });
    }
  };

  // Handle Revert Order
  const handleRevertOrder = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          "pending"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === row.id
                ? { ...row, status: "pending", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) reverted successfully`);
      refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to revert order ${orderId}: ${message}`);
      });
    }
  };

  // Handle Download Image
  const handleDownloadImage = async (order) => {
    try {
      // Set the order to be rendered in the template
      setDownloadOrder(order);

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use html2canvas to capture the template
      const element = downloadRef.current;
      if (!element) {
        throw new Error("Template element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2, // Increase resolution
        useCORS: true, // Allow cross-origin images (e.g., logo)
      });

      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `order_${order.billNumber || order._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Image downloaded successfully");

      // Clear the download order to hide the template
      setDownloadOrder(null);
    } catch (error) {
      setDownloadOrder(null);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Select",
        cell: ({ row }) => {
          const productRow = localProductTableData.find(
            (p) => p.saleId === row.original.id
          );
          return (
            <Form.Check
              type="checkbox"
              checked={productRow?.selected || false}
              onChange={() => handleCheckboxChange(productRow?.id)}
              className="form-check-input-lg fs-5"
            />
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Bill Number",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "productSku",
        header: "Product SKU",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "lensSku",
        header: "Lens SKU",
        cell: ({ getValue }) => (
          <div
            className="max-w-[150px] table-vendor-data-size"
            style={{ maxWidth: "200px" }}
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ row }) => {
          const order = row.original.fullOrder;
          const leftVendor = order.currentLeftJobWork?.vendor?.companyName;
          const rightVendor = order.currentRightJobWork?.vendor?.companyName;
          const leftColor = order.currentLeftJobWork?.status;
          const rightColor = order.currentRightJobWork?.status;

          return (
            <div
              className="table-vendor-data-size text-success"
              style={{ maxWidth: "170px" }}
            >
              {leftVendor && (
                <p
                  className="p-0 m-0"
                  style={{
                    color: `${leftColor === "pending" ? "#ef4444" : "#22c55e"}`,
                  }}
                >
                  left: {leftVendor}
                </p>
              )}
              {rightVendor && (
                <p
                  className="p-0 m-0"
                  style={{
                    color: `${
                      rightColor === "pending" ? "#ef4444" : "#22c55e"
                    }`,
                  }}
                >
                  right: {rightVendor}
                </p>
              )}
              <button
                className="btn btn-outline-primary border-light-subtle mt-1"
                onClick={() => handleDownloadImage(order)}
              >
                Download Image
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Note",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size" style={{ maxWidth: "200px" }}>
            {getValue()}
          </div>
        ),
      },
    ],
    [localProductTableData]
  );

  // Combine tableData and productTableData for display
  const combinedData = useMemo(() => {
    return tableData.map((order) => ({
      ...order,
      productSku:
        localProductTableData.find((p) => p.saleId === order.id)?.productSku ||
        "N/A",
      lensSku:
        localProductTableData.find((p) => p.saleId === order.id)?.lensSku ||
        "N/A",
      vendor:
        localProductTableData.find((p) => p.saleId === order.id)?.vendor || "",
    }));
  }, [tableData, localProductTableData]);

  // Table setup
  const table = useReactTable({
    data: combinedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, combinedData.length);
  const totalRows = combinedData.length;

  return (
    <div className="card-body p-0">
      <div className="mb-4 col-12">
        <div className="mb-4 col-12">
          {hasSelectedRows && (
            <div className="d-flex justify-content-between flex-wrap mt-2">
              <div>
                {!isSendForFittingDisabled && (
                  <button
                    className="btn btn-outline-primary border-light-subtle"
                    type="button"
                    onClick={handleSendForFitting}
                    disabled={loading || isSendForFittingDisabled}
                  >
                    {loading ? "Processing..." : "Send for Fitting"}
                  </button>
                )}
                <button
                  className="btn ms-2 btn-outline-primary border-light-subtle"
                  type="button"
                  onClick={handleEditVendor}
                  disabled={loading}
                >
                  Edit Vendor
                </button>
              </div>
              <div>
                <button
                  className="btn btn-outline-primary border-light-subtle"
                  type="button"
                  onClick={handleRevertOrder}
                  disabled={loading}
                >
                  Revert Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="table-responsive">
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
        ) : combinedData.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>No data available for In Process status.</p>
          </div>
        ) : (
          <table className="table table-sm">
            <thead className="table-light border text-xs text-uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-3 text-left custom-perchase-th"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {combinedData.length !== 0 && (
        <div className="d-flex p-2 flex-column flex-sm-row justify-content-between align-items-center mt-3 px-3">
          <div className="text-sm text-muted mb-3 mb-sm-0">
            Showing <span className="fw-medium">{startRow}</span> to{" "}
            <span className="fw-medium">{endRow}</span> of{" "}
            <span className="fw-medium">{totalRows}</span> results
          </div>
          <div className="btn-group">
            <Button
              variant="outline-primary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {showEditVendorModal && (
        <EditVendorModal
          show={showEditVendorModal}
          onHide={() => setShowEditVendorModal(false)}
          selectedRows={localProductTableData
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => row.fullOrder)}
          onSubmit={handleEditVendorSubmit}
        />
      )}
      {/* Hidden div to render the template for image conversion */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
        }}
      >
        {downloadOrder && (
          <div ref={downloadRef}>
            <OrderImageTemplate order={downloadOrder} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InProcessTable;
