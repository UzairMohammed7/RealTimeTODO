import React from "react";
import { X, Link, Copy } from "lucide-react";

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  onlineUsers,
  user,
  inviteLink,
  isGeneratingLink,
  copyInviteLink,
}) => {
  return (
    <aside
      className={`bg-white w-full md:w-64 shadow-lg md:block fixed md:static z-60 transition-transform duration-300 ease-in-out
      ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Mobile Header */}
      <div className="p-4 border-b flex justify-between items-center md:hidden">
        <h2 className="text-xl font-bold pl-12">Online Users</h2>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="text-gray-700"
        >
          <X />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="p-4 md:p-6 sticky top-0 z-50">
        {/* Title for Desktop */}
        <h2 className="text-xl font-bold mb-4 hidden md:block">
          Online Users
        </h2>

        {/* Online Users List */}
        <ul className="space-y-3">
          {onlineUsers.map(([userId, userData]) => {
            if (!userData?.name) return null;

            return (
              <li
                key={userId}
                className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-100 text-green-700 font-semibold flex items-center justify-center rounded-full">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">
                  {userId === user._id ? (
                    <strong>You</strong>
                  ) : (
                    <strong>{userData.name}</strong>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Invite Link Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Link size={18} /> Invite your friends
          </p>
          <div className="flex justify-center flex-col items-center gap-2">
            <input
              value={inviteLink || "Click copy to generate link"}
              readOnly
              className="flex-1 px-3 py-2 border rounded text-sm truncate bg-white"
            />
            <button
              onClick={copyInviteLink}
              disabled={isGeneratingLink}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingLink ? (
                "Generating..."
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
          </div>
          {inviteLink && (
            <p className="text-xs text-gray-500 mt-2">
              Link expires in 24 hours
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
