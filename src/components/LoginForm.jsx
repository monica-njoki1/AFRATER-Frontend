// import { useState } from "react";
// import { loginUser } from "../api/api";

// export default function LoginForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await loginUser(email, password);
//     setMessage(data.msg || (data.access_token ? "Login successful!" : "Error"));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
//       <div className="bg-gray-900/80 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
//         <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
//           Welcome Back
//         </h2>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Email"
//             onChange={(e) => setEmail(e.target.value)}
//             className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             onChange={(e) => setPassword(e.target.value)}
//             className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           <button
//             type="submit"
//             className="bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 rounded-lg transition-all duration-300"
//           >
//             Login
//           </button>
//         </form>

//         {message && (
//           <p className="text-center mt-4 text-blue-400 font-medium">
//             {message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
