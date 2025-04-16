import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Todos = () => {
  // Initialize the state from localStorage or fallback to an empty array
  const getInitialTodos = () => {
    const storedTodos = localStorage.getItem("todoList");
    return storedTodos ? JSON.parse(storedTodos) : [];
  };

  // State for the todo list and count
  const [todoList, setTodoList] = useState(getInitialTodos); // Initialize from localStorage
  const [todosCount, setTodosCount] = useState(getInitialTodos().length); // Initialize count
  const [userInput, setUserInput] = useState("");
  const [isItemPresent, setIsItemPresent] = useState(todoList.length > 0)

  // Save todos to localStorage whenever the todoList changes
  useEffect(() => {
    localStorage.setItem("todoList", JSON.stringify(todoList));
    setTodosCount(todoList.length); // Keep count in sync with the list
    setIsItemPresent(todoList.length > 0) // Check if the list is not empty
  }, [todoList]);

  // Handle adding a new todo
  const onAddTodo = () => {
    if (userInput.trim() === "") {
      alert("Enter Valid Text");
      return;
    }

    const newTodo = {
      text: userInput,
      uniqueNo: todosCount + 1,
      isChecked: false,
    };

    setTodoList([...todoList, newTodo]); // Add the new todo
    setUserInput(""); // Reset the input field
  };

  // Handle checking/unchecking a todo
  const onTodoStatusChange = (uniqueNo) => {
    const updatedTodos = todoList.map((todo) =>
      todo.uniqueNo === uniqueNo
        ? { ...todo, isChecked: !todo.isChecked }
        : todo
    );
    setTodoList(updatedTodos);
  };

  // Handle deleting a todo
  const onDeleteTodo = (uniqueNo) => {
    const updatedTodos = todoList.filter((todo) => todo.uniqueNo !== uniqueNo);
    setTodoList(updatedTodos);
    toast.success("Task deleted");
  };

  return (
    <div>
        <div className="flex bg-phanton rounded-2xl">
          <input
            className="w-full flex-1 mr-2 border rounded px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-400"
            type="text"
            id="todoUserInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddTodo()}
            placeholder="Add Private task"
          />
          <button
            id="addTodoButton"
            className="bg-cyan-400 hover:bg-cyan-600 text-white px-4 py-2 rounded cursor-pointer"
            onClick={onAddTodo}
          >
            Add
          </button>
        </div>
        {/* ------ */}
        <div className="bg-phanton rounded-2xl">
          {isItemPresent && (
            <ul id="todoItemsContainer" className="space-y-4">
                {todoList.map((todo) => (
                  <li
                    key={todo.uniqueNo}
                    className='flex bg-white p-4 mt-4 rounded-lg shadow border-l-4 border-cyan-400'
                  >
                    <div className="flex-1">
                      <label
                        htmlFor={`checkbox${todo.uniqueNo}`}
                        className={`cursor-pointer ${
                          todo.isChecked ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <button
                        id={`checkbox${todo.uniqueNo}`}
                        onClick={() => onTodoStatusChange(todo.uniqueNo)}
                        className="bg-transparent hover:bg-green-100 text-green-600 px-3 py-1 mr-4 rounded-md text-sm border-2"
                    >
                        {todo.isChecked ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.uniqueNo)}
                      className="bg-transparent hover:bg-red-100 text-red-500 px-3 py-1 rounded-md text-sm border-2"
                    >
                      Delete Task
                    </button>
                  </li>
                ))}
            </ul>
          )}
          {!isItemPresent && 
            <div className="bg-white p-8 mt-2 rounded-lg shadow text-center flex flex-col items-center justify-center">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                  alt="No tasks" 
                  className="w-24 h-24 opacity-50 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-500">
                  No Private Tasks Are Added
                </h3>
            </div>
          }
        </div>
    </div> 
  );
};

export default Todos;
