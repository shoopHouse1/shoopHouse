import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AccountLayout from './layouts/AccountLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';

// Account Pages
import Account from './pages/account/Account';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Downloads from './pages/account/Downloads';
import Tickets from './pages/account/Tickets';
import TicketDetail from './pages/account/TicketDetail';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import CreateProduct from './pages/seller/CreateProduct';
import EditProduct from './pages/seller/EditProduct';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSellers from './pages/admin/Sellers';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminTickets from './pages/admin/Tickets';
import AdminSettings from './pages/admin/Settings';
import AdminAudit from './pages/admin/Audit';

// Protected Route Components
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import { UserRole } from '@shoophouse/shared';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="store" element={<Store />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
        </Route>

        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Account />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
        </Route>

        <Route
          path="/seller"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={[UserRole.SELLER]}>
                <SellerLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<CreateProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={[UserRole.ADMIN]}>
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;


