import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EditAttributeModal from "./EditAttributeModal"; // Adjust the path as needed
import "bootstrap/dist/css/bootstrap.min.css";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function ViewProductAttributesCom() {
  const [activeTab, setActiveTab] = useState("brand");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const navigate = useNavigate();

  // Attribute list for tabs
  const attributes = [
    "brand",
    "collection",
    "feature",
    "color",
    "frameStyle",
    "frameType",
    "unit",
    "frameShape",
    "material",
    "readingPower",
    "prescriptionType",
    "subCategory",
    "tax",
    "warranty",
    "lensTechnology",
    "disposability",
  ];

  // Sample data for each attribute with 5 dummy records
  const attributeData = {
    brand: [
      { id: 1, name: "Ray-Ban" },
      { id: 2, name: "FFELIZ" },
      { id: 3, name: "Oakley" },
      { id: 4, name: "Gucci" },
      { id: 5, name: "Prada" },
    ],
    collection: [
      { id: 1, name: "Classic" },
      { id: 2, name: "Trendy" },
      { id: 3, name: "Vintage" },
      { id: 4, name: "Modern" },
      { id: 5, name: "Sporty" },
    ],
    feature: [
      { id: 1, name: "Anti-Glare" },
      { id: 2, name: "UV Protection" },
      { id: 3, name: "Scratch Resistant" },
      { id: 4, name: "Blue Light Filter" },
      { id: 5, name: "Polarized" },
    ],
    color: [
      { id: 1, name: "Black" },
      { id: 2, name: "Blue" },
      { id: 3, name: "Red" },
      { id: 4, name: "Green" },
      { id: 5, name: "Gold" },
    ],
    frameStyle: [
      { id: 1, name: "Casual" },
      { id: 2, name: "Formal" },
      { id: 3, name: "Sport" },
      { id: 4, name: "Fashion" },
      { id: 5, name: "Retro" },
    ],
    frameType: [
      { id: 1, name: "Full Rim" },
      { id: 2, name: "Half Rim" },
      { id: 3, name: "Rimless" },
      { id: 4, name: "Semi-Rimless" },
      { id: 5, name: "Shield" },
    ],
    unit: [
      { id: 1, name: "Pair" },
      { id: 2, name: "Piece" },
      { id: 3, name: "Box" },
      { id: 4, name: "Set" },
      { id: 5, name: "Bottle" },
    ],
    frameShape: [
      { id: 1, name: "Rectangle" },
      { id: 2, name: "Round" },
      { id: 3, name: "Cat Eye" },
      { id: 4, name: "Aviator" },
      { id: 5, name: "Square" },
    ],
    material: [
      { id: 1, name: "Metal" },
      { id: 2, name: "Plastic" },
      { id: 3, name: "Acetate" },
      { id: 4, name: "Titanium" },
      { id: 5, name: "Wood" },
    ],
    readingPower: [
      { id: 1, name: "+1.00" },
      { id: 2, name: "+1.50" },
      { id: 3, name: "+2.00" },
      { id: 4, name: "+2.50" },
      { id: 5, name: "+3.00" },
    ],
    prescriptionType: [
      { id: 1, name: "Single Vision" },
      { id: 2, name: "Bifocal" },
      { id: 3, name: "Progressive" },
      { id: 4, name: "Reading" },
      { id: 5, name: "Non-Prescription" },
    ],
    subCategory: [
      { id: 1, name: "Eyeglasses" },
      { id: 2, name: "Sunglasses" },
      { id: 3, name: "Contact Lenses" },
      { id: 4, name: "Accessories" },
      { id: 5, name: "Reading Glasses" },
    ],
    tax: [
      { id: 1, name: "5%" },
      { id: 2, name: "12%" },
      { id: 3, name: "18%" },
      { id: 4, name: "28%" },
      { id: 5, name: "0%" },
    ],
    warranty: [
      { id: 1, name: "1 Year" },
      { id: 2, name: "2 Years" },
      { id: 3, name: "6 Months" },
      { id: 4, name: "3 Years" },
      { id: 5, name: "No Warranty" },
    ],
    lensTechnology: [
      { id: 1, name: "Blue Cut" },
      { id: 2, name: "Photochromic" },
      { id: 3, name: "Anti-Reflective" },
      { id: 4, name: "High Index" },
      { id: 5, name: "Polycarbonate" },
    ],
    disposability: [
      { id: 1, name: "Daily" },
      { id: 2, name: "Weekly" },
      { id: 3, name: "Monthly" },
      { id: 4, name: "Quarterly" },
      { id: 5, name: "Yearly" },
    ],
  };

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        ["id", "name"].some((field) =>
          String(item[field]).toLowerCase().includes(lowerQuery)
        )
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(attributeData[activeTab], query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, activeTab, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || attributeData[activeTab];

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
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
              onClick={() => handleDelete(row.original.id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  // @tanstack/react-table setup
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

  // Handle edit and delete actions
  const handleEdit = (attribute) => {
    setSelectedAttribute({ ...attribute, type: activeTab });
    setShowModal(true);
  };

  const handleEditSubmit = (updatedData) => {
    console.log("Updated attribute:", updatedData);
    // Update attributeData (for demo purposes)
    const updatedAttributeData = {
      ...attributeData,
      [activeTab]: attributeData[activeTab].map((item) =>
        item.id === updatedData.id ? { ...item, name: updatedData.name } : item
      ),
    };
    setFilteredData(
      filterGlobally(updatedAttributeData[activeTab], searchQuery)
    );
  };

  const handleDelete = (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete attribute with id: ${id}`);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAttribute(null);
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <div className="container-fluid px-4 py-5">
      <style>
        {`
          .text-color-purple {
            color: #6f42c1;
          }
        `}
      </style>
      {/* Mobile Horizontal Tabs */}
      <div className="d-md-none bg-light border-bottom">
        <div className="max-width-90 mx-auto py-md-3 py-2">
          <ul
            className="nav flex-row flex-nowrap overflow-x-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            {attributes.map((item) => (
              <li className="nav-item" key={item}>
                <a
                  className={`nav-link fw-normal ${
                    activeTab === item
                      ? "active text-color-purple"
                      : "text-black"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === item ? "rgb(238, 242, 255)" : "transparent",
                    borderRadius: "0.25rem",
                    display: "inline-block",
                    marginRight: "0.5rem",
                  }}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item);
                  }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="row max-width-90 mx-auto mt-5">
        {/* Desktop Vertical Tabs */}
        <div
          className="col-md-2 d-none d-md-block bg-light mt-5 border-end"
          style={{ minHeight: "100vh" }}
        >
          <div className="mx-auto mt-4">
            <ul className="nav flex-column">
              {attributes.map((item) => (
                <li className="nav-item" key={item}>
                  <a
                    className={`nav-link fw-normal ${
                      activeTab === item
                        ? "active text-color-purple"
                        : "text-black"
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === item
                          ? "rgb(238, 242, 255)"
                          : "transparent",
                      borderRadius: "0.25rem",
                    }}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item);
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Table Content */}
        <div className="col-12 col-md-10 p-md-4 mt-5 mt-md-0">
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h6>
            <div className="card-body px-0 py-3">
              {/* Search Bar */}
              <div className="mb-4 col-md-5">
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
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              {/* Table */}
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
              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                <div>
                  Showing {startRow} to {endRow} of {totalRows} results
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditAttributeModal
        show={showModal}
        onHide={handleModalClose}
        attribute={selectedAttribute}
        onSubmit={handleEditSubmit}
        type={activeTab}
      />
    </div>
  );
}

export default ViewProductAttributesCom;
