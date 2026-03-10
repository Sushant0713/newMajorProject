import EmployeeHeader from "../../components/EmployeeHeader.jsx";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import LineUpTracker from "../../components/LineupTracker.jsx";
import './EmployeeLineUpTracker.css';


export default function EmployeeLineUpTracker(){

  const empId = sessionStorage.getItem("userId");


  return (
    <div className="emp-lineup-root">
        <EmployeeNavbar />

        <main className="emp-lineup-content">
            <EmployeeHeader 
            title="Lineup Tracker"
            subtitle="Track and manage your candidate progress"
            />

            <LineUpTracker
            role="employee"
            employee_id={empId}
            />
        </main>
    </div>
  );
}