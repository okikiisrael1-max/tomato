import { useState } from 'react'
import SearchBar from '../components/home/SearchBar';
import FoodList from '../components/home/FoodList';
import { food_list } from '../assets/assets';

const Foods = () => {
    const [query, setQuery] = useState('');
      const filtered = food_list.filter((food) => food.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
        <SearchBar query={query} setQuery={setQuery}/>
        <FoodList filtered={filtered} query={query}/>
    </div>
  )
}

export default Foods
