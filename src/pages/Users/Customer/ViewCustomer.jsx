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
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import { Modal, Nav, Tab, Button } from "react-bootstrap";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewCustomer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ specs: null, contacts: null });
  const [activeTab, setActiveTab] = useState("specs");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    userService
      .getCustomers()
      .then((res) => {
        console.log("API Response:", res.data?.data?.docs);
        setCustomers(res.data?.data?.docs || []);
      })
      .catch((e) => {
        console.log("Failed to fetch customers: ", e);
        toast.error("Failed to fetch customers");
        setCustomers([]);
      })
      .finally(() => setLoading(false));
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
  };

  const tableData = filteredData || customers;

  const handleViewPrescriptions = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }
    const prescriptions = customer.prescriptions || [];
    if (prescriptions.length === 0) {
      toast.info("No prescriptions available for this customer");
      return;
    }

    const specsPrescription = prescriptions.find((p) => p.__t === "specs");
    const contactsPrescription = prescriptions.find(
      (p) => p.__t === "contacts"
    );

    setModalData({
      specs: specsPrescription || null,
      contacts: contactsPrescription || null,
    });

    setActiveTab(specsPrescription ? "specs" : "contacts");
    setShowModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ table, row }) => (
          <div className="text-left">
            {table?.getSortedRowModel()?.flatRows?.indexOf(row) + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "prescriptions",
        header: "Prescriptions",
        cell: ({ getValue, row }) => (
          <div className="text-left d-flex align-items-center gap-2">
            {getValue()?.length > 0 && (
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center"
                onClick={() => handleViewPrescriptions(row.original._id)}
                title="View Prescriptions"
                disabled={loading}
              >
                <FaEye size={16} />
                <span className="ms-2">View</span>
              </button>
            )}
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="d-flex gap-2 align-items-center">
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
    [loading]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });

  const handleEdit = (store) => {
    navigate(`/customer/${store?._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        const response = await userService.deleteCustomer(id);
        if (response.success) {
          fetchCustomers();
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (e) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  // Modal content for both Specs and Contacts
  const PrescriptionModalContent = ({ specsData, contactsData }) => (
    <>
      {specsData || contactsData ? (
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav
            variant="tabs"
            className="relative mb-4 mt-2 border-top-0 border-start-0 border-end-0 border-bottom border-slate-200"
          >
            {specsData && (
              <Nav.Item className="me-4">
                <Nav.Link
                  eventKey="specs"
                  className={`pb-3 text-sm font-medium ${
                    activeTab === "specs"
                      ? "text-indigo-500 border-top-0 border-start-0 border-end-0 border-bottom border-primary border-3"
                      : "text-slate-500 hover:text-slate-600"
                  }`}
                  style={{
                    color: activeTab === "specs" ? "#6366f1" : "black",
                  }}
                >
                  Specs
                </Nav.Link>
              </Nav.Item>
            )}
            {contactsData && (
              <Nav.Item className="me-4">
                <Nav.Link
                  eventKey="contact"
                  className={`pb-3 text-sm font-medium ${
                    activeTab === "contact"
                      ? "text-indigo-500 border-top-0 border-start-0 border-end-0 border-bottom border-primary border-3"
                      : "text-slate-500 hover:text-slate-600"
                  }`}
                  style={{
                    color: activeTab === "contact" ? "#6366f1" : "black",
                  }}
                >
                  Contact
                </Nav.Link>
              </Nav.Item>
            )}
            <div
              className="absolute bottom-0 w-100 h-px bg-slate-200"
              aria-hidden="true"
            />
          </Nav>
          <Tab.Content>
            {specsData && (
              <Tab.Pane eventKey="specs" className="overflow-auto">
                <div className="p-4">
                  <div className="d-flex flex-column flex-md-row gap-4 mb-3">
                    <div className="flex-grow-1">
                      <label className="d-block text-sm font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          specsData.createdAt?.split("T")[0] || "02/05/2025"
                        }
                        readOnly
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="d-block text-sm font-medium mb-1">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={specsData.doctorName || "ABD"}
                        readOnly
                      />
                    </div>
                  </div>
                  <h4
                    className="mt-2 mb-3 fw-normal"
                    style={{ fontSize: "17px" }}
                  >
                    Specs Power
                  </h4>
                  <table className="table table-bordered table-sm w-100">
                    <thead className="text-xs text-uppercase text-slate-500 bg-light">
                      <tr>
                        <th className="border border-slate-300 px-2 py-3"></th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RESPH
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RECYL
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RAXIS
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RVISION
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          ADD
                        </th>
                        <th className="border custom-perchase-th px-2 py-3"></th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LESPH
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LECYL
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LAXIS
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LVISION
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          ADD
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 text-center max-w-20px">
                          D
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.distance.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.distance.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.distance.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.distance.vs}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.distance.add}
                        </td>
                        <td className="border border-slate-300"></td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.distance.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.distance.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.distance.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.distance.vs}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.distance.add}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 text-center max-w-20px">
                          N
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.near.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.near.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.near.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.right.near.vs}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px"></td>
                        <td className="border border-slate-300"></td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.near.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.near.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.near.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {specsData.left.near.vs}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px"></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-2 border p-2">
                    <div className="d-flex justify-content-around flex-wrap gap-3">
                      {[
                        { label: "Psm(R)", value: specsData.right.psm },
                        { label: "Pd(R)", value: specsData.right.pd },
                        { label: "Fh(R)", value: specsData.right.fh },
                        { label: "IPD", value: specsData.ipd },
                        { label: "Psm(L)", value: specsData.left.psm },
                        { label: "Pd(L)", value: specsData.left.pd },
                        { label: "Fh(L)", value: specsData.left.fh },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-sm text-slate-600">
                          {label}: {value || "-"}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 border p-2">
                    <div className="d-flex justify-content-around flex-wrap gap-3">
                      {[
                        { label: "Asize", value: specsData.aSize },
                        { label: "Bsize", value: specsData.bSize },
                        { label: "DBL", value: specsData.dbl },
                        { label: "Fth", value: specsData.fth },
                        { label: "Pdesign", value: specsData.pDesign },
                        { label: "Ftype", value: specsData.ft },
                        { label: "DE", value: specsData.de },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-sm text-slate-600">
                          {label}: {value || "-"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Pane>
            )}
            {contactsData && (
              <Tab.Pane eventKey="contact" className="overflow-auto">
                <div className="p-4">
                  <div className="d-flex flex-column flex-md-row gap-4 mb-3">
                    <div className="flex-grow-1">
                      <label className="d-block text-sm font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          contactsData.createdAt?.split("T")[0] || "02/05/2025"
                        }
                        readOnly
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="d-block text-sm font-medium mb-1">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactsData.doctorName || "ABD"}
                        readOnly
                      />
                    </div>
                  </div>
                  <h4
                    className="mt-2 mb-3 fw-normal"
                    style={{ fontSize: "17px" }}
                  >
                    Contact Power
                  </h4>
                  <table className="table table-bordered table-sm w-100">
                    <thead className="text-xs text-uppercase text-slate-500 bg-light">
                      <tr>
                        <th className="border border-slate-300 px-2 py-3"></th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RESPH
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RECYL
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RAXIS
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          RVISION
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          ADD
                        </th>
                        <th className="border custom-perchase-th px-2 py-3"></th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LESPH
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LECYL
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LAXIS
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          LVISION
                        </th>
                        <th className="border custom-perchase-th px-2 py-3">
                          ADD
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 text-center max-w-20px">
                          D
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.distance.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.distance.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.distance.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.distance.add}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.distance.add}
                        </td>
                        <td className="border border-slate-300"></td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.distance.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.distance.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.distance.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.distance.add}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.distance.add}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 text-center max-w-20px">
                          N
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.near.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.near.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.right.near.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px"></td>
                        <td className="border border-slate-300 p-2 max-w-70px"></td>
                        <td className="border border-slate-300"></td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.near.sph}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.near.cyl}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px">
                          {contactsData.left.near.axis}
                        </td>
                        <td className="border border-slate-300 p-2 max-w-70px"></td>
                        <td className="border border-slate-300 p-2 max-70px"></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-2 border p-2">
                    <div className="d-flex justify-content-around flex-wrap gap-3">
                      {[
                        { label: "K(R)", value: contactsData.right.k },
                        { label: "Dia(R)", value: contactsData.right.dia },
                        { label: "Bc(R)", value: contactsData.right.bc },
                        { label: "K(L)", value: contactsData.left.k },
                        { label: "Dia(L)", value: contactsData.left.dia },
                        { label: "Bc(L)", value: contactsData.left.bc },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-sm text-slate-600">
                          {label}: {value || "-"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      ) : (
        <p className="p-4">No prescriptions available.</p>
      )}
    </>
  );

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Customers</h1>
          </div>
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Customers</h6>
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
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div>
                      Showing {startRow} to {endRow} of {totalRows} results
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || loading}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || loading}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Unified Prescription Modal */}
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            size="xl"
          >
            <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
              <Modal.Title className="font-semibold text-slate-800">
                View Prescriptions
              </Modal.Title>
              <Button
                variant="link"
                onClick={() => setShowModal(false)}
                className="p-0"
                style={{ lineHeight: 0 }}
              >
                <FaTimes
                  className="text-secondary"
                  style={{ width: "24px", height: "24px" }}
                />
              </Button>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ overflow: "hidden" }}>
              <PrescriptionModalContent
                specsData={modalData.specs}
                contactsData={modalData.contacts}
              />
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
