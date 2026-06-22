import { useEffect, useState } from "react";
import { auth, db } from "./../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Edit, LocationEditIcon, Phone } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openModal, setOpenModal] = useState(false)


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
          const data = userDoc.data();
          setUser(data);
          setBio(data.bio || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
        }
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleUpdate = async ()=> {
    setLoading(true)
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid),{
      bio: bio,
      phone: phone,
      address: address,
    })
    setUser((prev) => ({
      ...prev,
      bio,
      phone,
      address,
    }));
    setOpenModal(false)
    setLoading(false)

    } catch (error) {
      console.log(error)
      setLoading(false)
    }
    

  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>Profile not found.</div>;
  }

  return (
    <>
    <div className="flex flex-col bg-amber-50 rounded-2xl p-5 justify-center items-center">
      <span className=" bg-[tomato] text-white font-black text-6xl h-20 w-20 flex justify-center items-center rounded-full relative mb-5">
        {user.username.charAt(0).toUpperCase()}
        <span onClick={()=> setOpenModal(true)} className="absolute right-0 -bottom-2.5 bg-white p-1 rounded-lg cursor-pointer">
          <Edit size={20} color="blue"/>
        </span>
      </span>
      
      <div>
        <h1 className="font-bold text-center text-3xl">{user.username}</h1>
      <p className="font-medium text-center">{user.email}</p>
      <p className="text-gray-500">Bio:</p>
      <p>{user.bio || "No bio added yet"}</p>
      </div>
     

    </div>
     <div className="mt-5">
        <p className="font-medium">Contact Info:</p>
        <div className="flex gap-1.5 my-1.5">
          <Phone size={20} className="text-gray-500"/>
          <p className="text-gray-500">Phone:</p>
          <p>{user.phone || "No phone added"}</p>
        </div>
        <div className="flex gap-1.5 my-1.5">
          <LocationEditIcon size={20} className="text-gray-500"/>
          <p className="text-gray-500">Address:</p>
          <p>{user.address || "No address added"}</p>
        </div>
      </div>

      {openModal && (
        <div className="bg-white w-[90%] flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow p-2.5 rounded-lg">
          <p className="font-bold">Update Profile</p>
          <div className="flex flex-col gap-2 m-2.5">
            <label htmlFor="bio">Bio:</label>
            <input type="text" className="border border-slate-200 p-2.5 rounded-lg bg-slate-50" value={bio}  onChange={(e)=> setBio(e.target.value)} placeholder="add about you..."/>
          </div>
          <div className="flex flex-col gap-2 m-2.5">
            <label htmlFor="bio">Phone:</label>
            <input type="number" className="border border-slate-200 p-2.5 rounded-lg bg-slate-50" value={phone}  onChange={(e)=> setPhone(e.target.value)} placeholder="+123-456-7890"/>
          </div>
          <div className="flex flex-col gap-2 m-2.5">
            <label htmlFor="bio">address:</label>
            <input type="text" className="border border-slate-200 p-2.5 rounded-lg bg-slate-50" value={address}  onChange={(e)=> setAddress(e.target.value)} placeholder="address here..."/>
          </div>
          <button onClick={handleUpdate} className="flex justify-center items-center h-10 hover:bg-[#d4533c] cursor-pointer m-2.5 bg-[tomato] text-white rounded-lg">{ loading ? 'wait...' : 'Update'}</button>
        </div>
      )}
    </>
    
  );
};

export default Profile;
