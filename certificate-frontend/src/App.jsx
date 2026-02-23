import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SearchCertificate from "./pages/SearchCertificate";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddCertificate from "./pages/AddCertificate";
import UploadExcel from "./pages/UploadExcel";
import UploadTemplate from "./pages/UploadTemplate";
import LayoutConfig from "./pages/LayoutConfig";
import Templates from "./pages/Templates";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchCertificate />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/templates" element={<Templates />} />
          <Route path="/admin/add" element={<AddCertificate />} />
          <Route path="/admin/upload-excel" element={<UploadExcel />} />
          <Route path="/admin/upload-template" element={<UploadTemplate />} />
          <Route path="/admin/layout" element={<LayoutConfig />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;