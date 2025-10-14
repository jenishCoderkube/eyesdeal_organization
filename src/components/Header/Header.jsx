import React from "react";
import { Link, useNavigate } from "react-router-dom";
import constants, { getUser } from "../../utils/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaChevronDown } from "react-icons/fa";
import { authService } from "../../services/authService";

const menuItems = [
  { label: "Dashboard", icon: "bi bi-display", link: "/dashboard" },
  {
    label: "Sale",
    icon: "bi bi-upload",

    submenu: [
      { label: "Sale", link: "/sale/new" },
      { label: "Sale Return", link: "/sale/list" },
    ],
  },
  {
    label: "Process",
    icon: "bi bi-journal-text",
    submenu: [
      // { label: "Start Process", link: "/process/start" },
      // { label: "Process History", link: "/process/history" },
      { label: "Shop Process", link: "/process/shop" },
      { label: "Workshop Process", link: "/process/Workshop" },
      { label: "Vendor List", link: "/process/vendorList" },
      { label: "Vendor Invoice", link: "/process/vendorInvoice" },
    ],
  },
  {
    label: "Purchase",
    icon: "bi bi-file-earmark-arrow-down",
    submenu: [
      { label: "Add Purchase", link: "/purchase/new" },
      { label: "View Purchase", link: "/purchase/list" },
      { label: "Bulk Purchase ", link: "/purchase/bulk-purchase" },
      { label: "Generate Barcode", link: "/purchase/generateBarcode" },
      { label: "ED Product Purchase", link: "/purchase/addproduct" },
      { label: "View Purchase Orders", link: "/purchase/viewPurchaseOrder" },
      {
        label: "Universal Stock Request",
        link: "/inventory/universal-stock-request-view",
      },
      {
        label: "Universal Stock Order",
        link: "/inventory/universal-stock-order-view",
      },
    ],
  },
  {
    label: "Inventory",
    icon: "bi bi-file-earmark-arrow-down",
    submenu: [
      { label: "Product Wise Inventory", link: "/inventory/product-wise" },
      { label: "Store Wise Inventory", link: "/inventory/store-wise" },
      { label: "Group Wise Inventory", link: "/inventory/group-wise" },
      { label: "Universal Search", link: "/inventory/universal-search" },
      { label: "Bulk Upload Inventory", link: "/inventory/bulk-upload" },
      { label: "Stock Out", link: "/inventory/stock-out" },
      { label: "Stock In", link: "/inventory/stock-in" },
      // { label: "Stock Sale", link: "/inventory/stock-sale" },
      // { label: "Stock Sale In", link: "/inventory/stock-sale-in" },
      // { label: "Stock Sale Out", link: "/inventory/stock-sale-out" },
      { label: "Transfer Stock", link: "/inventory/transfer-stock" },
      {
        label: "Bulk Upload Transfer Stock",
        link: "/inventory/transfer-bulk-stock",
      },
      { label: "Adjustment Stock", link: "/inventory/adjustment-stock" },
      {
        label: "View Adjustment Stock",
        link: "/inventory/view-adjustment-stock",
      },
      {
        label: "Stock Audit",
        link: "/inventory/stock-audit",
      },
      {
        label: "Stock Audit View",
        link: "/inventory/stock-audit-view",
      },
    ],
  },
  {
    label: "Users",
    icon: "bi bi-people", // You can change the icon class if needed
    submenu: [
      // { label: "Add Organization", link: "/users/add-organization" },
      { label: "Add Customer", link: "/users/addCustomer" },
      { label: "Add Employee", link: "/users/add-employee" },
      // { label: "View Organization", link: "/users/view-organization" },
      { label: "View Customer", link: "/users/view-customer" },
      { label: "View Employee", link: "/users/view-employee" },
      // { label: "View OTP", link: "/users/view-otp" },
      { label: "Add Vendor", link: "/users/add-vendor" },
      { label: "Marketing Reference", link: "/users/marketing-reference" },
      { label: "Bulk Upload Customer", link: "/users/bulk-upload-customer" },
    ],
  },
  {
    label: "Stores",
    icon: "bi bi-house-door", // Icon for store, you can adjust if needed
    submenu: [
      { label: "Add Store", link: "/stores/add-store" },
      { label: "Assign Store", link: "/stores/assign-store" },
      { label: "View Stores", link: "/stores/view-stores" },
    ],
  },
  {
    label: "Products",
    icon: "bi bi-box", // You can choose a different icon if you prefer
    submenu: [
      { label: "Add Product", link: "/products/add" },
      // { label: "Bulk Upload", link: "/products/bulk-upload" },
      // { label: "Bulk Edit Product", link: "/products/bulk-edit" },
      { label: "View Products", link: "/products/view" },
      { label: "View Product Attributes", link: "/products/view-attributes" },
      // { label: "Add Product Attributes", link: "/products/add-attributes" },
    ],
  },
  {
    label: "Cashbook",
    icon: "bi bi-cash-stack", // You can adjust the icon as needed
    submenu: [
      { label: "Add Expense", link: "/cashbook/add-expense" },
      { label: "Add Expense Category", link: "/cashbook/add-expense-category" },
      { label: "View Cashbook", link: "/cashbook/view" },
    ],
  },

  {
    label: "Media Library",
    icon: "bi bi-collection-play",
    link: "/media-library",
  },

  {
    label: "Reports",
    icon: "bi bi-clipboard2-data", // You can adjust the icon as needed
    submenu: [
      { label: "Product Sales Report", link: "/reports/product-sales-report" },
      { label: "Purchase Report", link: "/reports/purchase-report" },
      {
        label: "Product Purchase Report",
        link: "/reports/product-purchase-report",
      },
      { label: "Sales Report", link: "/reports/sales-report" },
      { label: "Vendor Report", link: "/reports/vendor-report" },
      { label: "Incentive Report", link: "/reports/incentive-report" },
      { label: "Cash Report", link: "/reports/cash-report" },
      { label: "Transfer Report", link: "/reports/transfer-report" },
      { label: "Adjustment Report", link: "/reports/adjustment-report" },
      { label: "ProfitLoss Report", link: "/reports/profitLoss-report" },
      { label: "GST Report", link: "/reports/gst-report" },
      // {
      //   label: "Empty Inventory Report",
      //   link: "/reports/empty-inventory-report",
      // },
      {
        label: "Recall Report",
        link: "/recall-report",
      },
    ],
  },
  {
    label: "Recall",
    icon: "bi bi-collection-play",
    link: "/re-call",
  },
  {
    label: "Packages",
    icon: "bi bi-cash-stack", // You can adjust the icon as needed
    submenu: [
      { label: "Packages List", link: "/packages-offer" },
      { label: "Bulk Upload Package", link: "/package/bulk-upload-package" },
    ],
  },

  // {
  //   label: "New Sale",
  //   icon: "bi bi-cash-stack", // You can adjust the icon as needed
  //   submenu: [{ label: "Sales", link: "/newsales" }],
  // },
];

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        {/* Brand Name */}

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav d-flex flex-wrap me-auto mb-2 mb-lg-0">
            {menuItems.map((item, index) =>
              item.submenu ? (
                <li className="nav-item dropdown" key={index}>
                  <a
                    className="nav-link d-flex align-items-center navbar_main_title  text-dark fs-6 text-nowrap text-truncate ms-2"
                    href="#"
                    id={`dropdown${index}`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i
                      className={`${item.icon} me-1 text-dark `}
                      style={{
                        fontSize: "24px",
                        paddingRight: "8px",
                        textShadow: "0 0 1px rgba(0, 0, 0, 0.82)",
                      }}
                    ></i>
                    {item.label}
                    <FaChevronDown
                      className="ms-1 opacity-50"
                      size={14}
                      style={{ marginTop: "5px" }}
                    />
                  </a>
                  <ul className="dropdown-menu " style={{ marginTop: "-8px" }}>
                    {item.submenu.map((sub, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          className="dropdown-item text-dark navbar_main_title fs-6 text-nowrap text-truncate w-auto ms-2 px-2 py-1"
                          to={sub.link}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav-item" key={index}>
                  <Link
                    className="nav-link d-flex align-items-center fw-normal  text-dark fs-6 text-nowrap text-truncate ms-2"
                    to={item.link}
                  >
                    <i
                      className={`${item.icon} me-1  text-dark`}
                      style={{
                        fontSize: "24px",
                        paddingRight: "8px",
                        textShadow: "0 0 1px rgba(0, 0, 0, 0.82)",
                      }}
                    ></i>
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* User Profile */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link d-flex align-items-center navbar_main_title text-dark fs-6 text-nowrap text-truncate ms-2"
                href="#"
                id="dropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-4"></i>
                <span className="ms-2">{user?.name || "User"}</span>
                <FaChevronDown
                  className="ms-1 opacity-50"
                  size={14}
                  style={{ marginTop: "5px" }}
                />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                style={{ borderColor: "#e2e8f0", minWidth: "200px" }}
              >
                <li className="dropdown-header text-start py-2 px-3">
                  <strong className="fw-bold text-black">
                    {user?.name || "User Name"}
                  </strong>
                  <br />
                  <small>{user?.role || "Role"}</small>
                </li>
                <li>
                  <hr
                    className="dropdown-divider"
                    style={{ borderColor: "#e2e8f0" }}
                  />
                </li>
                <li>
                  <div
                    role="button"
                    className="dropdown-item text-start fw-bold text-primary"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
