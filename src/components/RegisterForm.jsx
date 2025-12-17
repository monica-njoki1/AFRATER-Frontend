// import { useState } from "react";
// import { registerUser } from "../api/api";

// export default function RegisterForm() {
//   const [form, setForm] = useState({ username: "", email: "", password: "" });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await registerUser(form);
//     setMessage(data.msg || "Registration successful!");
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
//       <div className="bg-gray-900/80 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
//         <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
//           Create Account
//         </h2>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             name="name"
//             placeholder="Name"
//             onChange={handleChange}
//             className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             name="email"
//             type="email"
//             placeholder="Email"
//             onChange={handleChange}
//             className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
//           />

//           <button
//             type="submit"
//             className="bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-all duration-300"
//           >
//             Sign Up
//           </button>
//         </form>

//         {message && (
//           <p className="text-center mt-4 text-green-400 font-medium">
//             {message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
