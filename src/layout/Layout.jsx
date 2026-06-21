import { Outlet } from 'react-router-dom'
import SideBar from '../components/SideBar'

const Layout = () => {
  return (
    <div className='flex min-h-screen w-full flex-col bg-stone-50 md:flex-row'>
      <div className='w-full shrink-0 sticky z-50 top-0 md:h-screen md:w-90'>
        <SideBar/>
      </div>
      <div className='flex-1 min-w-0 px-4 py-4 md:px-6'>
        <Outlet/>
      </div>
    </div>
  )
}

export default Layout
