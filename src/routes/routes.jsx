import AddCashbook from "../pages/Cashbook/AddCashbook";
import AddExpenseCategory from "../pages/Cashbook/AddExpenseCategory";
import ViewCashbook from "../pages/Cashbook/ViewCashbook";
import AddCustomer from "../pages/Users/Customer/AddCustomer";
import Dashboard from "../pages/Home/Dashboard/Dashboard";
import ShopProcess from "../pages/Process/ShopProcess";
import ShopProcessEdit from "../pages/Process/ShopProcessEdit";
import WorkshopProcess from "../pages/Process/WorkshopProcess";
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
import ProductWise from "../pages/Inventory/ProductWise";
import StoreWiseInventory from "../pages/Inventory/Storewise";
import GroupWiseInventory from "../pages/Inventory/Groupwise";
import BrandGroupWiseCom from "../components/Inventory/Group/BrandGroupCom";
import ViewProductStore from "../pages/Inventory/ViewProductStore";
import BulkUploadInventory from "../pages/Inventory/BulkUpload";
import StockIn from "../pages/Inventory/StockIn";
import StockOut from "../pages/Inventory/StockOut";
import StockSale from "../pages/Inventory/StockSale";
import StockSaleOut from "../pages/Inventory/StockSaleOut";
import StockSaleIn from "../pages/Inventory/StockSaleIn";
import AddStockTransfer from "../pages/Inventory/AddStockTransfer";
import AddStockTransferCom from "../components/Inventory/Stock/AddStockTransferCom";
import StockAdjustment from "../pages/Inventory/StockAdjustment";
import ViewStockAdjustment from "../pages/Inventory/ViewStockAdjustment";
import AddProduct from "../pages/Products/addProduct";
import ProductList from "../pages/Products/ViewProducts";
import BulkUploadProduct from "../pages/Products/BulkUploadProduct";
import BulkEditProduct from "../pages/Products/BulkEditProduct";
import ViewProductAttributes from "../pages/Products/ViewProductAttributes";
import AddProductAttributes from "../pages/Products/AddProductAttributes";
import ProductSalesReport from "../pages/Reports/ProductSalesReport";
import PurchaseReport from "../pages/Reports/PurchaseReport";
import ProductPurchaseReports from "../pages/Reports/ProductPurchaseReports";
import SalesReport from "../pages/Reports/SalesReport";
import VendorReport from "../pages/Reports/VendorReport";
import IncentiveReport from "../pages/Reports/IncentiveReport";
import CashReport from "../pages/Reports/CashReport";
import TransferReport from "../pages/Reports/TransferReport";
import StockAdjustmentReport from "../pages/Reports/StockAdjustmentReport";
import ProfitLossReport from "../pages/Reports/ProfitLossReport";
import GstReport from "../pages/Reports/GstReport";
import ProductInventoryReport from "../pages/Reports/ProductInventoryReport";
import MediaLibrary from "../pages/MediaLibrary/MediaLibrary";
import SubFolder from "../pages/MediaLibrary/SubFolder";
import VendorListProcess from "../pages/Process/vendorListProcess";

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
    title: "EditUser",
    path: "/users/:id",
    element: (
      <PrivateRoute>
        <EditUser />
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
    title: "ShopProcess",
    path: "/process/shop",
    element: (
      <PrivateRoute>
        <ShopProcess />
      </PrivateRoute>
    ),
  },
  {
    title: "ShopProcess",
    path: "/process/shop/id",
    element: (
      <PrivateRoute>
        <ShopProcessEdit />
      </PrivateRoute>
    ),
  },
  {
    title: "WorkshopProcess",
    path: "/process/workshop",
    element: (
      <PrivateRoute>
        <WorkshopProcess />
      </PrivateRoute>
    ),
  },
  {
    title: "VendorListProcess",
    path: "/process/vendorList",
    element: (
      <PrivateRoute>
        <VendorListProcess />
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
    path: "/customer/:id",
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
    path: "/employee/:id",
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
  {
    title: "ProductWiseInventory",
    path: "/inventory/product-wise",
    element: (
      <PrivateRoute>
        <ProductWise />
      </PrivateRoute>
    ),
  },
  {
    title: "StoreWiseInventory",
    path: "/inventory/store-wise",
    element: (
      <PrivateRoute>
        <StoreWiseInventory />
      </PrivateRoute>
    ),
  },
  {
    title: "GroupWiseInventory",
    path: "/inventory/group-wise",
    element: (
      <PrivateRoute>
        <GroupWiseInventory />
      </PrivateRoute>
    ),
  },
  {
    title: "BrandDetail",
    path: "/inventory/group-wise/:brandName/:brandId",
    element: (
      <PrivateRoute>
        <BrandGroupWiseCom />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewProductStore",
    path: "/inventory/universal-search",
    element: (
      <PrivateRoute>
        <ViewProductStore />
      </PrivateRoute>
    ),
  },
  {
    title: "BulkUploadInventory",
    path: "/inventory/bulk-upload",
    element: (
      <PrivateRoute>
        <BulkUploadInventory />
      </PrivateRoute>
    ),
  },
  {
    title: "StockOut",
    path: "/inventory/stock-out",
    element: (
      <PrivateRoute>
        <StockOut />
      </PrivateRoute>
    ),
  },
  {
    title: "StockIn",
    path: "/inventory/stock-in",
    element: (
      <PrivateRoute>
        <StockIn />
      </PrivateRoute>
    ),
  },
  {
    title: "StockSale",
    path: "/inventory/stock-sale",
    element: (
      <PrivateRoute>
        <StockSale />
      </PrivateRoute>
    ),
  },
  {
    title: "StockSaleIn",
    path: "/inventory/stock-sale-in",
    element: (
      <PrivateRoute>
        <StockSaleIn />
      </PrivateRoute>
    ),
  },
  {
    title: "StockSaleOut",
    path: "/inventory/stock-sale-out",
    element: (
      <PrivateRoute>
        <StockSaleOut />
      </PrivateRoute>
    ),
  },
  {
    title: "AddStockTransfer",
    path: "/inventory/transfer-stock",
    element: (
      <PrivateRoute>
        <AddStockTransfer />
      </PrivateRoute>
    ),
  },
  {
    title: "StockAdjustment",
    path: "/inventory/adjustment-stock",
    element: (
      <PrivateRoute>
        <StockAdjustment />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewStockAdjustment",
    path: "/inventory/view-adjustment-stock",
    element: (
      <PrivateRoute>
        <ViewStockAdjustment />
      </PrivateRoute>
    ),
  },
  {
    title: "AddProduct",
    path: "/products/add",
    element: (
      <PrivateRoute>
        <AddProduct mode="add" />
      </PrivateRoute>
    ),
  },
  {
    title: "EditProduct",
    path: "/products/edit/:productId",
    element: (
      <PrivateRoute>
        <AddProduct mode="edit" />
      </PrivateRoute>
    ),
  },
  {
    title: "ProductList",
    path: "/products/view",
    element: (
      <PrivateRoute>
        <ProductList />
      </PrivateRoute>
    ),
  },
  {
    title: "BulkUploadProduct",
    path: "/products/bulk-upload",
    element: (
      <PrivateRoute>
        <BulkUploadProduct />
      </PrivateRoute>
    ),
  },
  {
    title: "BulkEditProduct",
    path: "/products/bulk-edit",
    element: (
      <PrivateRoute>
        <BulkEditProduct />
      </PrivateRoute>
    ),
  },
  {
    title: "ViewProductAttributes",
    path: "/products/view-attributes",
    element: (
      <PrivateRoute>
        <ViewProductAttributes />
      </PrivateRoute>
    ),
  },
  {
    title: "AddProductAttributes",
    path: "/products/add-attributes",
    element: (
      <PrivateRoute>
        <AddProductAttributes />
      </PrivateRoute>
    ),
  },
  {
    title: "ProductSalesReport",
    path: "/reports/product-sales-report",
    element: (
      <PrivateRoute>
        <ProductSalesReport />
      </PrivateRoute>
    ),
  },
  {
    title: "PurchaseReport",
    path: "/reports/purchase-report",
    element: (
      <PrivateRoute>
        <PurchaseReport />
      </PrivateRoute>
    ),
  },
  {
    title: "ProductPurchaseReports",
    path: "/reports/product-purchase-report",
    element: (
      <PrivateRoute>
        <ProductPurchaseReports />
      </PrivateRoute>
    ),
  },
  {
    title: "SalesReport",
    path: "/reports/sales-report",
    element: (
      <PrivateRoute>
        <SalesReport />
      </PrivateRoute>
    ),
  },
  {
    title: "VendorReport",
    path: "/reports/vendor-report",
    element: (
      <PrivateRoute>
        <VendorReport />
      </PrivateRoute>
    ),
  },
  {
    title: "IncentiveReport",
    path: "/reports/incentive-report",
    element: (
      <PrivateRoute>
        <IncentiveReport />
      </PrivateRoute>
    ),
  },
  {
    title: "CashReport",
    path: "/reports/cash-report",
    element: (
      <PrivateRoute>
        <CashReport />
      </PrivateRoute>
    ),
  },
  {
    title: "TransferReport",
    path: "/reports/transfer-report",
    element: (
      <PrivateRoute>
        <TransferReport />
      </PrivateRoute>
    ),
  },
  {
    title: "StockAdjustmentReport",
    path: "/reports/adjustment-report",
    element: (
      <PrivateRoute>
        <StockAdjustmentReport />
      </PrivateRoute>
    ),
  },
  {
    title: "ProfitLossReport",
    path: "/reports/profitLoss-report",
    element: (
      <PrivateRoute>
        <ProfitLossReport />
      </PrivateRoute>
    ),
  },
  {
    title: "GstReport",
    path: "/reports/gst-report",
    element: (
      <PrivateRoute>
        <GstReport />
      </PrivateRoute>
    ),
  },
  {
    title: "ProductInventoryReport",
    path: "/reports/empty-inventory-report",
    element: (
      <PrivateRoute>
        <ProductInventoryReport />
      </PrivateRoute>
    ),
  },
  {
    title: "media-library",
    path: "/media-library",
    element: (
      <PrivateRoute>
        <MediaLibrary />
      </PrivateRoute>
    ),
  },
  {
    title: "media-library",
    path: "/media-library/*",
    element: (
      <PrivateRoute>
        <MediaLibrary />
      </PrivateRoute>
    ),
  },
];

export default routes;
