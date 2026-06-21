import { Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './pages/Home';
import Authentication from './pages/Authentication';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import UploadProducts from './pages/admin/UploadProducts';
import Order from './pages/admin/Order';
import ManageProducts from './pages/admin/ManageProducts';
import Foods from './pages/Foods';
import ContactUs from './pages/ContactUs';
import TrackDelivery from './pages/TrackDelivery';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import { Toaster } from 'react-hot-toast';
import ProtectedRoutes from './pages/ProtectedRoutes';

const App = () => {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path='auth' element={<Authentication/>}/>
      <Route element={ <ProtectedRoutes><Layout/></ProtectedRoutes>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/foods' element={<Foods/>}/>
        <Route path='/details/:category/:_id' element={<ProductDetails/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/contact' element={<ContactUs/>}/>
        <Route path='/track-delivery' element={<TrackDelivery/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/admin/upload' element={<UploadProducts/>}/>
        <Route path='/admin/orders' element={<Order/>}/>
        <Route path='/admin/manage-product' element={<ManageProducts/>}/>
      </Route>
    </Routes>
    </>
    
  )
}

export default App
