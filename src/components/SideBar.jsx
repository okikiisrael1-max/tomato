import { ChevronRightIcon, LogOutIcon, SidebarClose, SidebarOpen } from 'lucide-react'
import { assets } from './../assets/assets'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

const SideBar = () => {
   const navigate = useNavigate();
  const [openNav, setOpenNav] = useState(false)
  const handleLogout = async ()=>{
    try{
      await signOut(auth);
    console.log('logged out')
    navigate('/auth')
    }catch{
      console.log('error')
    }
    
  }
  return (
    <div className='flex h-full w-full flex-col border-b border-amber-100 bg-amber-50 p-5 md:border-b-0 md:border-r'>
      <div className='flex justify-between items-center'>
        <img src={assets.logo} alt='Tomato logo' className='w-32 object-contain'/>
      
      <span onClick={() => setOpenNav(!openNav)}>
      {openNav ? <SidebarOpen size={30}/> : <SidebarClose size={30}/>}
      </span>
      </div>
      
      <div className={`${openNav ? 'grid' : "hidden"}  md:grid`}>
        <p className='mt-5 flex text-sm font-bold text-gray-500'>Navigations</p>
      <hr className='my-2 border-gray-300'/>

      <NavLink to={'/'} onClick={() => setOpenNav(!openNav)} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Home <ChevronRightIcon size={20}/> </NavLink>

      <NavLink to={'/foods'} onClick={() => setOpenNav(!openNav)}  className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Food List <ChevronRightIcon size={20}/> </NavLink>

      <NavLink to={'/cart'} onClick={() => setOpenNav(!openNav)}  className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Explore Cart<ChevronRightIcon size={20}/> </NavLink>

      <NavLink onClick={() => setOpenNav(!openNav)}  to={'/orders'} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Orders <ChevronRightIcon size={20}/> </NavLink>

      <NavLink onClick={() => setOpenNav(!openNav)}  to={'/track-delivery'} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Track Delivery <ChevronRightIcon size={20}/> </NavLink>
      <NavLink onClick={() => setOpenNav(!openNav)}  to={'/profile'} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Profile <ChevronRightIcon size={20}/> </NavLink>

      <NavLink onClick={() => setOpenNav(!openNav)}  to={'/contact'} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Contact Us <ChevronRightIcon size={20}/> </NavLink>

      <NavLink onClick={() => setOpenNav(!openNav)}  to={'/admin/orders'} className='flex p-2.5 my-1.5 font-medium cursor-pointer text-gray-600 text-[18px] hover:bg-amber-200/50 rounded-lg items-center justify-between'>Admin orders <ChevronRightIcon size={20}/> </NavLink>
      
      <span onClick={handleLogout} className='font-medium text-red-500 flex items-center mt-auto justify-between rounded-lg hover:bg-amber-200/50 text-lg cursor-pointer p-5'>LogOut <LogOutIcon size={22}/></span>
      </div>

      
      
    </div>
  )
}

export default SideBar
