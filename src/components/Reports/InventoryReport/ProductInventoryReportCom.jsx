import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { reportService } from "../../../services/reportService";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductInventoryReportCom = () => {
  // State for data and UI
  const [filteredData, setFilteredData] = useState({
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchInventoryReport({ page: 1, manageStock: true });
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch on search change
  useEffect(() => {
    fetchInventoryReport({
      page: 1,
      manageStock: true,
      search: debouncedQuery,
    });
  }, [debouncedQuery]);

  // Fetch inventory report
  const fetchInventoryReport = ({ page, manageStock, search }) => {
    setLoading(true);
    const payload = {
      page,
      limit: 10,
      manageStock,
      ...(search && { search }),
    };
    reportService
      .fetchInventoryReport(payload)
      .then((res) => {
        console.log(
          "[Inventory] fetchInventoryReport response:",
          res.data?.data?.docs?.length,
          res.data?.data?.docs
        );
        setFilteredData({
          docs: res.data?.data?.docs || [],
          totalDocs: res.data?.data?.totalDocs || 0,
          totalPages: res.data?.data?.totalPages || 0,
          page: res.data?.data?.page || 1,
          hasNextPage: res.data?.data?.hasNextPage || false,
          hasPrevPage: res.data?.data?.hasPrevPage || false,
        });
      })
      .catch((e) => {
        console.error("[Inventory] Failed to get inventory report:", e);
        toast.error("Failed to fetch inventory report");
      })
      .finally(() => setLoading(false));
  };

  // Export to CSV
  const exportToExcel = async () => {
    setLoadingDownload(true);
    try {
      const payload = {
        page: 1,
        limit: 100000,
        manageStock: true,
        ...(debouncedQuery && { search: debouncedQuery }),
      };

      const res = await reportService.fetchInventoryReport(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No data found to export");
        return;
      }

      const formattedData = res.data.data.docs;

      const finalData = formattedData.map((item, index) => ({
        SRNO: index + 1,
        Name: item.product?.displayName || "-",
        Sku: item.product?.sku || "-",
        MRP: item.product?.MRP || 0,
        Sell_Price: item.product?.sellPrice || 0,
        Brand: item.product?.brand?.name || "-",
        Barcode: item.product?.newBarcode || "-",
        Stock: item.stock || 0,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `ProductInventoryReport_${Date.now()}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Inventory report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("[Inventory] Export error:", error);
      toast.error("Failed to export inventory report");
    } finally {
      setLoadingDownload(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 50,
        cell: ({ row }) => <div className="text-left">{row.index + 1}</div>,
      },

      {
        id: "ProductSku",
        accessorKey: "product",
        header: "Sku",
        size: 250,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.sku || "-"}</div>
        ),
      },
      {
        id: "ProductMrp",
        accessorKey: "product",
        header: "MRP",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.MRP || 0}</div>
        ),
      },
      {
        id: "ProductSellprice",
        accessorKey: "product",
        header: "Sell Price",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.sellPrice || 0}</div>
        ),
      },

      {
        id: "ProductBarcode",
        accessorKey: "product",
        header: "Barcode",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.newBarcode || "-"}</div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
    ],
    []
  );

  // React Table setup
  const table = useReactTable({
    data: filteredData.docs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: { pagination: { pageIndex: filteredData.page - 1, pageSize: 10 } },
  });

  // Pagination info
  const startRow = (filteredData.page - 1) * 10 + 1;
  const endRow = Math.min(filteredData.page * 10, filteredData.totalDocs);
  const totalRows = filteredData.totalDocs;

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Inventory Report</h1>
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Inventory Report</h6>
            <div className="card-body p-0">
              <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">
                <div className="ms-md-auto d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={exportToExcel}
                    disabled={loadingDownload || !filteredData.docs.length}
                  >
                    {loadingDownload && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                    )}
                    Download
                  </button>
                </div>
              </div>
              <div className="mb-4 col-md-6 px-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted"
                      style={{ color: "#94a3b8" }}
                    />
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
              <div className="table-responsive px-2">
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-3 text-left"
                            style={{ minWidth: `${header.getSize()}px` }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.docs.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
                <div className="text-sm text-muted mb-3 mb-sm-0">
                  Showing <span className="fw-medium">{startRow}</span> to{" "}
                  <span className="fw-medium">{endRow}</span> of{" "}
                  <span className="fw-medium">{totalRows}</span> results
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      fetchInventoryReport({
                        page: filteredData.page - 1,
                        manageStock: true,
                        search: debouncedQuery,
                      })
                    }
                    disabled={!filteredData.hasPrevPage}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      fetchInventoryReport({
                        page: filteredData.page + 1,
                        manageStock: true,
                        search: debouncedQuery,
                      })
                    }
                    disabled={!filteredData.hasNextPage}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryReportCom;
