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
import { debounce } from "lodash";
import VendorInvoiceModal from "../../components/Process/VendorInvoice/VendorInvoiceModal";
import { vendorInvoiceService } from "../../services/Process/vendorInvoiceService";

function VendorInvoice() {
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  const users = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  const defaultStartDate = new Date("2024-12-01");
  const defaultEndDate = new Date("2024-12-31");

  const formik = useFormik({
    initialValues: {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      store: null,
      vendor: null,
      search: "",
    },
    validationSchema: Yup.object({
      startDate: Yup.date().required("Start date is required"),
      endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),
      store: Yup.object().nullable().required("Store is required"),
      vendor: Yup.object().nullable().required("Vendor is required"),
    }),
    onSubmit: (values) => {
      const filters = {
        stores: values.store ? [values.store.value] : [],
        vendors: values.vendor ? [values.vendor.value] : [],
        startDate: values.startDate,
        endDate: values.endDate,
        search: values.search,
        page: 1,
        limit: 50,
      };
      if (!filters.stores.length || !filters.vendors.length) {
        toast.error("Please select both a store and a vendor");
        return;
      }
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
                customerName: job.sale?.customerName || "N/A",
                storeName: job.store?.name || "N/A",
                status: job.status || "N/A",
                selected: false,
                fullJob: job,
                ...job,
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
      await Promise.all([getStores(), getVendors()]);
    };
    initialize();
    return () => debouncedFetchJobWorks.cancel();
  }, [debouncedFetchJobWorks]);

  const handlePageChange = useCallback(
    (page) => {
      if (page) {
        const newFilters = {
          stores: formik.values.store ? [formik.values.store.value] : [],
          vendors: formik.values.vendor ? [formik.values.vendor.value] : [],
          startDate: formik.values.startDate,
          endDate: formik.values.endDate,
          search: formik.values.search,
          page,
          limit: 50,
        };
        if (!newFilters.stores.length || !newFilters.vendors.length) {
          toast.error("Please select both a store and a vendor");
          return;
        }
        debouncedFetchJobWorks(newFilters);
      }
    },
    [formik.values, debouncedFetchJobWorks]
  );

  const storeOptions = useMemo(() => {
    return storeData.map((store) => ({
      value: store._id,
      label: `${store.name}`,
    }));
  }, [storeData]);

  const vendorOptions = useMemo(() => {
    return vendorData.map((vendor) => ({
      value: vendor._id,
      label: vendor.companyName,
    }));
  }, [vendorData]);

  const toggleSplit = useCallback((rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
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
    if (selectedRows.length === 0) {
      toast.error("Please select at least one job work");
      return;
    }
    if (!formik.values.store || !formik.values.vendor) {
      toast.error("Please select both a store and a vendor");
      return;
    }
    setShowModal(true);
  }, [selectedRows, formik.values]);

  const handleModalSubmit = useCallback(
    async (invoiceData) => {
      try {
        setLoading(true);
        const selectedJobs = tableData
          .filter((row) => row.selected)
          .map((row) => row._id);
        const payload = {
          store: formik.values.store?.value || "",
          vendor: formik.values.vendor?.value || "",
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate.toISOString().split("T")[0],
          jobWork: selectedJobs,
        };

        if (!payload.store || !payload.vendor) {
          toast.error("Please select both a store and a vendor");
          return;
        }

        const response = await vendorInvoiceService.createVendorInvoice(
          payload
        );
        if (response.success) {
          toast.success("Vendor invoice created successfully");
          setShowModal(false);
          formik.handleSubmit(); // Refresh the table
        } else {
          toast.error(response.message || "Failed to create vendor invoice");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [formik, tableData]
  );

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
      if (loading) {
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
                    {console.log("row<<<", row.original)}
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
                    <label className="form-label fw-bold">Store</label>
                    <Select
                      options={storeOptions}
                      value={formik.values.store}
                      onChange={(selected) =>
                        formik.setFieldValue("store", selected)
                      }
                      onBlur={() => formik.setFieldTouched("store", true)}
                      classNamePrefix="react-select"
                      placeholder="Select store..."
                    />
                    {formik.touched.store && formik.errors.store ? (
                      <div className="text-danger small">
                        {formik.errors.store}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold">Vendor</label>
                    <Select
                      options={vendorOptions}
                      value={formik.values.vendor}
                      onChange={(selected) =>
                        formik.setFieldValue("vendor", selected)
                      }
                      onBlur={() => formik.setFieldTouched("vendor", true)}
                      classNamePrefix="react-select"
                      placeholder="Select vendor..."
                    />
                    {formik.touched.vendor && formik.errors.vendor ? (
                      <div className="text-danger small">
                        {formik.errors.vendor}
                      </div>
                    ) : null}
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
                variant="primary"
                onClick={handleCreateVendorInvoice}
                disabled={loading}
              >
                {loading ? "Processing..." : "Create Vendor Invoice"}
              </Button>
            </div>
          )}

          <div className="table-responsive mt-4">{renderTableContent()}</div>

          <VendorInvoiceModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSubmit={handleModalSubmit}
            loading={loading}
          />
        </Card.Body>
      </Card>
    </div>
  );
}

export default VendorInvoice;
