import { menu_list } from '../../assets/assets'
import { MenuSquare } from 'lucide-react'

const MenuList = () => {
  return (
    <div>
        <h1 className='mt-5 flex items-center justify-center gap-1.5 text-center text-2xl font-bold'> <MenuSquare size={30} className='text-amber-500'/> Menu Categories</h1>
        <div className='mx-auto h-2 w-20 rounded-full bg-amber-500'/>
      <div className='flex gap-5 overflow-x-auto p-2.5 no-scroll-bar'>
        {menu_list.map((menu, _id)=>(
          <div key={_id} className='shrink-0 cursor-pointer flex flex-col items-center justify-center'>
            <img src={menu.menu_image} alt={menu.menu_name} className='h-24 w-24 object-contain md:h-30 md:w-30' />
            <h1 className='my-2.5 font-bold'>{menu.menu_name}</h1>
          </div>
          ))}
      </div>
    </div>
  )
}

export default MenuList
