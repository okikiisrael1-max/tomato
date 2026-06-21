import { ListCheck, Search, ShoppingCart, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

const FoodList = ({filtered, query}) => {
    return (
        <div>
            <h1 className='mt-5 flex items-center justify-center gap-1.5 text-center text-2xl font-bold'> <ListCheck size={30} className='text-amber-500' /> Avaliable Dishes</h1>
            <div className='mx-auto h-2 w-20 rounded-full bg-amber-500' />
                {filtered.length == 0 ? (
                    <div className='flex flex-col justify-center items-center my-5'>
                        <Search size={150} className='text-gray-400'/>
                        <h2 className='text-gray-400 text-2xl'>Nothing Found</h2>
                        <p className='text-gray-500'>"we couldn't find anything related to <b>{query}</b> "</p>
                    </div>
                ):(
                    <div className='my-2.5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {filtered.map((food, index) => (
                            <Link to={`/details/${food.category}/${food._id}`} key={index} className='flex flex-col items-center justify-center rounded-2xl relative bg-amber-50 p-3 text-center shadow-sm'>
                                <span className='absolute top-1 left-1 shadow-xl shadow-gray-400 bg-green-600 rounded-full px-2.5 text-white'>{food.category}</span>
                                <img src={food.image} alt={food.name} className='w-full rounded-2xl object-cover' />
                                <h2 className='mt-3 text-2xl font-extrabold text-amber-500'>{food.name}</h2>
                                <p className='mt-1 font-medium text-gray-500 mb-1.5 text-sm'>{food.description}</p>
                                <div className='flex justify-between items-center w-full px-5 mt-2.5'>
                                    <span className='rounded-lg cursor-pointer font-medium flex gap-1.5'>
                                        <span className='text-gray-500 flex items-center gap-1.5'><Tag size={16}/>Price:</span> ${food.price}
                                    </span>
                                    <span className='flex p-2.5 bg-amber-500 rounded-lg text-white cursor-pointer hover:bg-amber-400'>
                                        <ShoppingCart size={22} />
                                    </span>
                                </div>

                            </Link>
                        ))}
                        </div>
                )}
            
        </div>
    )
}

export default FoodList
