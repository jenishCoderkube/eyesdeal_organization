import AddCashbook from "../pages/Cashbook/AddCashbook";
import AddExpenseCategory from "../pages/Cashbook/AddExpenseCategory";
import ViewCashbook from "../pages/Cashbook/ViewCashbook";
import AddCustomer from "../pages/Users/Customer/AddCustomer";
import Dashboard from "../pages/Home/Dashboard/Dashboard";
import AddPerchase from "../pages/Purchase/AddPerchase";
import BarcodeGenerate from "../pages/Purchase/BarcodeGenerate";
import ViewPerchase from "../pages/Purchase/ViewPerchase";
import AddSale from "../pages/Sale/AddSale";
import SaleReturn from "../pages/Sale/SaleReturn";
import AddStore from "../pages/Stores/AddStore";
import AssignStore from "../pages/Stores/AssignStore";
import ViewStore from "../pages/Stores/ViewStore";
import AddOrganization from "../pages/Users/Organization/AddOrganization";
import PrivateRoute from "./RouteProtection";
import AddEmployee from "../pages/Users/Employee/AddEmployee";
import ViewCustomer from "../pages/Users/Customer/ViewCustomer";
import EditUser from "../pages/Users/Customer/EditUser";
import ViewEmployee from "../pages/Users/Employee/ViewEmployee";
import EditEmployee from "../pages/Users/Employee/EditEmployee";
import ViewOtp from "../pages/Users/Otp/ViewOtp";
import AddVendors from "../pages/Users/Vendor/AddVendor";
import MarketingReference from "../pages/Users/Marketing/MarketingReference";
import BulkUploadCustomers from "../pages/Users/BulkUpload/BulkUploadCustomers";

const routes = [
  {
    title: "Dashboard",
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    title: "Sale",
    path: "/sale/new",
    element: (
      <PrivateRoute>
        <AddSale />
      </PrivateRoute>
    ),
  },
  {
    title: "AddUsers",
    path: "/addCustomer",
    element: (
      <PrivateRoute>
        <AddCustomer />
      </PrivateRoute>
    ),
  },
  {
    title: "SaleList",
    path: "/sale/list",
    element: (
      <PrivateRoute>
        <SaleReturn />
      </PrivateRoute>
    ),
  },
  {
    title: "AddPerchase",
    path: "/purchase/new",
    element: (
      <PrivateRoute>
        <AddPerchase />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewPerchase",
    path: "/purchase/list",
    element: (
      <PrivateRoute>
        <ViewPerchase />
      </PrivateRoute>
    ),
  },
  {
    title: "GenerateBarcode",
    path: "/purchase/generateBarcode",
    element: (
      <PrivateRoute>
        <BarcodeGenerate />
      </PrivateRoute>
    ),
  },
  {
    title: "AddStore",
    path: "/stores/add-store",
    element: (
      <PrivateRoute>
        <AddStore />
      </PrivateRoute>
    ),
  },
  {
    title: "AssignStore",
    path: "/stores/assign-store",
    element: (
      <PrivateRoute>
        <AssignStore />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewStores",
    path: "/stores/view-stores",
    element: (
      <PrivateRoute>
        <ViewStore />
      </PrivateRoute>
    ),
  },
  {
    title: "AddCashbook",
    path: "/cashbook/add-expense",
    element: (
      <PrivateRoute>
        <AddCashbook />
      </PrivateRoute>
    ),
  },
  {
    title: "AddCashbook",
    path: "/cashbook/add-expense-category",
    element: (
      <PrivateRoute>
        <AddExpenseCategory />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewCashbook",
    path: "/cashbook/view",
    element: (
      <PrivateRoute>
        <ViewCashbook />
      </PrivateRoute>
    ),
  },
  {
    title: "AddOrganization",
    path: "/users/add-organization",
    element: (
      <PrivateRoute>
        <AddOrganization />
      </PrivateRoute>
    ),
  },
  {
    title: "AddCustomer",
    path: "/users/addCustomer",
    element: (
      <PrivateRoute>
        <AddCustomer />
      </PrivateRoute>
    ),
  },
  {
    title: "AddEmployee",
    path: "/users/add-employee",
    element: (
      <PrivateRoute>
        <AddEmployee />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewCustomer",
    path: "/users/view-customer",
    element: (
      <PrivateRoute>
        <ViewCustomer />
      </PrivateRoute>
    ),
  },
  {
    title: "EditUser",
    path: "/users/editUser",
    element: (
      <PrivateRoute>
        <EditUser />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewEmployee",
    path: "/users/view-employee",
    element: (
      <PrivateRoute>
        <ViewEmployee />
      </PrivateRoute>
    ),
  },
  {
    title: "EditEmployee",
    path: "/users/editEmployee",
    element: (
      <PrivateRoute>
        <EditEmployee />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewOtp",
    path: "/users/view-otp",
    element: (
      <PrivateRoute>
        <ViewOtp />
      </PrivateRoute>
    ),
  },
  {
    title: "AddVendors",
    path: "/users/add-vendor",
    element: (
      <PrivateRoute>
        <AddVendors />
      </PrivateRoute>
    ),
  },
  {
    title: "MarketingReference",
    path: "/users/marketing-reference",
    element: (
      <PrivateRoute>
        <MarketingReference />
      </PrivateRoute>
    ),
  },
  {
    title: "BulkUploadCustomers",
    path: "/users/bulk-upload-customer",
    element: (
      <PrivateRoute>
        <BulkUploadCustomers />
      </PrivateRoute>
    ),
  },
];

export default routes;
