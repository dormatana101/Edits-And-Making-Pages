import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import CreatePost from "./CreatePost"; 
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
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
