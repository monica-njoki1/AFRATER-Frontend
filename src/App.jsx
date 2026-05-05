import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
//import RegisterForm from "./components/RegisterForm";
//import LoginForm from "./components/LoginForm";
//import DeleteAccount from "./components/DeleteAccount";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} /> */}
        {/* <Route path="/delete" element={<DeleteAccount />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
