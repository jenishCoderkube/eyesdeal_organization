import AddCustomer from "../pages/Customer/AddCustomer";
import Dashboard from "../pages/Home/Dashboard/Dashboard";
import AddSale from "../pages/Sale/AddSale";
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
];

export default routes;
