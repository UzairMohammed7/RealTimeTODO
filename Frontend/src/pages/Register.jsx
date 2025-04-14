import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { register, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
      try {
        await register(name, email, password);
        navigate("/");
      } catch (error) {
        console.log("Registration Failed", error);
      }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#23486F] to-green-400">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                    {error && <p className="text-red-500 text-center font-semibold">{error?.message}</p>}
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 cursor-pointer"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to='/login' className='text-green-400 hover:underline font-semibold'>
						Login
					</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
