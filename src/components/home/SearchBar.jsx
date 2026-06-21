import { ListFilterIcon, Search, ShoppingCartIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import useCart from './../../hooks/useCart';

const SearchBar = ({query, setQuery}) => {
    const {cart} = useCart()
    const navigate = useNavigate();
    
  return (
    <div className='flex justify-center items-center'>
        <div className='flex gap-2.5 items-center bg-gray-200 px-5 py-1.5 h-15 w-full rounded-lg'>
            <Search size={20}/>
            <input type="search" className='flex-1 outline-0' placeholder='search here...' value={query} onChange={(e)=> setQuery(e.target.value)}/>
            <ListFilterIcon size={20}/>
        </div>
        <span onClick={()=> navigate('/cart')} className='flex p-2.5 relative cursor-pointer'><ShoppingCartIcon size={30}/><p className='absolute bg-amber-500 text-sm px-1 top-0 right-0 rounded-full text-white'>{cart.length || 0}</p></span>
    </div>
  )
}

export default SearchBar
