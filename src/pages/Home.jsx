import { assets, food_list } from '../assets/assets'
import MenuList from '../components/home/MenuList'
import FoodList from '../components/home/FoodList'
import SearchBar from '../components/home/SearchBar'
import { useState } from 'react'

const Home = () => {
  const [query, setQuery] = useState('');
  const filtered = food_list.filter((food) => food.name.toLowerCase().includes(query.toLowerCase()));
  
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 py-5'>
      <SearchBar query={query} setQuery={setQuery}/>
      <img src={assets.header_img} alt='Restaurant header' className='h-48 w-full rounded-2xl object-cover md:h-60'/>
      <MenuList/>
      <FoodList filtered={filtered} query={query}/>
    </div>
  )
}

export default Home
