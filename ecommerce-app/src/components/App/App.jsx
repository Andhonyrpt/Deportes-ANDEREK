import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import storageService from '../../services/storageService';
import { CartProvider } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { lazy, Suspense } from 'react';
import Home from '../../pages/Home';
import Layout from '../../layout/Layout';
import Loading from '../../components/common/Loading/Loading';

// Eagerly load contexts and essential layout components
const Cart = lazy(() => import('../../pages/Cart'));
const Register = lazy(() => import('../../pages/Register'));
const Login = lazy(() => import('../../pages/Login'));
const ProtectedRoute = lazy(() => import('../../pages/ProtectedRoute'));
const Profile = lazy(() => import('../../pages/Profile'));
const CategoryPage = lazy(() => import('../../pages/CategoryPage'));
const SearchResults = lazy(() => import('../../pages/SearchResults'));
const Product = lazy(() => import('../../pages/Product'));
const Checkout = lazy(() => import('../../pages/Checkout'));
const Orders = lazy(() => import('../../pages/Orders'));
const OrderConfirmation = lazy(() => import('../../pages/OrderConfirmation'));
const GuestOnly = lazy(() => import('../../pages/GuestOnly'));
const Wishlist = lazy(() => import('../../pages/Wishlist'));

// Admin pages
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const AdminHome = lazy(() => import('../../pages/Admin/views/AdminHome'));
const UsersView = lazy(() => import('../../pages/Admin/views/UsersView'));
const ProductsView = lazy(() => import('../../pages/Admin/views/ProductsView'));
const OrdersView = lazy(() => import('../../pages/Admin/views/OrdersView'));
const CategoriesView = lazy(() => import('../../pages/Admin/views/CategoriesView'));
const SubCategoriesView = lazy(() => import('../../pages/Admin/views/SubCategoriesView'));

function App() {
  // Limpieza de llaves obsoletas (Legacy/Zombie Keys)
  // useEffect(() => {
  //   const legacyKeys = ["authToken", "refreshToken", "userData", "shippingAddresses", "paymentMethods", "orders", "cart"];
  //   legacyKeys.forEach(key => storageService.removeRaw(key));
  //   console.info("Storage cleanup: Legacy keys removed.");
  // }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<Loading>Cargando página...</Loading>}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/wishlist' element={<Wishlist />} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<GuestOnly><Login /></GuestOnly>} />
              <Route path='/search' element={<SearchResults />} />
              <Route path='/product/:productId' element={<Product />} />
              <Route path='category/:categoryId' element={<CategoryPage />} />
              <Route path='/profile'
                element={
                  <ProtectedRoute
                    redirectTo='/login'
                    allowedRoles={["admin", "customer", "guest"]}
                  >
                    <Profile />
                  </ProtectedRoute>
                } />
              <Route path='/checkout'
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
              <Route
                path='/orders'
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route path='/order-confirmation/:id' element={<OrderConfirmation />} />

              {/* Admin Routes */}
              <Route path='/admin' element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path='users' element={<UsersView />} />
                <Route path='products' element={<ProductsView />} />
                <Route path='orders' element={<OrdersView />} />
                <Route path='categories' element={<CategoriesView />} />
                <Route path='subcategories' element={<SubCategoriesView />} />
              </Route>
              <Route path='*' element={<div>Ruta no encontrada</div>} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
      </NotificationProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;