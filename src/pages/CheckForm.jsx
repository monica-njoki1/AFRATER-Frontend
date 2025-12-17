// import React, { useState } from 'react'
// import axios from 'axios'
// import { motion } from 'framer-motion'

// export default function CheckForm() {
//   const [message, setMessage] = useState('')
//   const [result, setResult] = useState(null)
//   const [loading, setLoading] = useState(false)

//   const check = async () => {
//     setLoading(true)
//     setResult(null)
//     try {
//       const res = await axios.post(import.meta.env.VITE_BACKEND_URL + '/check', { message })
//       setResult(res.data.suspicious)
//     } catch (err) {
//       console.error(err)
//       setResult('error')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div id="check">
//       <h3 className="text-lg font-semibold mb-3 text-slate-100">Paste an M-Pesa message to check</h3>
//       <textarea
//         value={message}
//         onChange={e => setMessage(e.target.value)}
//         rows={6}
//         className="w-full bg-black/50 border border-sky-400/40 p-3 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400"
//         placeholder="e.g. You have a refund. Enter code to confirm"
//       />
//       <div className="mt-4 flex gap-2">
//         <button
//           onClick={check}
//           disabled={loading}
//           className="px-4 py-2 bg-sky-400 rounded-md font-semibold disabled:opacity-60 hover:scale-[1.02] transition-transform"
//         >
//           {loading ? 'Checking...' : 'Check'}
//         </button>
//         <button
//           onClick={() => { setMessage(''); setResult(null) }}
//           className="px-4 py-2 border border-white/20 rounded-md hover:bg-white/5 transition-colors"
//         >
//           Clear
//         </button>
//       </div>

//       {result !== null && (
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.45 }}
//           className={`mt-4 p-3 rounded-md ${result === true ? 'bg-red-700' : result === false ? 'bg-green-600' : 'bg-yellow-500'}`}
//         >
//           {result === true && <div>⚠️ <strong>Scam detected</strong> — do NOT enter the code.</div>}
//           {result === false && <div>✅ <strong>Looks safe</strong> (MVP).</div>}
//           {result === 'error' && <div>⚠️ Error checking. Try again.</div>}
//         </motion.div>
//       )}
//     </div>
//   )
// }
