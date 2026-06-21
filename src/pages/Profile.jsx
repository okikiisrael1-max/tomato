import { useEffect, useState } from "react";
import { auth, db } from "./../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Phone, User } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(null);
      setLoading(true);

      if (!currentUser) {
        setLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>Profile not found.</div>;
  }

  return (
    <>
    <div className="flex flex-col bg-amber-50 rounded-2xl p-5 justify-center items-center">
      <span className="border-6 bg-white border-black rounded-full">
        <User size={100}/>
      </span>
      
      <div>
        <h1 className="font-bold text-center text-3xl">{user.username}</h1>
      <p className="font-medium text-center">{user.email}</p>
      <p className="text-gray-500">Bio:</p>
      <p className="">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor expedita alias laborum unde itaque doloremque, iste velit ipsam iure provident consectetur est ea ab non nesciunt ad temporibus! Dignissimos, pariatur.</p>
      </div>
     

    </div>
     <div className="mt-5">
        <p className="font-medium">Contact Info:</p>
        <div className="flex gap-1.5 my-1.5">
          <Phone size={20} className="text-gray-500"/>
          <p className="text-gray-500">Phone:</p>
          <p>+123 456 7890</p>
        </div>
      </div>
    </>
    
  );
};

export default Profile;
