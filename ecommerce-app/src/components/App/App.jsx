import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import Home from '../../pages/Home';
import Layout from '../../layout/Layout';
import Cart from '../../pages/Cart';
import Register from '../../pages/Register';
import Login from '../../pages/Login';
import ProtectedRoute from '../../pages/ProtectedRoute';
import Profile from '../../pages/Profile';
import CategoryPage from '../../pages/CategoryPage';
import SearchResults from '../../pages/SearchResults';
import Product from '../../pages/Product';
import Checkout from '../../pages/Checkout';
import Orders from '../../pages/Orders';
import OrderConfirmation from '../../pages/OrderConfirmation';
import GuestOnly from '../../pages/GuestOnly';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
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
              path='/order-confirmation' element={<OrderConfirmation />} />
            <Route path='*' element={<div>Ruta no encontrada</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;