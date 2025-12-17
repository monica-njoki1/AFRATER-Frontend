// import { useState } from "react";
// import { registerUser } from "../api/api";

// function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await registerUser(form);
//     setMessage(data.msg || "Registration complete!");
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <h2 className="text-2xl font-bold mb-4">Register</h2>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
//         <input
//           name="name"
//           placeholder="Name"
//           onChange={handleChange}
//           className="p-2 border rounded"
//         />
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           onChange={handleChange}
//           className="p-2 border rounded"
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           onChange={handleChange}
//           className="p-2 border rounded"
//         />
//         <button className="bg-green-600 text-white py-2 rounded">
//           Register
//         </button>
//       </form>
//       {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
//     </div>
//   );
// }

// export default Register;
