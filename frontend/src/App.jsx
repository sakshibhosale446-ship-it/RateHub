import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import UserDashboard from "./pages/UserDashboard";
import "./App.css";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAddUser from "./pages/AdminAddUser";
import AdminAddStore from "./pages/AdminAddStore";
import AdminStores from "./pages/AdminStores";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setMessage("Login successful!");

            if (data.user.role === "ADMIN") {
                navigate("/admin");
            } else if (data.user.role === "USER") {
                navigate("/user");
            } else if (data.user.role === "STORE_OWNER") {
                navigate("/store-owner");
            }

        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to the server");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="logo-section">
                    <div className="logo-mark">R</div>

                    <h1>RateHub</h1>

                    <p>Rate. Review. Discover.</p>
                </div>

                <h2>Welcome Back</h2>

                <p className="login-subtitle">
                    Sign in to your account
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">
                        Login
                    </button>

                </form>

                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}

                <p className="signup-text">
                    Don't have an account?{" "}
                    <span>Sign up</span>
                </p>

            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
              

    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
    path="/admin"
    element={
        <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/users"
    element={
        <ProtectedRoute allowedRole="ADMIN">
            <AdminUsers />
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/add-store"
    element={
        <ProtectedRoute allowedRole="ADMIN">
            <AdminAddStore />
        </ProtectedRoute>
    }
/>
    <Route
        path="/user"
        element={
            <ProtectedRoute allowedRole="USER">
                <UserDashboard />
            </ProtectedRoute>
        }
    />
    <Route
    path="/user/change-password"
    element={
        <ProtectedRoute allowedRole="USER">
            <ChangePassword />
        </ProtectedRoute>
    }
    
/>
<Route
    path="/admin/add-user"
    element={
        <ProtectedRoute allowedRole="ADMIN">
            <AdminAddUser />
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/stores"
    element={
        <ProtectedRoute allowedRole="ADMIN">
            <AdminStores />
        </ProtectedRoute>
    }
/>

    <Route
        path="/store-owner"
        element={
            <ProtectedRoute allowedRole="STORE_OWNER">
                <StoreOwnerDashboard />
            </ProtectedRoute>
        }
    />
    <Route
    path="/store-owner/change-password"
    element={
        <ProtectedRoute allowedRole="STORE_OWNER">
            <ChangePassword />
        </ProtectedRoute>
    }
    
/>

</Routes>
        </BrowserRouter>
    );
}

export default App;