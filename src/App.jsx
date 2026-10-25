import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard.jsx'
import Workspace from './Pages/Workspace.jsx'
import Login from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'
import NavBar from './Components/NavBar.jsx'
import Footer from './Components/Footer.jsx'
import { AuthProvider } from './context/AuthContext.js'
import './App.css'

import Home from './Pages/Home.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/workspace/:projectId" element={<Workspace />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
