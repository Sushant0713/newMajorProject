import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AdminLogin from './pages/AdminFrontend/AdminLogin'; 
import AdminPasswordReset from './pages/AdminFrontend/AdminPasswordReset';
import AdminNewPassword from './pages/AdminFrontend/AdminNewPassword';
import AdminVerifyOTP from './pages/AdminFrontend/AdminVerifyOTP';
import AdminDashboard from './pages/AdminFrontend/AdminDashboard';
import AdminClient from './pages/AdminFrontend/AdminClient';
import AdminJoiningTracker from './pages/AdminFrontend/AdminJoiningTracker';
import AdminEmployee from './pages/AdminFrontend/AdminEmployee';
import AdminProcess from './pages/AdminFrontend/AdminProcess';
import AdminAssignEmployee from './pages/AdminFrontend/AdminAssignEmployee';
import AdminPayoutManagement from './pages/AdminFrontend/AdminPayoutManagement';
import AdminDataImport from './pages/AdminFrontend/AdminDataImport';
import AdminMeetings from './pages/AdminFrontend/AdminMeetings';
import AdminLopManagement from './pages/AdminFrontend/AdminLopManagement';
import AdminAddEmployee from './pages/AdminFrontend/AdminAddEmployee';
import AdminEmployeeRegistration from './pages/AdminFrontend/AdminEmployeeRegistration';
import AdminEditEmployee from './pages/AdminFrontend/AdminEditEmployee';
import AdminViewEmployee from './pages/AdminFrontend/AdminViewEmployee';
import AdminCandidates from './pages/AdminFrontend/AdminCandidates';
import AdminProfile from './pages/AdminFrontend/AdminProfile';
import AdminLineUpTracker from './pages/AdminFrontend/AdminLineUpTracker';
import AdminTeam from './pages/AdminFrontend/AdminTeam';
import AdminAddClient from './pages/AdminFrontend/AdminAddClient';
import ViewAdminClient from './pages/AdminFrontend/ViewAdminClient';
import AdminEditClient from './pages/AdminFrontend/AdminEditClient';
import AdminAddProcess from './pages/AdminFrontend/AdminAddProcess';
import AdminPassCandidates from './pages/AdminFrontend/AdminPassCandidates';
import AdminDropCandidates from './pages/AdminFrontend/AdminDropCandidates';
import AdminDataAssign from './pages/AdminFrontend/AdminDataAssign';
import PasswordReset from './pages/EmployeeFrontend/PasswordReset';
import VerifyOTP from './pages/EmployeeFrontend/VerifyOTP';
import NewPassword from './pages/EmployeeFrontend/NewPassword';
import Dashboard from './pages/EmployeeFrontend/EmployeeDashboard';
import RecruitmentReport from './pages/EmployeeFrontend/Recruitment';
import ResumeUpload from './pages/EmployeeFrontend/ResumeUpload';
import EmployeeLogin from './pages/EmployeeFrontend/EmployeeLogin';
import EmployeeClient from './pages/EmployeeFrontend/EmployeeClient';
import EmployeeData from './pages/EmployeeFrontend/EmployeeData';
import EmployeeDataAssign from './pages/EmployeeFrontend/EmployeeDataAssign';
import EmployeeMeetings from './pages/EmployeeFrontend/EmployeeMeetings';
import EmployeePayout from './pages/EmployeeFrontend/EmployeePayout';
import EmployeeReports from './pages/EmployeeFrontend/EmployeeReports';
import EmployeeTracker from './pages/EmployeeFrontend/EmployeeTracker';
import EmployeeLineUpTracker from './pages/EmployeeFrontend/EmployeeLineUpTracker';
import EmployeeJoiningTracker from './pages/EmployeeFrontend/EmployeeJoiningTracker';
import ReviewResumeData from './pages/EmployeeFrontend/ReviewResumeData';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin-forgot-password" element={<AdminPasswordReset />} />
        <Route path="/admin-verify-otp" element={<AdminVerifyOTP />} />
        <Route path="/admin-password-reset" element={<AdminNewPassword />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-clients" element={<AdminClient />} />
        <Route path="/admin-add-client" element={<AdminAddClient />} />
        <Route path="/admin-client-details/:clientId" element={<ViewAdminClient />} />
        <Route path="/admin-edit-client/:clientId" element={<AdminEditClient />} />
        <Route path="/admin-joining-tracker" element={<AdminJoiningTracker />} />
        <Route path="/admin-lineup-tracker" element={<AdminLineUpTracker />} />
        <Route path="/admin-employees" element={<AdminEmployee />} />
        <Route path="/admin-process" element={<AdminProcess />} />
        <Route path="/admin-add-process" element={<AdminAddProcess />} />
        <Route path="/admin-assign-employee" element={<AdminAssignEmployee />} />
        <Route path="/admin-payout-management" element={<AdminPayoutManagement />} />
        <Route path="/admin-meetings" element={<AdminMeetings />} />
        <Route path="/admin-lop-management" element={<AdminLopManagement />} />
        <Route path="/admin-add-employee" element={<AdminAddEmployee />} />
        <Route path="/employee-registration-form" element={<AdminEmployeeRegistration />} />
        <Route path="/admin-edit-employee" element={<AdminEditEmployee />} />
        <Route path="/admin-view-employee" element={<AdminViewEmployee />} />
        <Route path="/admin-candidates" element={<AdminCandidates />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-teams" element={<AdminTeam />} />
        <Route path="/admin-data-import" element={<AdminDataImport />} />
        <Route path="/admin-pass-candidates" element={<AdminPassCandidates />} />
        <Route path="/admin-drop-candidates" element={<AdminDropCandidates />} />
        <Route path="/admin-data-assign" element={<AdminDataAssign />} />
        


        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/forgot-password" element={<PasswordReset />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/password-reset" element={<NewPassword />} />
        <Route path="/employee-dashboard" element={<Dashboard />} />
        <Route path="/employee-recruitment" element={<RecruitmentReport/>} />
        <Route path="/employee-resumeupload" element={<ResumeUpload />} />
        <Route path="/employee-clients" element={<EmployeeClient />} />
        <Route path="/employee-data" element={<EmployeeData />} />
        <Route path="/employee-data-assign" element={<EmployeeDataAssign />} />
        <Route path="/employee-meetings" element={<EmployeeMeetings />} />
        <Route path="/employee-payout" element={<EmployeePayout />} />
        <Route path="/employee-reports" element={<EmployeeReports />} />
        <Route path="/employee-lineup-tracker" element={<EmployeeLineUpTracker />} />
        <Route path="/employee-joining-tracker" element={<EmployeeJoiningTracker />} />
        <Route path="/employee-review-resume" element={<ReviewResumeData />} />
        <Route path="/employee-tracker" element={<EmployeeTracker/>}/>

      </Routes>

      <Toaster />
    </BrowserRouter>
  </React.StrictMode>,
);
