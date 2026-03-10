import EmployeeHeader from "../../components/EmployeeHeader.jsx";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import JoiningTracker from "../../components/JoiningTracker.jsx";
import './EmployeeLineUpTracker.css';


export default function EmployeeJoiningTracker(){
  const empId = sessionStorage.getItem("userId");
  return (
    <div className="emp-lineup-root">
        <EmployeeNavbar />

        <main className="emp-lineup-content">
            <EmployeeHeader 
            title="Joining Tracker"
            subtitle="Track and manage your candidate progress"
            />

            <JoiningTracker
            role="employee"
            employee_id={empId}
            />
        </main>
    </div>
  );
}