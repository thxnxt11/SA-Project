import { Routes, Route, Navigate } from "react-router-dom";
import WarehouseLayout from "../component/layout/WarehouseLayout";

// import Dashboard from "../pages/dashboard";
import DashboardWarehouse from "../pages/warehouse";
import CreateWarehouse from "../pages/warehouse/create";
import EditWarehouse from "../pages/warehouse/edit";
import CheckWarehouse from "../pages/warehouse/balance";

import RequireAuth from "../hook/RequireAuth";
import RequireRole from "../hook/RequireRole";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* ทุกหน้าอยู่ภายใต้ WarehouseLayout */}
      <Route
        element={
          <RequireAuth>
            <RequireRole allow={["organizer", 1]}>
              <WarehouseLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route path="dashboardwarehouse" element={<DashboardWarehouse />} />
        <Route path="create" element={<CreateWarehouse />} />
        <Route path="edit" element={<EditWarehouse />} />
        <Route path="balance" element={<CheckWarehouse />} />
      </Route>
    </Routes>
  );
}

// export default function AdminRoutes() {
//   return (
//     <Routes>
//       {/* /organizer -> dashboard */}
//       <Route index element={<Navigate to="dashboardwarehouse" replace />} />

//       {/* ทั้งหมดต้องล็อกอิน + role organizer */}
//       <Route
//         path="dashboardwarehouse"
//         element={
//           <RequireAuth>
//             <RequireRole allow={["organizer"]}> {/*สามารถเพิ่ม role อื่นได้ */}
//               <WarehouseLayout />
//             </RequireRole>
//           </RequireAuth>
//         }
//         />
//       <Route
//         path="create"
//         element={
//           <RequireAuth>
//             <RequireRole allow={["organizer"]}>
//               <CreateWarehouse />
//             </RequireRole>
//           </RequireAuth>
//         }
//       />
//       <Route
//         path="edit"
//         element={
//           <RequireAuth>
//             <RequireRole allow={["organizer"]}>
//               <EditWarehouse />
//             </RequireRole>
//           </RequireAuth>
//         }
//         />
//       <Route
//         path="balance"
//         element={
//           <RequireAuth>
//             <RequireRole allow={["organizer"]}>
//               <CheckWarehouse/>
//             </RequireRole>
//           </RequireAuth>
//         }
//         />

//       {/* 404 inside /organizer */}
//       <Route path="*" element={<Navigate to="dashboard" replace />} />
//     </Routes>
//   );
// }