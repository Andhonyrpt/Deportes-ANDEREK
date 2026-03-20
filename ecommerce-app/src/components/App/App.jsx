import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
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

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading>Cargando página...</Loading>}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/cart' element={<Cart />} />
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
              <Route
                path='/order-confirmation/:id' element={<OrderConfirmation />} />
              <Route path='*' element={<div>Ruta no encontrada</div>} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;