import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { CategoryPage } from './pages/category-page';
import { BookDetailPage } from './pages/book-detail-page';
import { AuthorPage } from './pages/author-page';
import { HomePage } from './pages/home-page';
import { ProfilePage } from './pages/profile-page';
import { CartPage } from './pages/cart-page';
import { CheckoutPage } from './pages/checkout-page';
import { SuccessBorrowPage } from './pages/success-borrow-page';
import { AdminPage } from './pages/admin-page';
import AdminPreviewBookPage from './pages/admin-preview-book-page';
import AdminAddBookPage from './pages/admin-add-book-page';
import AdminEditBookPage from './pages/admin-edit-book-page';
import { ProtectedRoute } from './components/shared/protected-route';
import { ProtectedAdminRoute } from './components/shared/protected-admin-route';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './contexts/toast-context';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />

          {/* Public homepage - accessible to all users */}
          <Route
            path='/'
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />

          {/* Protected routes with Layout */}
          <Route
            path='/category'
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/books/:id'
            element={
              <ProtectedRoute>
                <Layout>
                  <BookDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/author/:id'
            element={
              <ProtectedRoute>
                <Layout>
                  <AuthorPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/cart'
            element={
              <ProtectedRoute>
                <Layout>
                  <CartPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/checkout'
            element={
              <ProtectedRoute>
                <Layout>
                  <CheckoutPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/success-borrow'
            element={
              <ProtectedRoute>
                <Layout>
                  <SuccessBorrowPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path='/admin'
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin/preview/:bookId'
            element={
              <ProtectedAdminRoute>
                <AdminPreviewBookPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin/add-book'
            element={
              <ProtectedAdminRoute>
                <AdminAddBookPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path='/admin/edit-book/:bookId'
            element={
              <ProtectedAdminRoute>
                <AdminEditBookPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Catch all */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
