import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Posts from "./Posts"; 
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
