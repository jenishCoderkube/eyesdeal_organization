import AddCustomer from "../pages/Customer/AddCustomer";
import Dashboard from "../pages/Home/Dashboard/Dashboard";
import AddPerchase from "../pages/Purchase/AddPerchase";
import BarcodeGenerate from "../pages/Purchase/BarcodeGenerate";
import ViewPerchase from "../pages/Purchase/ViewPerchase";
import AddSale from "../pages/Sale/AddSale";
import SaleReturn from "../pages/Sale/SaleReturn";
import AddStore from "../pages/Stores/AddStore";
import AssignStore from "../pages/Stores/AssignStore";
import ViewStore from "../pages/Stores/ViewStore";
import PrivateRoute from "./RouteProtection";

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
];

export default routes;
