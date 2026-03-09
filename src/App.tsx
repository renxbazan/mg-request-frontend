import { Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import RequestList from './pages/RequestList'
import RequestForm from './pages/RequestForm'
import RequestDetail from './pages/RequestDetail'
import CompanyList from './pages/CompanyList'
import ProfileList from './pages/ProfileList'
import CustomerList from './pages/CustomerList'
import UserList from './pages/UserList'
import SiteList from './pages/SiteList'
import ServiceCategoryList from './pages/ServiceCategoryList'
import ServiceSubCategoryList from './pages/ServiceSubCategoryList'
import ChangePassword from './pages/ChangePassword'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { token, isLoading } = useAuth()
  if (isLoading) return <div style={{ padding: 20 }}>{t('app.loading')}</div>
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="requests" element={<RequestList />} />
        <Route path="requests/new" element={<RequestForm />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="companies" element={<CompanyList />} />
        <Route path="sites" element={<SiteList />} />
        <Route path="service-categories" element={<ServiceCategoryList />} />
        <Route path="service-sub-categories" element={<ServiceSubCategoryList />} />
        <Route path="admin/profiles" element={<ProfileList />} />
        <Route path="admin/customers" element={<CustomerList />} />
        <Route path="admin/users" element={<UserList />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
