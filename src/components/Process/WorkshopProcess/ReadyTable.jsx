import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { workshopService } from "../../../services/Process/workshopService";

const ReadyTable = ({
  orders,
  loading,
  refreshSalesData,
  pagination,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [localProductTableData, setLocalProductTableData] = useState([]);

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
      toast.success(`${successCount} order(s) reverted successfully`);
      refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to revert order ${orderId}: ${message}`);
      });
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
          <div className="table-vendor-data-size" style={{ maxWidth: "200px" }}>
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
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

  // Table setup without getPaginationRowModel
  const table = useReactTable({
    data: combinedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Enable manual pagination
    state: {
      pagination: {
        pageIndex: pagination.page - 1, // Adjust for zero-based index
        pageSize: pagination.limit,
      },
    },
  });

  // Pagination info
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(
    pagination.page * pagination.limit,
    pagination.totalDocs
  );
  const totalRows = pagination.totalDocs;

  return (
    <div className="card-body p-0">
      <div className="mb-4 col-12">
        {hasSelectedRows && (
          <div className="d-flex justify-content-end flex-wrap mt-2">
            <button
              className="btn custom-hover-border"
              type="button"
              onClick={handleRevertOrder}
              disabled={loading}
            >
              Revert Order
            </button>
          </div>
        )}
      </div>
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
              onClick={() => onPageChange(pagination.prevPage)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => onPageChange(pagination.nextPage)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadyTable;
