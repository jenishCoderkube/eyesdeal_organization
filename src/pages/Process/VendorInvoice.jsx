import React, { useEffect, useState, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Form, Card } from "react-bootstrap";
import { vendorInvoiceService } from "../../services/Process/vendorInvoiceService";
import { debounce } from "lodash";

function VendorInvoice() {
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 50,
    page: 1,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });

  const users = useMemo(
    () =>
      JSON.parse(localStorage.getItem("user")) || {
        _id: "638b1a079f67a63ea1e1ba01",
        phone: "917777900910",
        name: "Rizwan",
        role: "admin",
        stores: ["64e30076c68b7b37a98b4b4c"],
      },
    []
  );

  const defaultStartDate = new Date("2024-12-01");
  const defaultEndDate = new Date("2024-12-31");
  const defaultStores = ["64709e8b518c8594f121857b"];
  const defaultVendors = ["64b253d43752a0dc06019207"];

  const formik = useFormik({
    initialValues: {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      stores: [],
      vendors: [],
      search: "",
    },
    validationSchema: Yup.object({
      startDate: Yup.date().required("Start date is required"),
      endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),
    }),
    onSubmit: (values) => {
      const filters = {
        stores: values.stores.length
          ? values.stores.map((store) => store.value)
          : defaultStores,
        vendors: values.vendors.length
          ? values.vendors.map((vendor) => vendor.value)
          : defaultVendors,
        startDate: values.startDate,
        endDate: values.endDate,
        search: values.search,
        page: 1,
        limit: 50,
      };
      setSelectedRows([]);
      setExpandedRows([]);
      debouncedFetchJobWorks(filters);
    },
  });

  const getStores = async () => {
    try {
      const response = await vendorInvoiceService.getStores();
      if (response.success) {
        setStoreData(response.data.data);
      } else {
        toast.error(response.message || "Failed to fetch stores");
      }
    } catch (error) {
      toast.error("Error fetching stores: " + error.message);
    }
  };

  const getVendors = async () => {
    try {
      const response = await vendorInvoiceService.getVendors();
      if (response.success) {
        setVendorData(response.data.data.docs);
      } else {
        toast.error(response.message || "Failed to fetch vendors");
      }
    } catch (error) {
      toast.error("Error fetching vendors: " + error.message);
    }
  };

  const fetchJobWorks = useCallback(async (filters) => {
    setLoading(true);
    setDataLoaded(false);
    try {
      const response = await vendorInvoiceService.getJobWorks(filters);
      console.log("Full job works response:", response.data.data);

      if (response.success && response.data.data.data) {
        const jobWorks = response.data.data.data;
        setTableData(
          jobWorks
            .map((job) => {
              if (!job._id) {
                console.warn("Missing _id for job:", job);
                return null;
              }
              let formattedInvoiceDate = "N/A";
              try {
                if (
                  job.sale?.createdAt &&
                  typeof job.sale.createdAt === "string"
                ) {
                  const date = new Date(job.sale.createdAt);
                  if (!isNaN(date.getTime())) {
                    formattedInvoiceDate = date.toISOString().split("T")[0];
                  } else {
                    console.warn(
                      `Invalid sale.createdAt for job ${job._id}:`,
                      job.sale.createdAt
                    );
                  }
                }
              } catch (error) {
                console.error(
                  `Error parsing sale.createdAt for job ${job._id}:`,
                  job.sale?.createdAt,
                  error
                );
              }

              return {
                _id: job._id,
                invoiceNumber: job.sale?.saleNumber?.toString() || "N/A",
                invoiceDate: formattedInvoiceDate,
                customerName: job.sale?.customerName || "N/A",
                storeName: job.store?.name || "N/A",
                status: job.status || "N/A",
                selected: false,
                fullJob: job,
              };
            })
            .filter(Boolean)
        );
        setPagination({
          totalDocs: response.data.data.total || 0,
          limit: response.data.data.limit || 50,
          page: response.data.data.page || 1,
          totalPages: response.data.data.pages || 0,
          hasPrevPage: (response.data.data.page || 1) > 1,
          hasNextPage:
            (response.data.data.page || 1) < (response.data.data.pages || 0),
          prevPage:
            (response.data.data.page || 1) > 1
              ? (response.data.data.page || 1) - 1
              : null,
          nextPage:
            (response.data.data.page || 1) < (response.data.data.pages || 0)
              ? (response.data.data.page || 1) + 1
              : null,
        });
      } else {
        toast.error(response.data?.message || "Failed to fetch job works");
        setTableData([]);
        setPagination({
          totalDocs: 0,
          limit: 50,
          page: 1,
          totalPages: 0,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
    } catch (error) {
      console.error("Error fetching job works:", error);
      toast.error("Error fetching job works: " + error.message);
      setTableData([]);
      setPagination({
        totalDocs: 0,
        limit: 50,
        page: 1,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      });
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, []);

  const debouncedFetchJobWorks = useMemo(
    () => debounce(fetchJobWorks, 300),
    [fetchJobWorks]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setDataLoaded(false);
      await Promise.all([getStores(), getVendors()]);
      const filters = {
        stores: defaultStores,
        vendors: defaultVendors,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        search: "",
        page: pagination.page,
        limit: 50,
      };
      debouncedFetchJobWorks(filters);
    };

    initialize();
    return () => debouncedFetchJobWorks.cancel();
  }, [debouncedFetchJobWorks]);

  const handlePageChange = useCallback(
    (page) => {
      if (page) {
        const newFilters = {
          stores: formik.values.stores.length
            ? formik.values.stores.map((store) => store.value)
            : defaultStores,
          vendors: formik.values.vendors.length
            ? formik.values.vendors.map((vendor) => vendor.value)
            : defaultVendors,
          startDate: formik.values.startDate,
          endDate: formik.values.endDate,
          search: formik.values.search,
          page,
          limit: 50,
        };
        debouncedFetchJobWorks(newFilters);
      }
    },
    [formik.values, debouncedFetchJobWorks]
  );

  const storeOptions = useMemo(() => {
    return storeData.map((store) => ({
      value: store._id,
      label: `${store.name} / ${store.storeNumber}`,
    }));
  }, [storeData]);

  const vendorOptions = useMemo(() => {
    return vendorData.map((vendor) => ({
      value: vendor._id,
      label: vendor.companyName,
    }));
  }, [vendorData]);

  const [hasSetDefaultStore, setHasSetDefaultStore] = useState(false);

  useEffect(() => {
    if (!hasSetDefaultStore && storeOptions.length > 0) {
      const defaultOptions = storeOptions.filter((opt) =>
        defaultStores.includes(opt.value)
      );
      if (defaultOptions.length > 0) {
        formik.setFieldValue("stores", defaultOptions);
        setHasSetDefaultStore(true);
      }
    }
  }, [storeOptions, hasSetDefaultStore, formik]);

  const toggleSplit = useCallback((rowId) => {
    setExpandedRows((prev) => {
      console.log("Toggling row:", rowId, "Current expandedRows:", prev);
      return prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId];
    });
  }, []);

  const handleSelect = useCallback((id) => {
    setTableData((prev) =>
      prev.map((row) =>
        row._id === id ? { ...row, selected: !row.selected } : row
      )
    );
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleCreateVendorInvoice = useCallback(() => {
    const selectedJobs = tableData
      .filter((row) => row.selected)
      .map((row) => row.fullJob);
    console.log("Creating vendor invoice for:", selectedJobs);
    toast.success("Vendor invoice creation initiated (check console)");
  }, [tableData]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Select",
        cell: ({ row }) => (
          <Form.Check
            type="checkbox"
            checked={row.original.selected}
            onChange={() => handleSelect(row.original._id)}
            className="fs-5"
          />
        ),
      },
      {
        accessorKey: "invoiceNumber",
        header: "Invoice Number",
        cell: ({ getValue }) => <div>{getValue()}</div>,
      },
      {
        accessorKey: "invoiceDate",
        header: "Invoice Date",
        cell: ({ getValue }) => <div>{getValue()}</div>,
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ getValue }) => <div>{getValue()}</div>,
      },
      {
        accessorKey: "storeName",
        header: "Store",
        cell: ({ getValue }) => <div>{getValue()}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <div>{getValue()}</div>,
      },
    ],
    [handleSelect]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
  });

  const startRow =
    pagination.totalDocs > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endRow =
    pagination.totalDocs > 0
      ? Math.min(pagination.page * pagination.limit, pagination.totalDocs)
      : 0;
  const totalRows = pagination.totalDocs;

  const renderTableContent = useMemo(
    () => () => {
      if (loading || !dataLoaded) {
        return (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        );
      }

      if (tableData.length === 0) {
        return (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <p className="text-muted">No job works found.</p>
          </div>
        );
      }

      return (
        <>
          <table className="table table-hover table-sm">
            <thead className="table-light text-uppercase small">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                  <th className="py-3 px-4"></th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td
                      className="py-3 px-4 text-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSplit(row.original._id)}
                    >
                      {expandedRows.includes(row.original._id) ? (
                        <FaAngleDown />
                      ) : (
                        <FaAngleRight />
                      )}
                    </td>
                  </tr>
                  {expandedRows.includes(row.original._id) && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="table-responsive">
                          {console.log(
                            "Rendering expanded row for ID:",
                            row.original._id,
                            "ExpandedRows:",
                            expandedRows,
                            "FullJob:",
                            row.original.fullJob
                          )}
                          <table className="table mb-0 table-bordered">
                            <thead className="table-secondary small">
                              <tr>
                                <th className="py-2 px-3">Product SKU</th>
                                <th className="py-2 px-3">Lens SKU</th>
                                <th className="py-2 px-3">Side</th>
                                <th className="py-2 px-3">Vendor</th>
                                <th className="py-2 px-3">Total Amount</th>
                                <th className="py-2 px-3">Sale Note</th>
                                <th className="py-2 px-3">Power Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.product?.sku || "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.lens?.sku || "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.side || "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.vendor?.companyName ||
                                    "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.sale?.totalAmount ||
                                    "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.sale?.note || "N/A"}
                                </td>
                                <td className="py-2 px-3">
                                  {row.original.fullJob?.powerAtTime?.specs ? (
                                    <div>
                                      <strong>Right:</strong> Sph:{" "}
                                      {row.original.fullJob.powerAtTime.specs
                                        .right?.distance?.sph || "N/A"}
                                      , Add:{" "}
                                      {row.original.fullJob.powerAtTime.specs
                                        .right?.distance?.add || "N/A"}
                                      <br />
                                      <strong>Left:</strong> Sph:{" "}
                                      {row.original.fullJob.powerAtTime.specs
                                        .left?.distance?.sph || "N/A"}
                                      , Add:{" "}
                                      {row.original.fullJob.powerAtTime.specs
                                        .left?.distance?.add || "N/A"}
                                    </div>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {tableData.length !== 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
              <div className="text-muted mb-3 mb-md-0">
                Showing <strong>{startRow}</strong> to <strong>{endRow}</strong>{" "}
                of <strong>{totalRows}</strong> results
              </div>
              <div className="btn-group">
                <Button
                  variant="outline-primary"
                  onClick={() => handlePageChange(pagination.prevPage)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => handlePageChange(pagination.nextPage)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      );
    },
    [
      loading,
      dataLoaded,
      tableData,
      table,
      pagination,
      handlePageChange,
      toggleSplit,
      startRow,
      endRow,
      totalRows,
      expandedRows,
    ]
  );

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <form onSubmit={formik.handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="row g-3">
                  <div className="col-6">
                    <label htmlFor="startDate" className="form-label fw-bold">
                      Start Date
                    </label>
                    <DatePicker
                      selected={formik.values.startDate}
                      onChange={(date) =>
                        formik.setFieldValue("startDate", date)
                      }
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      autoComplete="off"
                    />
                    {formik.touched.startDate && formik.errors.startDate ? (
                      <div className="text-danger small">
                        {formik.errors.startDate}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-6">
                    <label htmlFor="endDate" className="form-label fw-bold">
                      End Date
                    </label>
                    <DatePicker
                      selected={formik.values.endDate}
                      onChange={(date) => formik.setFieldValue("endDate", date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      autoComplete="off"
                    />
                    {formik.touched.endDate && formik.errors.endDate ? (
                      <div className="text-danger small">
                        {formik.errors.endDate}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-bold">Stores</label>
                    <Select
                      options={storeOptions}
                      value={formik.values.stores}
                      onChange={(selected) =>
                        formik.setFieldValue("stores", selected || [])
                      }
                      isMulti
                      classNamePrefix="react-select"
                      placeholder="Select stores..."
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold">Vendors</label>
                    <Select
                      options={vendorOptions}
                      value={formik.values.vendors}
                      onChange={(selected) =>
                        formik.setFieldValue("vendors", selected || [])
                      }
                      isMulti
                      classNamePrefix="react-select"
                      placeholder="Select vendors..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Loading..." : "Submit"}
              </Button>
            </div>
          </form>

          {selectedRows.length > 0 && (
            <div className="mt-4">
              <Button
                variant="success"
                onClick={handleCreateVendorInvoice}
                disabled={loading}
              >
                {loading ? "Processing..." : "Create Vendor Invoice"}
              </Button>
            </div>
          )}

          <div className="table-responsive mt-4">{renderTableContent()}</div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default VendorInvoice;
