import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignupOptions from './pages/SignupOptions'
import VendorSignup from './pages/VendorSignup'
import CustomerSignup from './pages/CustomerSignup'
import Login from './pages/Login'
import VendorLayout from './pages/vendor/VendorLayout'
import VendorDashboard from './pages/vendor/Dashboard'
import ShopDetail from './pages/vendor/ShopDetail'
import BranchDetail from './pages/vendor/BranchDetail'
import VendorOrders from './pages/vendor/VendorOrders'
import Organizations from './pages/vendor/Organizations'
import AddShop from './pages/vendor/AddShop'
import CustomerLayout from './pages/customer/CustomerLayout'
import CustomerDashboard from './pages/customer/Dashboard'
import BranchDetailsCustomer from './pages/customer/BranchDetailsCustomer'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'
import OrderDetail from './pages/customer/OrderDetail'
import OrderTracking from './pages/customer/OrderTracking'
import AboutApp from './pages/customer/AboutApp'
import PrivacyPolicy from './pages/customer/PrivacyPolicy'
import TermsOfConditions from './pages/customer/TermsOfConditions'
import AdminDashboard from './pages/AdminDashboard'
import VendorApproval from './pages/admin/VendorApproval'
import BranchApproval from './pages/admin/BranchApproval'
import ApiRoutes from './pages/admin/ApiRoutes'
import Variables from './pages/admin/Variables'
import NotFound from './pages/NotFound'
import './App.css'
import OrganizationSignup from './pages/OrganizationSignup'
import OrganizationLayout from './pages/organization/OrganizationLayout'
import OrganizationDashboard from './pages/organization/Dashboard'
import VendorRequests from './pages/organization/VendorRequests'
import Riders from './pages/organization/Riders'
import RiderLayout from './pages/rider/RiderLayout'
import RiderDashboard from './pages/rider/Dashboard'
import RiderDeliveries from './pages/rider/Deliveries'
import RiderProfile from './pages/rider/Profile'
import RiderOrders from './pages/rider/Orders'
import RiderAssignedOrders from './pages/rider/RiderAssignedOrders'
import ApiVendorShops from './pages/admin/ApiVendorShops'
import ApiVendorBranches from './pages/admin/ApiVendorBranches'
import ApiVendorBranchIntegration from './pages/admin/ApiVendorBranchIntegration'
import AdminStats from './pages/admin/AdminStats'
import VendorStats from './pages/vendor/VendorStats'
import LmdSettings from './pages/admin/LmdSettings'
import LmdEarnings from './pages/admin/LmdEarnings'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignupOptions />} />
        <Route path="/vendorSignup" element={<VendorSignup />} />
        <Route path="/customerSignup" element={<CustomerSignup />} />
        <Route path="/organizationSignup" element={<OrganizationSignup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="shop/:shopId" element={<ShopDetail />} />
          <Route path="shop/:shopId/branch/:branchId" element={<BranchDetail />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="stats" element={<VendorStats />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="" element={<Navigate to="/vendor/dashboard" replace />} />
        </Route>
        
        {/* Customer Routes */}
        <Route path="/customer" element={<CartProvider><CustomerLayout /></CartProvider>}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="branch/:shopId/:branchId/:vendorId" element={<BranchDetailsCustomer />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="about" element={<AboutApp />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfConditions />} />
          <Route path="" element={<Navigate to="/customer/dashboard" replace />} />
        </Route>

        {/* Standalone Order Tracking Route */}
        <Route path="/tracking/:suborderId" element={<OrderTracking />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<AdminStats />} />
          <Route path="vendors" element={<VendorApproval />} />
          <Route path="branches" element={<BranchApproval />} />
          <Route path="api-vendors" element={<ApiRoutes />} />
          <Route path="api-vendors/shops/:vendorId" element={<ApiVendorShops />} />
          <Route path="api-vendors/shops/:vendorId/branches/:shopId" element={<ApiVendorBranches />} />
          <Route path="api-vendors/shops/:vendorId/branches/:shopId/integration/:branchId" element={<ApiVendorBranchIntegration />} />
          <Route path="variables" element={<Variables />} />
          <Route path="lmd-settings" element={<LmdSettings />} />
          <Route path="lmd-earnings" element={<LmdEarnings />} />
        </Route>

        {/* Organization Routes */}
        <Route path="/organization" element={<OrganizationLayout />}>
          <Route path="dashboard" element={<OrganizationDashboard />} />
          <Route path="vendor-requests" element={<VendorRequests />} />
          <Route path="riders" element={<Riders />} />
          <Route path="" element={<Navigate to="/organization/dashboard" replace />} />
        </Route>

        {/* Rider Routes */}
        <Route path="/rider" element={<RiderLayout />}>
          <Route path="dashboard" element={<RiderDashboard />} />
          <Route path="deliveries" element={<RiderDeliveries />} />
          <Route path="ready-orders" element={<RiderOrders />} />
          <Route path="assigned-orders" element={<RiderAssignedOrders />} />
          <Route path="profile" element={<RiderProfile />} />
          <Route path="" element={<Navigate to="/rider/dashboard" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
