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

const ReadyTable = ({ orders, loading, refreshSalesData }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDamagedModal, setShowDamagedModal] = useState(false); // Renamed for clarity
  const [selectedRow, setSelectedRow] = useState(null);
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
      vendor: order.sale?.vendor || "", // Adjust if vendor is stored elsewhere
      orderId: order._id,
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

  // Handle customer name click
  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row);
    setShowCustomerModal(true);
  };

  // Handle Deliver
  const handleDeliver = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    let successCount = 0;
    for (const order of selectedOrders) {
      const response = await workshopService.updateOrderStatus(
        order.orderId,
        "delivered"
      );
      if (response.success) {
        successCount++;
        setLocalProductTableData((prev) =>
          prev.map((row) =>
            row.id === order.id
              ? { ...row, status: "delivered", selected: false }
              : row
          )
        );
      } else {
        toast.error(`Failed to deliver order ${order.id}: ${response.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} order(s) delivered successfully`);
      setSelectedRows([]);
      refreshSalesData();
    }
  };

  // Handle Add Damaged click
  const handleAddDamaged = () => {
    setShowDamagedModal(true);
  };

  // Handle AddDamagedModal submit
  const handleDamagedSubmit = async (data) => {
    console.log("Damaged data submitted:", data);
    setShowDamagedModal(false);
    // Implement damaged item logic (e.g., API call to mark as damaged)
    // Example:
    /*
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => row.orderId);
    try {
      const response = await workshopService.markOrderAsDamaged({
        orderIds: selectedOrders,
        ...data, // Include damaged details
      });
      if (response.success) {
        toast.success("Order(s) marked as damaged successfully");
        refreshSalesData();
      } else {
        toast.error(`Failed to mark as damaged: ${response.message}`);
      }
    } catch (error) {
      toast.error("Error marking order(s) as damaged");
    }
    */
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
              maxWidth: "180px",
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
      {/* <div className="mb-4 col-12 px-3">
        {hasSelectedRows && (
          <div className="d-flex justify-content-between flex-wrap gap-3 mt-2">
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
                onClick={handleDeliver}
                disabled={loading}
              >
                {loading ? "Processing..." : "Deliver"}
              </button>
            
            </div>
          </div>
        )}
      </div> */}
      <div className="table-responsive px-2">
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
            <p>No data available for Ready status.</p>
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
          onHide={() => setShowDamagedModal(false)}
          selectedRows={localProductTableData.filter((row) =>
            selectedRows.includes(row.id)
          )}
          onSubmit={handleDamagedSubmit}
        />
      )}
    </div>
  );
};

export default ReadyTable;
