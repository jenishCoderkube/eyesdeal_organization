import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Form } from "react-bootstrap";
import VendorNoteModal from "./VendorNoteModal";
import CustomerNameModal from "./CustomerNameModal";
import { vendorshopService } from "../../../services/Process/vendorshopService";
import { toast } from "react-toastify";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const VendorListTable = ({
  data,
  loading,
  pagination,
  onPageChange,
  onSearchChange,
  searchQuery,
  selectedVendor,
  selectedStore,
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) => {
        const processDate = new Date(item.sale.createdAt)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .toLowerCase();
        const store = (item.store.name || "").toLowerCase();
        const billNumber = (item.order.billNumber || "").toLowerCase();
        const customerName = (item.sale.customerName || "").toLowerCase();
        const vendorNote = (item.order.vendorNote || "").toLowerCase();
        const lensSku = (item.lens.sku || "").toLowerCase();
        const side = (item.side || "").toLowerCase();
        const vendor = (item.vendor.companyName || "").toLowerCase();

        // Power fields (SPH, CYL, Axis, ADD for both Distance and Near)
        const powerSpecs = item.powerAtTime?.specs || {};
        const rightDistance = powerSpecs.right?.distance || {};
        const rightNear = powerSpecs.right?.near || {};
        const powerValues = [
          rightDistance.sph,
          rightDistance.cyl,
          rightDistance.axis,
          rightDistance.add,
          rightNear.sph,
          rightNear.cyl,
          rightNear.axis,
          rightNear.add,
        ]
          .filter(Boolean)
          .map((val) => val.toString().toLowerCase())
          .join(" ");

        return (
          processDate.includes(lowerQuery) ||
          store.includes(lowerQuery) ||
          billNumber.includes(lowerQuery) ||
          customerName.includes(lowerQuery) ||
          vendorNote.includes(lowerQuery) ||
          lensSku.includes(lowerQuery) ||
          side.includes(lowerQuery) ||
          powerValues.includes(lowerQuery) ||
          vendor.includes(lowerQuery)
        );
      });
    },
    []
  );

  // Debounced filter
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(data, query));
    }, 200);
    debouncedFilter(searchQuery);
    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, data, filterGlobally]);

  // Sync filteredData with prop data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Handle checkbox selection
  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Handle Receive All
  const handleReceiveAll = async () => {
    try {
      const updates = selectedRows.map(async (rowId) => {
        const row = filteredData.find((item) => item._id === rowId);
        const jobWorkId = row._id;
        const side = row.side;

        if (side === "left" || side === "right") {
          return vendorshopService.updateJobWorkStatus(jobWorkId, "received");
        } else if (side === "both") {
          const leftJobWorkId = row.order.currentLeftJobWork;
          const rightJobWorkId = row.order.currentRightJobWork;
          const leftUpdate = vendorshopService.updateJobWorkStatus(
            leftJobWorkId,
            "received"
          );
          const rightUpdate = vendorshopService.updateJobWorkStatus(
            rightJobWorkId,
            "received"
          );
          return Promise.all([leftUpdate, rightUpdate]);
        }
        return Promise.resolve({ success: false, message: "Invalid side" });
      });

      const results = await Promise.all(updates);
      const flattenedResults = results.flat();
      const failed = flattenedResults.filter((result) => !result.success);

      if (failed.length > 0) {
        failed.forEach((fail) => console.error(fail.message));
        toast.error("Some updates failed. Check console for details.");
      } else {
        toast.success("All job works updated successfully!");
        setSelectedRows([]);
      }

      // Refresh table data
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        populate: true,
        status: "pending",
      };
      const response = await vendorshopService.getJobWorks(filters);
      if (response?.data?.success) {
        setFilteredData(response.data.data.docs);
        setPagination({
          totalDocs: response.data.data.totalDocs,
          limit: response.data.data.limit,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
          hasPrevPage: response.data.data.hasPrevPage,
          hasNextPage: response.data.data.hasNextPage,
          prevPage: response.data.data.prevPage,
          nextPage: response.data.data.nextPage,
        });
      } else {
        setFilteredData([]);
        toast.error("Failed to refresh table data.");
      }
    } catch (error) {
      console.error("Error during receive all:", error);
      // toast.error("An error occurred during receive all.");
    }
  };

  // Handle Vendor Note click
  const handleVendorNoteClick = (row) => {
    setSelectedRow(row);
    setShowVendorModal(true);
  };

  // Handle Customer Note click
  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row);
    setShowCustomerModal(true);
  };

  // Handle Vendor Note submit
  const handleVendorNoteSubmit = async (updatedRow) => {
    try {
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        populate: true,
        status: "pending",
      };
      const response = await vendorshopService.getJobWorks(filters);
      if (response.success && response.data.data.docs) {
        setFilteredData(response.data.data.docs);
        setPagination({
          totalDocs: response.data.data.totalDocs,
          limit: response.data.data.limit,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
          hasPrevPage: response.data.data.hasPrevPage,
          hasNextPage: response.data.data.hasNextPage,
          prevPage: response.data.data.prevPage,
          nextPage: response.data.data.nextPage,
        });
      } else {
        console.error("Failed to fetch updated job works:", response.message);
      }
    } catch (error) {
      console.error("Error fetching updated job works:", error);
    } finally {
      setShowVendorModal(false);
    }
  };

  // Transform job works data to required format
  const transformJobWorksData = (jobWorks) => {
    const jobWorkData = [];
    jobWorks.forEach((jobWork) => {
      const order = jobWork.order;
      const sale = jobWork.sale;
      const powerSpecs = jobWork.powerAtTime?.specs?.right?.distance || {};
      const lensName =
        jobWork.lens?.item?.productName || jobWork.lens?.sku || "";

      jobWorkData.push({
        billNumber: order.billNumber || "",
        orderDate: new Date(sale.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        store: jobWork.store.name || "",
        vendor: jobWork?.vendor?.companyName || "",
        side: jobWork.side || "",
        vendorNote: order.vendorNote || "",
        productName: lensName,
        sph: powerSpecs.sph || "",
        cyl: powerSpecs.cyl || "",
        axis: powerSpecs.axis || "",
        add: powerSpecs.add || "",
      });

      const leftPowerSpecs = jobWork.powerAtTime?.specs?.left?.distance || {};
      if (leftPowerSpecs && jobWork.side === "both") {
        jobWorkData.push({
          billNumber: order.billNumber || "",
          orderDate: new Date(sale.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          store: jobWork.store.name || "",
          vendor: jobWork?.vendor?.companyName || "",
          side: "left",
          vendorNote: order.vendorNote || "",
          productName: lensName,
          sph: leftPowerSpecs.sph || "",
          cyl: leftPowerSpecs.cyl || "",
          axis: leftPowerSpecs.axis || "",
          add: leftPowerSpecs.add || "",
        });
      }
    });
    return { jobWorkData, vendorName: selectedVendor?.label || "" };
  };

  // Handle PDF Download
  // Handle PDF Download
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);

      let rowsToDownload = [];

      if (selectedRows.length > 0) {
        // Download only selected rows
        rowsToDownload = filteredData.filter((item) =>
          selectedRows.includes(item._id)
        );
      } else {
        // Download all rows via API
        const filters = {
          page: 1,
          limit: 3000, // bigger limit if you expect more data
          populate: true,
          status: "pending",
          vendors: selectedVendor ? [selectedVendor.value] : "",
          stores: selectedStore ? selectedStore.map((s) => s.value) : "",
        };

        const response = await vendorshopService.getJobWorks(filters);
        console.log("response", response);

        if (response?.success && response?.data?.data?.docs?.length > 0) {
          rowsToDownload = response.data.data.docs;
        } else {
          toast.warn("No data available to download.");
          return; // stop here if no data
        }
      }

      // Transform and download
      const transformedData = transformJobWorksData(rowsToDownload);
      const pdfResponse = await vendorshopService.downloadJobWorksPDF(
        transformedData
      );

      if (pdfResponse?.success) {
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "JobWorks.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to generate PDF.");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Receive
  const handleReveive = async (row) => {
    const response = await vendorshopService.updateJobWorkStatus(
      row.original._id,
      "received"
    );
    if (response?.success) {
      toast.success("Job work Updated");
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        populate: true,
        status: "pending",
      };
      const response = await vendorshopService.getJobWorks(filters);
      if (response.success && response.data.data.docs) {
        setFilteredData(response.data.data.docs);
        setPagination({
          totalDocs: response.data.data.totalDocs,
          limit: response.data.data.limit,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
          hasPrevPage: response.data.data.hasPrevPage,
          hasNextPage: response.data.data.hasNextPage,
          prevPage: response.data.data.prevPage,
          nextPage: response.data.data.nextPage,
        });
      }
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Select",
        size: 20,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.original._id)}
            onChange={() => handleCheckboxChange(row.original._id)}
            disabled={loading}
            style={{ width: "20px", height: "20px" }}
          />
        ),
      },
      {
        accessorKey: "sale.createdAt",
        header: "Process Date",
        size: 120,
        cell: ({ row }) => (
          <div className="table-vendor-data-size common-tabledata-minwidth">
            {new Date(row.original.sale.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
        ),
      },
      {
        accessorKey: "store.name",
        header: "Store",
        size: 200,
        cell: ({ row }) => (
          <div className="table-vendor-data-size common-tabledata-minwidth">
            {row.original.store.name}
          </div>
        ),
      },
      {
        accessorKey: "order.billNumber",
        header: "Bill Number",
        size: 100,
        cell: ({ row }) => (
          <div className="table-vendor-data-size common-tabledata-minwidth">
            {row.original.order.billNumber}
          </div>
        ),
      },
      {
        accessorKey: "sale.customerName",
        header: "Customer Name",
        size: 180,
        cell: ({ row }) => (
          <div
            className="table-vendor-data-size common-tabledata-minwidth common-text-color"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => handleCustomerNoteClick(row.original)}
          >
            {row.original.sale.customerName}
          </div>
        ),
      },
      {
        accessorKey: "vendorNote",
        header: "Vendor Note",
        size: 150,
        cell: ({ row }) => (
          <div
            className="table-vendor-data-size common-tabledata-minwidth common-text-color"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => handleVendorNoteClick(row.original)}
          >
            {row.original.order.vendorNote || "Add Note"}
          </div>
        ),
      },
      {
        accessorKey: "lens.sku",
        header: "Lens SKU",
        size: 200,
        cell: ({ row }) => (
          <div className="max-w-[150px] table-vendor-data-size common-tabledata-minwidth">
            {row.original.lens.sku}
          </div>
        ),
      },
      {
        accessorKey: "side",
        header: "Side",
        size: 100,
        cell: ({ row }) => (
          <div className="table-vendor-data-size common-tabledata-minwidth">
            {row.original.side}
          </div>
        ),
      },
      {
        accessorKey: "powerAtTime.specs",
        header: "Power",
        cell: ({ row }) => {
          let specs = null;
          if (row.original.side === "left") {
            specs = row.original.powerAtTime.specs?.left || {};
          } else {
            specs = row.original.powerAtTime.specs?.right;
          }
          return (
            <div className="text-xs">
              <div
                className="d-grid gap-0"
                style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              >
                {["Specs", "SPH", "CYL", "Axis", "ADD"].map((label, idx) => (
                  <div
                    key={idx}
                    className="border border-dark p-1 fw-bold table-vendor-data-size"
                  >
                    {label}
                  </div>
                ))}
                <div className="border border-dark p-1 fw-bold">Dist</div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.distance?.sph || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.distance?.cyl || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.distance?.axis || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.distance?.add || ""}
                </div>
                <div className="border border-dark p-1 fw-bold">Near</div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.near?.sph || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.near?.cyl || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.near?.axis || ""}
                </div>
                <div className="border border-dark p-1 table-vendor-data-size">
                  {specs?.near?.add || ""}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "vendor.companyName",
        header: "Vendor",
        size: 230,
        cell: ({ row }) => (
          <div className="table-vendor-data-size">
            {row.original.vendor.companyName}
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="primary"
            className="table-vendor-data-size px-4 py-2 custom-button-bgcolor"
            size="sm"
            onClick={() => handleReveive(row)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Receive"}
          </Button>
        ),
      },
    ],
    [selectedRows, loading]
  );

  // Table setup with manual pagination
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
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
      <div className="d-flex flex-column flex-md-row gap-3 mb-3 px-3">
        <div className="ms-md-auto">
          <Button
            onClick={handleDownloadPDF}
            disabled={loading || isDownloading}
            className="custom-button-bgcolor"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
      <div className="mb-2 col-md-4 px-2">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch
              className="text-muted custom-search-icon"
              style={{ color: "#94a3b8" }}
            />
          </span>
          <input
            type="search"
            className="form-control border-start-0 py-2"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)} // <-- send to parent
          />
        </div>
        <div className="d-flex gap-2 mt-4">
          {selectedRows.length > 0 && (
            <Button
              variant="primary"
              onClick={handleReceiveAll}
              disabled={loading}
              className="custom-button-bgcolor"
            >
              Receive All
            </Button>
          )}
        </div>
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
        ) : (
          <table className="table table-sm">
            <thead className="table-light border text-xs text-uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-3 text-left custom-perchase-th"
                      style={{ minWidth: `${header.getSize()}px` }}
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
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="text-center py-5"
                  >
                    {data.length === 0
                      ? "No data available."
                      : "No data found."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {filteredData.length !== 0 && (
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
              disabled={!pagination.hasPrevPage || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => onPageChange(pagination.nextPage)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <VendorNoteModal
        show={showVendorModal}
        onHide={() => setShowVendorModal(false)}
        selectedRow={selectedRow}
        onSubmit={handleVendorNoteSubmit}
      />
      <CustomerNameModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default VendorListTable;
