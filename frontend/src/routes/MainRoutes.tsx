import React from "react";
import { Route, Routes } from "react-router-dom";
import WarehouseLayout from "../layout/warehouse"; // ตรวจสอบ path ให้ถูกต้อง
import CreateWarehouse from "../pages/warehouse/create";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/warehouse" element={<WarehouseLayout />}>
        <Route path="insert" element={<CreateWarehouse />} />
      </Route>

      {/* คุณสามารถเพิ่ม Route อื่นได้ที่นี่ */}
    </Routes>
  );
};

export default MainRoutes;
