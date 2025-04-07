import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Homee = () => {
    const {logout} = useAuthStore();
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (
        <div>
            <h1>Good Night</h1> 
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <button onClick={handleLogout} className="text-black cursor-pointer">Logout</button>
            </div>
        </div>
    )
}

export default Homee
