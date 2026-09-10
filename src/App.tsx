import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';

// Student Pages
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { TrackOrder } from './pages/TrackOrder';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminFoodItems } from './pages/admin/AdminFoodItems';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Routes>
          {/* Public / Student Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Student Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:orderId"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin / Staff Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="food-items" element={<AdminFoodItems />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default App;
