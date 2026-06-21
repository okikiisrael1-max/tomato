import { auth } from '../firebase/config'
import { Navigate } from 'react-router-dom'
import Layout from './../layout/Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const ProtectedRoutes = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null)

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user)
      })

      return () => unsubscribe()
    }, [])

    if (isAuthenticated === null) {
      return null
    }

  return isAuthenticated ? <Layout/> : <Navigate to={'/auth'} replace/>
}

export default ProtectedRoutes
