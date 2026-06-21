import { useState } from 'react'
import { assets } from '../assets/assets'
import { LoaderPinwheel } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const Authentication = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('')
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (isSignIn) {
      setIsLoading(true)
      try {
        await signInWithEmailAndPassword(auth, email, password)
        setIsLoading(false)
        navigate('/')
      } catch (error) {
        console.log(error.message)
        setErr(error.message)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
    if (!isSignIn) {
      setIsLoading(true)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          username,
          role: 'user',
          createdAt: new Date()
        })
        console.log('user credentials saved')

        setIsLoading(false)
        navigate('/')
      } catch (error) {
        setIsLoading(false)
        console.log(error.message)
        setErr(error.message)
      }
    }
  }



  return (
    <div className='bg-[tomato]/30 flex justify-center items-center w-full h-screen'>
      <div className='bg-white rounded-2xl w-90% sm:w-96 p-5 shadow-2xl shadow-gray-500'>
        <img src={assets.logo} className='w-25 flex mx-auto my-1.5' />
        <img src={assets.parcel_icon} className='flex mx-auto my-2.5 w-25' alt="" />
        <p className='font-bold text-2xl text-center'>{isSignIn ? ('Welcome Back!') : ('Create Account')}</p>
        <p className='text-gray-500 text-center'>{isSignIn ? ('Enter your details to sign in') : ('fill in the form to Create Account')}</p>
        {!isSignIn && (
          <div className='relative w-full flex border border-gray-400 rounded-2xl overflow-X-hidden bg-gray-50 h-12 my-5'>
            <label htmlFor="email" className='absolute text-gray-600 text-sm font-semibold -top-2.5 left-2.5 bg-white px-1.5'>Username</label>
            <input type="text" className='h-full flex-1 p-2.5 focus:outline-[tomato] rounded-2xl' placeholder='enter your username' value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        )}


        <div className='relative w-full flex border border-gray-400 rounded-2xl overflow-X-hidden bg-gray-50 h-12 my-5'>
          <label htmlFor="email" className='absolute text-gray-600 text-sm font-semibold -top-2.5 left-2.5 bg-white px-1.5'>Email</label>
          <input type="email" className='h-full flex-1 p-2.5 focus:outline-[tomato] rounded-2xl' placeholder='enter your email address' value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className='relative w-full flex border border-gray-400 rounded-2xl overflow-X-hidden bg-gray-50 h-12 my-2.5'>
          <label htmlFor="password" className='absolute text-gray-600 text-sm font-semibold -top-2.5 left-2.5 bg-white px-1.5'>Password</label>
          <input type={showPassword ? 'text' : 'password'} className='h-full flex-1 p-2.5 focus:outline-[tomato] rounded-2xl' placeholder={isSignIn ? 'Enter correct password' : 'create a password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="checkbox" className='accent-amber-500 absolute right-1.5 top-4 w-5' onClick={() => setShowPassword(!showPassword)}/>
        </div>

        {isSignIn && (
          <span className='flex gap-1.5 font-semibold text-blue-500 cursor-pointer hover:underline'>forgotten password?</span>
        )}



        <button onClick={handleAuth} className='h-10 flex w-full rounded-2xl shadow-lg cursor-pointer hover:bg-[tomato]/80 shadow-gray-400 justify-center items-center my-2.5 bg-[tomato] text-white' disabled={isLoading}>
          {isSignIn ? (
            <span>{!isLoading ? "Log In" : (<span className='flex gap-1.5'><LoaderPinwheel size={22} className='text-white animate-spin' /> <p>logging in...</p></span>)}</span>
          ) : (
            <span>{!isLoading ? "Create account" : (<span className='flex gap-1.5'><LoaderPinwheel size={22} className='text-white animate-spin' /> <p>creating account...</p></span>)}</span>
          )}
        </button>
        <p className='text-red-500 italic text-center my-1.5'>{err}</p>
        <span className='flex gap-1.5 font-semibold'>{isSignIn ? <p>don't have an account?</p> : <p>already have an account?</p>}<span className='text-[tomato] cursor-pointer' onClick={() => setIsSignIn(!isSignIn)}>{isSignIn ? 'create account' : 'sign in'}</span></span>
      </div>

    </div>
  )
}

export default Authentication
