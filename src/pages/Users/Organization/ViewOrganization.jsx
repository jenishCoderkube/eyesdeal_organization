import React, { useState, useMemo, useEffect } from "react";
import { FaEye, FaSearch, FaTimes } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useDebounce } from "use-debounce";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import { Modal, Button, Tab, Nav } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { defalutImageBasePath } from "../../../utils/constants";
import Pagination from "../../../components/Common/Pagination";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewOrganization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ specs: null, contacts: null });
  const [activeTab, setActiveTab] = useState("specs");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    pagingCounter: 1,
  });
  const [debouncedSearch] = useDebounce(searchQuery, 800);

  useEffect(() => {
    fetchCustomers(pagination.page, debouncedSearch);
  }, [pagination.page, debouncedSearch]);

  const fetchCustomers = async (page, search) => {
    setLoading(true);
    try {
      const response = await userService.getOrganizationByLimit({
        page,
        limit: pagination.limit,
        search,
      });

      if (response.success) {
        const {
          docs,
          totalDocs,
          totalPages,
          page,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          pagingCounter,
        } = response.data.data;
        setCustomers(docs || []);
        setPagination((prev) => ({
          ...prev,
          page,
          totalDocs,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          pagingCounter,
        }));
      }
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          String(item._id),
          item.name,
          String(item.phone),
          String(item.prescriptions),
        ].some((field) => field?.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(customers, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, customers, filterGlobally]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const tableData = filteredData || customers;

  const handleView = (data) => {
    setViewData(data);
    setShowViewModal(true);
  };

  // Organization View Modal Content (Improved)
  const OrganizationViewModalContent = ({ data }) => {
    const user = data.user || {};

    // Handle image URLs (prepend your CDN/base URL if needed)
    const getImageUrl = (path) => {
      if (!path) return null;
      // Example: prepend API base if only relative path is stored
      if (path.startsWith("http")) return path;
      return `${defalutImageBasePath}${path}`;
    };

    return (
      <div className="p-4">
        <h5 className="mb-3 fw-bold border-bottom pb-2 text-primary">
          Organization Details
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <strong>Organization Name:</strong> {data.companyName || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Partner Type:</strong> {data.partnerType || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Status:</strong> {data.status || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Max Store:</strong> {data.maxStore ?? "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Company Number:</strong> {data.companyNumber || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>GST Number:</strong> {data.gstNumber || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Country:</strong> {data.country || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>State:</strong> {data.state || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>City:</strong> {data.city || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Pincode:</strong> {data.pincode || "N/A"}
          </div>
          <div className="col-12">
            <strong>Address:</strong> {data.address || "N/A"}
          </div>
        </div>

        <h5 className="mt-4 mb-3 fw-bold border-bottom pb-2 text-success">
          Owner Details
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <strong>Name:</strong> {user.name || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Phone:</strong> {user.phone || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Gender:</strong> {user.gender || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Role:</strong> {user.role || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Country:</strong> {user.country || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>State:</strong> {user.state || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>City:</strong> {user.city || "N/A"}
          </div>
          <div className="col-md-6">
            <strong>Pincode:</strong> {user.pincode || "N/A"}
          </div>
          <div className="col-12">
            <strong>Address:</strong> {user.address || "N/A"}
          </div>
        </div>

        <h5 className="mt-4 mb-3 fw-bold border-bottom pb-2 text-info">
          Uploaded Images
        </h5>
        <div className="row g-3">
          <div className="col-md-6 d-flex flex-column">
            <strong>Company Logo:</strong>
            {data.companyLogo ? (
              <img
                src={getImageUrl(data.companyLogo)}
                alt="Company Logo"
                className="img-fluid rounded mt-2"
                style={{ maxHeight: "120px", objectFit: "cover" }}
              />
            ) : (
              <span className="text-muted ms-2">No image</span>
            )}
          </div>
          <div className="col-md-6  d-flex flex-column">
            <strong>ERP Banner:</strong>
            {data.erpBanner ? (
              <img
                src={getImageUrl(data.erpBanner)}
                alt="ERP Banner"
                className="img-fluid rounded mt-2"
                style={{ maxHeight: "120px", objectFit: "cover" }}
              />
            ) : (
              <span className="text-muted ms-2">No image</span>
            )}
          </div>
          <div className="col-md-6  d-flex flex-column">
            <strong>Sales App Banner:</strong>
            {data.salesBanner ? (
              <img
                src={getImageUrl(data.salesBanner)}
                alt="Sales App Banner"
                className="img-fluid rounded mt-2"
                style={{ maxHeight: "120px", objectFit: "cover" }}
              />
            ) : (
              <span className="text-muted ms-2">No image</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ table, row }) => (
          <div className="text-left">
            {(pagination.page - 1) * pagination.limit +
              table?.getSortedRowModel()?.flatRows?.indexOf(row) +
              1}
          </div>
        ),
      },
      {
        accessorKey: "org_code",
        header: "Organization Code",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "—"}</div>
        ),
      },
      {
        accessorKey: "companyName",
        header: "Organization Name",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "—"}</div>
        ),
      },
      {
        id: "ownerName",
        header: "Owner Name",
        cell: ({ row }) => (
          <div className="text-left">{row.original?.user?.name || "—"}</div>
        ),
      },
      {
        id: "state",
        header: "State",
        cell: ({ row }) => (
          <div className="text-left">{row.original?.user?.state || "—"}</div>
        ),
      },
      {
        id: "city",
        header: "City",
        cell: ({ row }) => (
          <div className="text-left">{row.original?.user?.city || "—"}</div>
        ),
      },
      {
        accessorKey: "partnerType",
        header: "Partner Type",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "—"}</div>
        ),
      },
      {
        accessorKey: "maxStore",
        header: "Max Store",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() ?? 0}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Org Status",
        cell: ({ getValue }) => (
          <span
            className={`badge ${
              getValue() === "Active" ? "bg-success" : "bg-danger"
            }`}
          >
            {getValue() || "—"}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="d-flex gap-2 align-items-center">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => handleView(row.original)}
            >
              View
            </button>
            <FiEdit2
              size={18}
              className="text-primary cursor-pointer"
              onClick={() => handleEdit(row.original)}
            />
            <MdDeleteOutline
              size={24}
              className="text-danger cursor-pointer"
              onClick={() => handleDelete(row.original._id)}
            />
          </div>
        ),
      },
    ],
    [pagination.page, pagination.limit]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pagination.limit,
      },
    },
  });

  const handleEdit = (store) => {
    navigate(`/organization/${store?._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        const response = await userService.deleteOrganization(id);
        if (response.success) {
          fetchCustomers(pagination.page, debouncedSearch);
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (e) {
        toast.error("Failed to delete Organization");
      }
    }
  };

  const handlePageClick = ({ selected }) => {
    const selectedPage = selected + 1; // react-paginate is 0-based
    setPagination((prev) => ({ ...prev, page: selectedPage }));
  };

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Organization</h1>
          </div>
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Organizations</h6>
            <div className="card-body px-2 py-3">
              <div className="mb-4 col-md-5">
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
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="p-3 text-left custom-perchase-th"
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
                        {table.getRowModel().rows.map((row) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {pagination.pagingCounter} to{" "}
                      {Math.min(
                        pagination.pagingCounter + pagination.limit - 1,
                        pagination.totalDocs
                      )}{" "}
                      of {pagination.totalDocs} entries
                    </div>

                    <Pagination
                      pageCount={pagination?.totalPages || 1}
                      currentPage={pagination.page || 1} // 1-based
                      onPageChange={handlePageClick}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Organization View Modal */}
          <Modal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            centered
            size="lg"
          >
            <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
              <Modal.Title className="font-semibold text-slate-800">
                View Organization Details
              </Modal.Title>
              <Button
                variant="link"
                onClick={() => setShowViewModal(false)}
                className="p-0"
                style={{ lineHeight: 0 }}
              >
                <FaTimes
                  className="text-secondary"
                  style={{ width: "24px", height: "24px" }}
                />
              </Button>
            </Modal.Header>
            <Modal.Body
              className="p-0"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {viewData && <OrganizationViewModalContent data={viewData} />}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ViewOrganization;
