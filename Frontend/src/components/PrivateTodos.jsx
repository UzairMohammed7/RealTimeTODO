const PrivateTodos = ({
  user,
  privateTitle,
  setPrivateTitle,
  privateTasks,
  addPrivateTask,
  generateTaskInviteLink,
  handleDeleteTask,
}) => {
  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Add Private task"
          value={privateTitle}
          onChange={(e) => setPrivateTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPrivateTask()}
          className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-400"
        />
        <button
          onClick={addPrivateTask}
          className="bg-cyan-400 hover:bg-cyan-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {privateTasks.length === 0 ? (
          <div className="bg-white p-8 mt-2 rounded-lg shadow text-center flex flex-col items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No tasks"
              className="w-24 h-24 opacity-50 mb-4"
            />
            <h3 className="text-xl font-medium text-gray-500">
              No tasks Are Added
            </h3>
          </div>
        ) : (
          [...privateTasks].reverse().map((task) => (
            <li
              key={task._id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <span>{task.title}</span>
              <div className="flex gap-2">
                {user._id === task.createdBy._id && (
                  <button
                  onClick={() => generateTaskInviteLink(task._id)}
                  className="text-sm bg-green-500 text-white hover:bg-green-700 px-2 py-1 rounded cursor-pointer"
                >
                  Share Task
                  </button>
                )}
                {user._id === task.createdBy._id && (
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="bg-transparent hover:bg-red-100 text-red-500 px-3 py-1 rounded-md text-sm border-2"
                  >
                    Delete Task
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PrivateTodos;
