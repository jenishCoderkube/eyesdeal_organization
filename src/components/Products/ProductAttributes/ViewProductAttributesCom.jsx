import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EditAttributeModal from "./EditAttributeModal"; // Adjust the path as needed
import "bootstrap/dist/css/bootstrap.min.css";
import { productAttributeService } from "../../../services/productAttributeService";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);
  const [attributeData, setAttributeData] = useState({});

  console.log(activeTab);
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
    "lensTechnology",
    "disposability",
  ];

  // Fetch attribute data when active tab changes
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}`);
    console.log(`Current attribute data:`, attributeData);
    console.log(
      `Has data for ${activeTab}: ${Boolean(attributeData[activeTab])}`
    );

    // Reset filtered data when changing tabs
    setFilteredData(null);
    setSearchQuery("");

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching ${activeTab} data...`);
        const response = await productAttributeService.getAttributes(activeTab);
        console.log(`${activeTab} API response:`, response);

        if (response.success) {
          if (!response.data || !Array.isArray(response.data)) {
            console.error(`${activeTab} data is not an array:`, response.data);
            toast.error(`Invalid ${activeTab} data format`);
            setLoading(false);
            return;
          }

          const formattedData = response.data.map((item) => ({
            id: item._id,
            name: item.name,
          }));

          console.log(`${activeTab} formatted data:`, formattedData);

          setAttributeData((prev) => ({
            ...prev,
            [activeTab]: formattedData,
          }));
        } else {
          console.error(`Error fetching ${activeTab}:`, response.message);
          toast.error(response.message || `Error fetching ${activeTab} data`);
          // Clear data for this tab if fetch failed
          setAttributeData((prev) => ({
            ...prev,
            [activeTab]: [],
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        toast.error(`Failed to load ${activeTab} data`);
        // Clear data for this tab if fetch failed
        setAttributeData((prev) => ({
          ...prev,
          [activeTab]: [],
        }));
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data when the tab changes
    fetchData();
  }, [activeTab]);

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
    if (!attributeData[activeTab]) return;

    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(attributeData[activeTab], query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, activeTab, filterGlobally, attributeData]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || attributeData[activeTab] || [];

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ row }) => <div className="text-left">{row.index + 1}</div>,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          // Capture the current active tab for this row's actions
          const rowTab = activeTab;
          const rowData = row.original;

          // Log the row data for debugging
          console.log(`Row data for ${rowTab}:`, rowData);

          return (
            <div className="d-flex gap-2 align-items-center">
              <FiEdit2
                size={18}
                className="text-primary cursor-pointer"
                onClick={() => handleEdit(rowData)}
              />
              <MdDeleteOutline
                size={24}
                className="text-danger cursor-pointer"
                onClick={() => {
                  console.log(
                    `Delete icon clicked for ${rowTab}, id: ${rowData.id}`
                  );
                  handleDelete(rowData.id, rowTab);
                }}
              />
            </div>
          );
        },
      },
    ],
    [activeTab] // Add activeTab as a dependency so columns are re-created when tab changes
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

  const handleEditSubmit = async (updatedData) => {
    try {
      // Prepare the data with the format required by the API
      const apiData = {
        name: updatedData.name,
      };

      console.log(`Submitting update for ${activeTab}:`, {
        id: updatedData.id,
        data: apiData,
      });

      const response = await productAttributeService.updateAttribute(
        activeTab,
        updatedData.id,
        apiData
      );

      if (response.success) {
        // Update the local state
        const updatedAttributeData = {
          ...attributeData,
          [activeTab]: attributeData[activeTab].map((item) =>
            item.id === updatedData.id
              ? { ...item, name: updatedData.name }
              : item
          ),
        };

        setAttributeData(updatedAttributeData);
        setFilteredData(
          searchQuery
            ? filterGlobally(updatedAttributeData[activeTab], searchQuery)
            : null
        );

        toast.success(
          `${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } updated successfully`
        );
      } else {
        toast.error(response.message || `Failed to update ${activeTab}`);
      }
    } catch (error) {
      console.error(`Error updating ${activeTab}:`, error);
      toast.error(`Failed to update ${activeTab}`);
    }
  };

  const handleDelete = async (id, tabName) => {
    // Use the passed tabName parameter instead of activeTab
    const currentTab = tabName || activeTab;

    console.log(`Delete initiated for id ${id} on tab "${currentTab}"`);
    console.log(`Current state of attributeData:`, attributeData);

    // Check if the data for current tab exists - force fetch if not available
    if (!attributeData[currentTab] || attributeData[currentTab].length === 0) {
      console.log(
        `Data not yet available for ${currentTab}, fetching it first...`
      );
      try {
        const fetchResponse = await productAttributeService.getAttributes(
          currentTab
        );
        if (fetchResponse.success) {
          const formattedData = fetchResponse.data.map((item) => ({
            id: item._id,
            name: item.name,
          }));

          // Update attribute data with the fetched data
          setAttributeData((prev) => ({
            ...prev,
            [currentTab]: formattedData,
          }));
        } else {
          console.error(`Failed to fetch data for ${currentTab}`);
          toast.error(`Cannot delete: Failed to load ${currentTab} data`);
          return;
        }
      } catch (error) {
        console.error(`Error fetching ${currentTab} data:`, error);
        toast.error(`Cannot delete: Failed to load ${currentTab} data`);
        return;
      }
    }

    if (window.confirm(`Are you sure you want to delete this ${currentTab}?`)) {
      try {
        console.log(
          `Delete operation initiated for attribute type: ${currentTab} with id: ${id}`
        );

        const response = await productAttributeService.deleteAttribute(
          currentTab,
          id
        );

        if (response.success) {
          console.log(`Delete response for ${currentTab}:`, response);

          // If the API returned the updated list, use it directly
          if (response.updatedList && Array.isArray(response.updatedList)) {
            console.log(`Using updatedList from response for ${currentTab}`);
            const formattedData = response.updatedList.map((item) => ({
              id: item._id,
              name: item.name,
            }));

            console.log(`Formatted data for ${currentTab}:`, formattedData);

            // Update the attribute data in state
            setAttributeData((prev) => {
              const newData = {
                ...prev,
                [currentTab]: formattedData,
              };
              console.log(`Updated attributeData after delete:`, newData);
              return newData;
            });

            // Only update filtered data if we're still on the same tab
            if (currentTab === activeTab) {
              setFilteredData(
                searchQuery ? filterGlobally(formattedData, searchQuery) : null
              );
            }
          } else {
            // Otherwise refresh the data manually
            console.log(
              `No updatedList in response, manually refreshing ${currentTab}`
            );
            const refreshResponse =
              await productAttributeService.refreshAttributeData(currentTab);

            if (refreshResponse.success) {
              console.log(`Manual refresh successful for ${currentTab}`);
              const formattedData = refreshResponse.data.map((item) => ({
                id: item._id,
                name: item.name,
              }));

              console.log(
                `Manually refreshed data for ${currentTab}:`,
                formattedData
              );

              setAttributeData((prev) => {
                const newData = {
                  ...prev,
                  [currentTab]: formattedData,
                };
                console.log(
                  `Updated attributeData after manual refresh:`,
                  newData
                );
                return newData;
              });

              // Only update filtered data if we're still on the same tab
              if (currentTab === activeTab) {
                setFilteredData(
                  searchQuery
                    ? filterGlobally(formattedData, searchQuery)
                    : null
                );
              }
            } else {
              // If refresh fails, just remove the deleted item from state
              console.log(
                `Manual refresh failed for ${currentTab}, removing item from state`
              );

              // Only update state if we have data for this tab
              if (attributeData[currentTab]) {
                const updatedAttributeData = {
                  ...attributeData,
                  [currentTab]: attributeData[currentTab].filter(
                    (item) => item.id !== id
                  ),
                };

                console.log(
                  `Updated attributeData after filter:`,
                  updatedAttributeData
                );
                setAttributeData(updatedAttributeData);

                // Only update filtered data if we're still on the same tab
                if (currentTab === activeTab) {
                  setFilteredData(
                    searchQuery
                      ? filterGlobally(
                          updatedAttributeData[currentTab],
                          searchQuery
                        )
                      : null
                  );
                }
              }
            }
          }

          toast.success(
            response.message ||
              `${
                currentTab.charAt(0).toUpperCase() + currentTab.slice(1)
              } deleted successfully`
          );
        } else {
          console.error(
            `Delete operation failed for ${currentTab}:`,
            response.message
          );
          toast.error(response.message || `Failed to delete ${currentTab}`);
        }
      } catch (error) {
        console.error(
          `Error during delete operation for ${currentTab}:`,
          error
        );
        toast.error(`Failed to delete ${currentTab}`);
      }
    }
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
                      console.log(`Clicked on tab: ${item}`);
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
              <div className="table-responsive px-2">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading {activeTab} data...</p>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="text-center py-5">
                    <p>No {activeTab} data found.</p>
                  </div>
                ) : (
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
                )}
              </div>
              {/* Pagination */}
              {!loading && tableData.length > 0 && (
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
              )}
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
