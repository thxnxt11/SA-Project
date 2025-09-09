
import React from "react";
import 'antd/dist/reset.css'
import { BrowserRouter as Router, Routes , Route} from 'react-router-dom';
import Venue from './page/venue';
import Staff from './page/staff';
import Dashboard from './page/dashboard';
import Addvenue from './page/venue/addvenue';
import Addstaff from './page/staff/addstaff';
import CalendarVenue from './page/calendar_venue';
import Assignment from './page/assignment';
import EditStaff from "./page/staff/editstaff";
import Editvenue from "./page/venue/editvenue";
import Equipment from "./page/equipment";
import MyAssignments from "./page/satffassignment/staff_assignment";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Dashboard />} />
          <Route path="venue" element={<Venue />} />
          <Route path="addvenue" element={<Addvenue/>}/>
           <Route path="editvenue" element={<Editvenue/>}/>
          <Route path="equipment" element={<Equipment/>}/>
          <Route path="/editstaff/:id" element={<EditStaff />} />
          <Route path="staff" element={<Staff />} />
          <Route path="addstaff" element={<Addstaff/>}/>
          <Route path="calendarvenue" element={<CalendarVenue/>}/>
          <Route path="assignment" element = {<Assignment/>}/>

          <Route path="myassignment" element={<MyAssignments/>}/>
 
          
      </Routes>
    </Router>

  );
};

export default App;
