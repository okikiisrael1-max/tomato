import { CoinsIcon, DollarSignIcon, LocationEditIcon, Mail, Phone, ShoppingBag, Trash2, User, X } from 'lucide-react'
import { useState } from 'react'
import useCart from '../hooks/useCart'
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';


const Cart = () => {
    const { cart, setCart } = useCart();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [location, setLocation] = useState('');
    const [payOnDelivery, setPayOnDelivery] = useState(false);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    

    const deliveryFee = 10;

    const handleDelete = async (id) => {
        if (!auth.currentUser) {
            toast.error('Please log in again');
            return;
        }
        try {
            await deleteDoc(doc(db, 'carts', auth.currentUser.uid, 'items', id))
            setCart((prev) => prev.filter((items) => items.id !== id) )
            console.log('item has been deleted')
        } catch (error) {
            console.log(error.message);
        }

    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const fee = total + deliveryFee;

    const handlePayment = async()=> {
        if (!auth.currentUser) {
            toast.error('Please log in again');
            return;
        }

        if (!cart.length) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true)
        const orderId = `ORD-${crypto.randomUUID()}`
        
        if(!name || !email || !number || !location){
                setLoading(false)
                setErr('All fields are required');
                toast.error('All fields are required');
                return
            }
        try {
            await addDoc(collection(db, 'orders', auth.currentUser.uid, 'items'),{
                userId: auth.currentUser.uid,
                orderId,
                name,
                email,
                number,
                location,
                payOnDelivery,
                paidAmount: fee,
                status: 'pending',
                items: cart,
                createdAt: serverTimestamp(),
            })
            for (const item of cart){
                await deleteDoc(doc(db, 'carts', auth.currentUser.uid, 'items', item.id))
            }
            
            navigate('/orders')
            setLoading(false)
            console.log(orderId)
            
        } catch (error) {
            setLoading(false)
            toast.error(error.message)
            console.log(error.message)
        }
    }


    return (
        <div className='p-5'>
            <h1 className='font-bold text-2xl flex items-center gap-1.5'><ShoppingBag className='text-[tomato]' size={30} />Shopping Cart</h1>

            <div>
                {cart.map((items) => (
                    <div key={items.id} className='flex items-end gap-2.5
                 my-2.5 border-2 border-slate-100 p-2.5 rounded-lg'>
                        <img src={assets.food_10} className='w-25 rounded-lg h-20 object-cover shadow-md shadow-gray-400' />
                        <div onClick={() => navigate(`/details/${items.category}/${items.id}`)} className='cursor-pointer'>
                            <p className='font-bold text-[tomato]'>{items.name}</p>
                            <p className='font-medium'>Price: ${items.price}</p>
                            <p className='font-medium text-gray-500 text-sm'>Category: {items.category}</p>
                        </div>

                        <div className='flex flex-col ml-auto font-bold'>
                            <p className='flex gap-1.5'>Quantity: <p className='text-[tomato]'>{items.quantity}</p></p>

                            <button onClick={() => handleDelete(items.id)} className='flex items-center gap-1.5 text-[tomato] cursor-pointer'>Remove <Trash2 size={20} /> </button>
                        </div>
                    </div>
                ))}
                <div className='flex flex-col gap-2.5'>
                    <button onClick={() => navigate('/foods')} className='flex gap-1.5 h-10 bg-slate-400 w-full rounded-lg cursor-pointer text-white justify-center items-center'><ShoppingBag size={22} /> Shop More </button>

                    <div className='mt-10'>
                        <p className='flex gap-1.5 font-medium'>- Total Items: <span className='text-[tomato]'>{cart.length}</span></p>
                        <p className='flex gap-1.5 font-medium'>- Total Amount: ${total} </p>
                        <hr className='text-gray-200 my-2.5'/>

                        <p className='flex gap-1.5 font-bold'>- Total amount: <span className='text-[tomato]'>${fee}</span></p>
                    </div>

                    <button
                      onClick={() => setModal(true)}
                      disabled={!cart.length}
                      className='flex gap-1.5 h-10 bg-[tomato] w-full rounded-lg cursor-pointer text-white justify-center items-center disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <CoinsIcon size={22} /> Place Order
                    </button>
                </div>

            </div>

            {modal && (
                <div className='absolute z-51 backdrop-blur-lg min-h-screen overflow-y-scroll bg-black/50 top-0 left-0 w-full flex p-5'>
                    <div className='bg-white shrink-0 relative flex flex-col p-5 h-auto w-full md:w-150 shadow-md rounded-lg mx-auto '>
                        <span onClick={() => setModal(false)} className='absolute -right-5 -top-5 p-2.5 bg-white shadow-md rounded-full'><X /></span>
                        <h1 className='font-bold flex gap-1.5'><DollarSignIcon /> Payment Method</h1>

                        <div className='my-5'>
                            <label htmlFor="name" className='font-medium'>Full Name</label>
                            <div className='flex h-13 w-full border-2 border-gray-200 rounded-lg items-center gap-1.5'>
                                <span className='flex justify-center items-center bg-gray-200 h-full w-13'>
                                <User size={30} className='text-gray-500' />
                                </span>
                                
                                <input type="text" value={name} onChange={(e)=> setName(e.target.value)} id='name' placeholder='Enter full name' className='pl-2.5 h-full outline-0 flex-1' />
                            </div>
                        </div>

                        <div className='my-2.5'>
                            <label htmlFor="email" className='font-medium'>Email Address</label>
                            <div  className='flex h-13 w-full border-2 border-gray-200 rounded-lg items-center gap-1.5'>
                                <span className='flex justify-center items-center bg-gray-200 h-full w-13'>
                                    <Mail size={30} className='text-gray-500 ' />
                                </span>
                                
                                <input type="text" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder='Enter email address' className='pl-2.5 h-full outline-0 flex-1' />
                            </div>
                        </div>

                        <div className='my-2.5'>
                            <label htmlFor="phone" className='font-medium'>Phone Number</label>
                            <div className='flex h-13 w-full border-2 border-gray-200 rounded-lg items-center gap-1.5'>
                                <span className='flex justify-center items-center bg-gray-200 h-full w-13'>
                                    <Phone size={30} className='text-gray-500 ' />
                                </span>
                                
                                <input type="number" value={number} onChange={(e)=> setNumber(e.target.value)} placeholder='Enter telephone number' className='pl-2.5 h-full outline-0 flex-1' />
                            </div>
                        </div>
                        <div className='my-2.5'>
                            <label htmlFor="phone" className='font-medium'> Street Address</label>
                            <div className='flex h-13 w-full border-2 border-gray-200 rounded-lg items-center gap-1.5'>
                                <span className='flex justify-center items-center bg-gray-200 h-full w-13'>
                                    <LocationEditIcon size={30} className='text-gray-500 ' />
                                </span>
                                
                                <input type="text" value={location} onChange={(e)=> setLocation(e.target.value)} placeholder='e.g 123, louis street, oyo state.' className='pl-2.5 h-full outline-0 flex-1' />
                            </div>
                        </div>
                        <hr className='text-gray-200'/>
                        <div className='p-2.5'>
                            <span className='flex gap-2.5'>
                                <input type="checkbox" checked={payOnDelivery} onChange={() => setPayOnDelivery(!payOnDelivery)} className='accent-[tomato] outline-0'/>
                                <p>Payment on delivery</p>
                                <p>{payOnDelivery}</p>
                            </span>                   

                        </div>
                        <hr className='text-gray-200'/>
                        
                        <div className='mt-2.5'>
                            <p className='flex gap-1.5 font-medium'>- Total Items: <span className='text-[tomato]'>{cart.length}</span></p>
                            <p className='flex gap-1.5 font-medium'>- Items total price: <span className='text-[tomato]'>${total}</span></p>
                            
                        <hr className='text-gray-200 my-2.5'/>
                        <p className='flex gap-1.5 font-medium'>- Delivery Fee: <span className='text-[tomato]'>${deliveryFee}</span></p>
                        <p className='flex gap-1.5 font-bold'>- Total amount: <span className='text-[tomato]'>${fee}</span></p>
                        </div>
                        <button onClick={handlePayment} className='flex h-13 shrink-0 bg-[tomato] justify-center items-center rounded-lg text-white my-2.5 hover:bg-[tomato]/80'>{loading ? '...' : "Continue"}</button>
                        <p className='text-red-500 text-center italic text-sm font-bold'>{err}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
