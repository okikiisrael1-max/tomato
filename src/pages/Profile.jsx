import { useEffect, useState } from "react";
import { auth, db } from "./../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Edit, LogOut, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsPageLoading(true);

      if (!currentUser) {
        setUser(null);
        setIsPageLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        const fallbackProfile = {
          username:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
          email: currentUser.email || "",
          role: "user",
          bio: "",
          phone: "",
          address: "",
        };

        if (userDoc.exists()) {
          const data = userDoc.data();
          const mergedProfile = {
            ...fallbackProfile,
            ...data,
          };

          setUser(mergedProfile);
          setBio(mergedProfile.bio || "");
          setPhone(mergedProfile.phone || "");
          setAddress(mergedProfile.address || "");
        } else {
          setUser(fallbackProfile);
          setBio("");
          setPhone("");
          setAddress("");
        }

        setIsPageLoading(false);
      } catch (error) {
        console.log(error.message);
        toast.error("Unable to load profile");
        setIsPageLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleOpenModal = () => {
    setBio(user?.bio || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setOpenModal(true);
  };

  const handleUpdate = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast.error("Please sign in again");
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = {
        username:
          currentUser.displayName ||
          user?.username ||
          currentUser.email?.split("@")[0] ||
          "User",
        email: currentUser.email || user?.email || "",
        role: user?.role || "user",
        bio: bio.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      await setDoc(
        doc(db, "users", currentUser.uid),
        updatedProfile,
        { merge: true }
      );

      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updatedProfile,
            }
          : prev
      );
      setOpenModal(false);
      toast.success("Profile updated");
    } catch (error) {
      console.log(error);
      toast.error("Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
      navigate("/auth");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Profile not found.
      </div>
    );
  }

  const avatarInitial = user.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="mx-auto w-full max-w-3xl p-5">
      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-lg">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[tomato] text-3xl font-black text-white shadow-md shadow-orange-200">
                {avatarInitial}
              </div>
              <button
                type="button"
                onClick={handleOpenModal}
                className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-amber-200 transition hover:bg-amber-50"
                aria-label="Edit profile"
              >
                <Edit size={18} className="text-blue-600" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
                Profile
              </p>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {user.username}
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                {user.bio || "No bio added yet"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogOut}
            className="inline-flex items-center gap-2 self-start rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid gap-4 border-t border-amber-100 p-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-amber-100">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Phone size={16} className="text-gray-500" />
              Phone
            </p>
            <p className="text-base font-medium text-slate-900">
              {user.phone || "No phone added"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-amber-100">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <MapPin size={16} className="text-gray-500" />
              Address
            </p>
            <p className="text-base font-medium text-slate-900">
              {user.address || "No address added"}
            </p>
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
                  Edit Profile
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Update your details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add something about you..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+123-456-7890"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700"
                >
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center rounded-2xl bg-[tomato] px-4 py-3 font-semibold text-white transition hover:bg-[#d4533c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
