import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const getCartItems = async () => {
      try {
        if (!auth.currentUser) return;

        const snapshot = await getDocs(
          collection(db, "carts", auth.currentUser.uid, "items")
        );

        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCart(cartItems);
      } catch (error) {
        console.log(error.message);
      }
    };

    getCartItems();
  }, []);

  return { cart, setCart };
};

export default useCart;