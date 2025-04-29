import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useMemo, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import CustomerNameModal from "../Vendor/CustomerNameModal";
import AddDamagedModal from "./AddDamagedModal";
import { workshopService } from "../../../services/Process/workshopService";

const InFittingTable = ({ orders, loading, refreshSalesData }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDamagedModal, setShowDamagedModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState(""); // State to hold error message
  const [pageSize] = useState(100);

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
  const isSingleRowSelected = selectedRows.length === 1;

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
    setError(""); // Clear error when selection changes
  };

  // Handle customer name click
  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row);
    setShowCustomerModal(true);
  };

  // Handle Mark as Ready
  const handleMarkAsReady = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId }));

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
          "ready"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: "ready", selected: false }
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
      toast.success(`${successCount} order(s) marked as ready successfully`);
      refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to mark order ${orderId} as ready: ${message}`);
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
              row.id === order.id
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

  // Handle Add Damaged click
  const handleAddDamaged = () => {
    if (selectedRows.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    setShowDamagedModal(true);
    setError(""); // Clear any previous error
  };

  // Handle AddDamagedModal submit
  const handleDamagedSubmit = async (data) => {
    const { rightDamaged, leftDamaged, selectedRows } = data;
    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedRows) {
      const sides = [];
      if (leftDamaged && order.currentLeftJobWork?._id) {
        sides.push({
          side: "left",
          jobWorkId: order.currentLeftJobWork._id,
          lens: order.currentLeftJobWork.lens,
          vendor: order.currentLeftJobWork.vendor,
        });
      }
      if (rightDamaged && order.currentRightJobWork?._id) {
        sides.push({
          side: "right",
          jobWorkId: order.currentRightJobWork._id,
          lens: order.currentRightJobWork.lens,
          vendor: order.currentRightJobWork.vendor,
        });
      }

      if (sides.length === 0) {
        failedOrders.push({
          orderId: order._id,
          message: "No valid job work found for selected side(s)",
        });
        continue;
      }

      let newLeftJobWorkId = order.currentLeftJobWork?._id;
      let newRightJobWorkId = order.currentRightJobWork?._id;

      for (const { side, jobWorkId, lens, vendor } of sides) {
        try {
          // 1. Mark existing job work as damaged
          const cancelResponse = await workshopService.updateJobWorkStatus(
            jobWorkId,
            "damaged"
          );
          if (
            !cancelResponse.data.success ||
            cancelResponse.data.data.modifiedCount === 0
          ) {
            throw new Error(
              cancelResponse.message ||
                `Failed to mark job work ${jobWorkId} as damaged`
            );
          }

          // 2. Create new job work
          const jobWorkPayload = {
            lens,
            sale: order.sale._id,
            order: order._id,
            store: order.store._id,
            powerAtTime: order.powerAtTime,
            side,
            vendor,
          };
          const jobWorkResponse = await workshopService.createJobWork(
            jobWorkPayload
          );
          if (!jobWorkResponse.data.success || !jobWorkResponse.data.data?.id) {
            throw new Error(
              jobWorkResponse.message || "Failed to create new job work"
            );
          }

          const newJobWorkId = jobWorkResponse.data.data.id;
          if (side === "left") {
            newLeftJobWorkId = newJobWorkId;
          } else {
            newRightJobWorkId = newJobWorkId;
          }
        } catch (error) {
          failedOrders.push({
            orderId: order._id,
            message: `Failed to process ${side} side: ${error.message}`,
          });
          continue;
        }
      }

      // 3. Update order with new job work IDs
      try {
        const orderPayload = {
          _id: order._id,
          currentLeftJobWork: newLeftJobWorkId,
          currentRightJobWork: newRightJobWorkId,
          status: "inLab",
        };
        const orderResponse = await workshopService.updateOrderJobWork(
          order._id,
          orderPayload
        );
        if (orderResponse.data.success) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.orderId === order._id
                ? { ...row, status: "inLab", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order._id,
            message: orderResponse.message || "Failed to update order",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order._id,
          message: error.message || "Error updating order",
        });
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} order(s) marked as damaged successfully`);
      setShowDamagedModal(false);
      setSelectedRows([]);
      refreshSalesData();
    }

    if (failedOrders.length > 0) {
      // Keep modal open and display the first error
      setError(failedOrders[0].message);
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
        cell: ({ getValue, row }) => (
          <div
            className="table-vendor-data-size"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#6366f1",
            }}
            onClick={() => handleCustomerNoteClick(row.original)}
          >
            {getValue()}
          </div>
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
          const Leftcolor = order.currentRightJobWork?.status;
          const Rightcolor = order.currentLeftJobWork?.status;

          return (
            <div
              className="table-vendor-data-size text-success"
              style={{ maxWidth: "170px" }}
            >
              {leftVendor && (
                <p
                  className="p-0 m-0"
                  style={{
                    color: `${Leftcolor === "pending" ? "#ef4444" : "#22c55e"}`,
                  }}
                >
                  left:{leftVendor}
                </p>
              )}
              {rightVendor && (
                <p
                  className="p-0 m-0"
                  style={{
                    color: `${
                      Rightcolor === "pending" ? "#ef4444" : "#22c55e"
                    }`,
                  }}
                >
                  right:{rightVendor}
                </p>
              )}
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
        localProductTableData.find((p) => p.saleId === order.id)?.vendor ||
        "N/A",
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
      <div className="mb-4 col-12 px-3">
        {hasSelectedRows && (
          <div className="d-flex justify-content-between flex-wrap gap-3 mt-2">
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
                onClick={handleMarkAsReady}
                disabled={loading}
              >
                {loading ? "Processing..." : "Ready"}
              </button>
              {isSingleRowSelected && (
                <button
                  className="btn ms-3 btn-outline-primary border-light-subtle"
                  type="button"
                  onClick={handleAddDamaged}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Add Damaged"}
                </button>
              )}
            </div>
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
                onClick={handleRevertOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Revert Order"}
              </button>
            </div>
          </div>
        )}
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
            <p>No data available for In Fitting status.</p>
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
      {showCustomerModal && selectedRow && (
        <CustomerNameModal
          show={showCustomerModal}
          onHide={() => setShowCustomerModal(false)}
          selectedRow={selectedRow?.fullOrder}
        />
      )}
      {showDamagedModal && (
        <AddDamagedModal
          show={showDamagedModal}
          onHide={() => {
            setShowDamagedModal(false);
            setError("");
          }}
          selectedRows={localProductTableData
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => row.fullOrder)}
          onSubmit={handleDamagedSubmit}
          error={error}
        />
      )}
    </div>
  );
};

export default InFittingTable;
