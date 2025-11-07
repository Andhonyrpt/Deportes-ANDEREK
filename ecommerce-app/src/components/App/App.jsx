import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import Home from '../../pages/Home';
import Layout from '../../layout/Layout';
import Cart from '../../pages/Cart';
import Login from '../../pages/Login';
import ProtectedRoute from '../../pages/ProtectedRoute';
import Profile from '../../pages/Profile';
import CategoryPage from '../../pages/CategoryPage';

import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            {/* Ruta search */}
            {/* Ruta producto */}
            <Route path='category/:categoryId' element={<CategoryPage />} />
            <Route path='/profile'
              element={
                <ProtectedRoute redirectTo='/login' allowedRoles={["admin", "customer", "Cliente"]}>
                  <Profile />
                </ProtectedRoute>
              } />
            <Route path='*' element={<div>Ruta no encontrada</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
