import React from "react";

const Header = ({ user, handleLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6 sticky top-0 z-50 pt-3 pb-3 bg-white">
      <h1 className="text-2xl font-bold text-cyan-400">TODO</h1>
      <div className="flex items-center gap-4">
        <img
          src="https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png"
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border border-green-400 shadow"
        />
        <span className="font-bold text-2xl text-cyan-400 mr-2">
          {user?.name}
        </span>
        <button
          onClick={handleLogout}
          className="bg-transparent hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded transition border-2 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
