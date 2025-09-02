import type { RouteObject } from "react-router-dom";

// layout หลัก
import WarehouseLayout from "../layout/warehouse";
import NavbarShop from "../layout/shoppy"

// pages
import LandingPage from "../pages/land"; // ตรวจ path ให้ถูกต้อง

import Dashboard from "../pages/warehouse";
import CreateWarehouse from "../pages/warehouse/create";
import EditWarehouse from "../pages/warehouse/edit";
import CheckWarehouse from "../pages/warehouse/balance";

import ShoppingPage from "../pages/shoppy"
import ProductDetailPage from "../pages/shoppy/detail"
import CartPages from "../pages/shoppy/cart"
import PaymentOrderPage from "../pages/shoppy/payment"

const AdminRoutes: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <LandingPage />,
    },
    {
      path: "warehouse",
      element: <WarehouseLayout />,
      children: [
        {
          index: true, 
          element: <Dashboard />,
        },
        {
          path: "create",
          element: <CreateWarehouse />,
        },
        {
          path: "edit",
          element: <EditWarehouse />,
        },
        {
          path: "balance",
          element: <CheckWarehouse />,
        },
      ],
    },
    {
      path: "shoppy",
      element: <NavbarShop />, // layout หลัก
      children: [
        {
          index: true, // "/warehouse"
          element: <ShoppingPage />,
        },
        {
          path: "detail",
          element: <ProductDetailPage />,
        },
        {
          path: "cart",
          element: <CartPages />,
        },
        {
          path: "payment",
          element: <PaymentOrderPage />,
        },
      ],
    }
  ],
};

export default AdminRoutes;