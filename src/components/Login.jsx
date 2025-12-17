// import { useState } from "react";
// import { loginUser } from "../api/api";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const data = await loginUser(email, password);
//     setMessage(data.msg || "Login attempt complete!");
//   };

//   return (
//     <div className="p-4 flex flex-col items-center">
//       <h2 className="text-2xl font-bold mb-4">Login</h2>
//       <form onSubmit={handleLogin} className="flex flex-col gap-2">
//         <input
//           type="email"
//           placeholder="Email"
//           className="p-2 border rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="p-2 border rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
//       </form>
//       {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
//     </div>
//   );
// }

// export default Login;
