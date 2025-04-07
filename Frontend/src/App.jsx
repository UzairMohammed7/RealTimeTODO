import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homee from "./pages/Homee";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

    console.log("ProtectedRoute Auth Check: ", isAuthenticated, user);

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}
	return children;
};

function App() {
    const {checkAuth, isCheckingAuth} = useAuthStore()
    useEffect(() => {
       checkAuth();
    }, [checkAuth]);

    // Wait for the authentication check to complete before rendering
    if (isCheckingAuth) return <div>Loading...</div>;

    return (
        <Routes>
            <Route exact path="/" element={<ProtectedRoute> <Homee /> </ProtectedRoute> } />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
        
    );
}

export default App;
