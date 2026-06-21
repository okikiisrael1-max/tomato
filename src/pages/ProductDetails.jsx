import { useNavigate, useParams } from "react-router-dom"
import { food_list } from './../assets/assets';
import { Minus, Plus, ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { _id } = useParams()
  const detail = food_list.find((food) => food._id === _id)
  const [quantity, setQuantity] = useState(1)
  const [disable, setDisable] = useState(false)
  const[loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const increase = ()=> {
      setQuantity(quantity + 1)
      setDisable(false)
  }
  const decrease = ()=> {
    if(quantity > 1){
      setQuantity(quantity - 1)
      setDisable(false)
    }else{
      setDisable(true)
    }
  }
  const handleCart = async()=>{
    if(!auth.currentUser){
      alert('login first')
      return;
    }
    setLoading(true)
    try {
      await setDoc(doc(db, 'carts', auth.currentUser.uid, "items", _id),{
        id: _id,
        name: detail.name,
        image: 'https://images.unsplash.com/photo-1781512471864-357022c87200?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: detail.price,
        description: detail.description,
        category: detail.category,
        quantity: quantity,
      })
      toast.success('product added to cart')
      setLoading(false)
      navigate('/cart')
    } catch (error){
      console.log(error.message)
      toast.error('error adding product to cart')
      setLoading(false)
    }
  }


  return (
    <div className="flex p-5 md:flex-row flex-col gap-5 my-5">
      <img src={detail.image} className="rounded-2xl" alt="" />
      <div>
        <h2 className="font-black text-2xl">{detail.name}</h2>
      <p className="text-gray-500">{detail.description}</p>
      <span className="flex items-center gap-1.5 mb-5"><p className="text-gray-500 font-bold">Category:</p><p className="font-medium text-[tomato]">{detail.category}</p></span>
      <div className="flex gap-1.5 items-center">
              <Tag className="text-gray-500" size={22}/>Price: <p className="font-medium">${detail.price}.00</p>
            </div>
        <div className="flex items-center gap-2.5 my-2.5">
         <p className="mr-2.5 text-gray-500">Quantity</p>
        <span onClick={decrease} className={`w-8 h-8 ${disable && 'opacity-50'} bg-gray-300 cursor-pointer justify-center flex items-center`}><Minus/></span>
         <p className="p-2.5">{quantity}</p>
        <span onClick={increase} className="w-8 h-8 bg-gray-300 cursor-pointer justify-center flex items-center"><Plus/></span>
      </div>
      <button onClick={handleCart} className="flex bg-[tomato] text-white px-3.5 p-2.5 gap-1.5 rounded-lg cursor-pointer hover:bg-[tomato]/80"> {loading ? '...' : 'Add to cart'}  <ShoppingCart size={22}/></button>

      </div>
      
      

      

     
      
    </div>
  )
}

export default ProductDetails
