import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
  };

  const RedirectRoute = ({children}) => {
    const { isAuthenticated } = useAuthStore();
    if (isAuthenticated) return <Navigate to="/" replace />;
    return children;
  }

function App() {
    const {checkAuth, isCheckingAuth} = useAuthStore()
    useEffect(() => {
       checkAuth();
    }, []);

    if (isCheckingAuth) return <div>Loading...</div>;

    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute> } />
            <Route path="/register" element={<RedirectRoute>  <Register /></RedirectRoute> } />
            <Route path="/login" element={<RedirectRoute> <Login /> </RedirectRoute>} />
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
        
    );
}

export default App;
