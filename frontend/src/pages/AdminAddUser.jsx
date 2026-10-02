import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAddUser() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("USER");
    const [message, setMessage] = useState("");

    const handleAddUser = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        address,
                        role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to add user");
                return;
            }

            setMessage("User added successfully!");

            setName("");
            setEmail("");
            setPassword("");
            setAddress("");
            setRole("USER");

        } catch (error) {
            console.error("Add user error:", error);
            setMessage("Unable to connect to the server");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="admin-page">

            {/* Header */}
            <header className="dashboard-header">

                <div>
                    <h1>RateHub</h1>
                    <p>System Administrator</p>
                </div>

                <div className="user-info">

                    <span>
                        {JSON.parse(
                            localStorage.getItem("user")
                        )?.name}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* Navigation */}
            <nav className="dashboard-nav">

                <button
                    onClick={() => navigate("/admin")}
                >
                    Dashboard
                </button>

                <button
                    onClick={() => navigate("/admin/users")}
                >
                    Users
                </button>

                <button
                    onClick={() => navigate("/admin/stores")}
                >
                    Stores
                </button>

                <button
                    className="active"
                    onClick={() => navigate("/admin/add-user")}
                >
                    Add User
                </button>

                <button
                    onClick={() => navigate("/admin/add-store")}
                >
                    Add Store
                </button>

            </nav>


            {/* Main Content */}
            <main className="admin-content">

                <div className="page-title">

                    <div>
                        <h2>Add User</h2>
                        <p>
                            Create a new RateHub user account
                        </p>
                    </div>

                </div>


                {/* Form Card */}
                <div className="form-card">

                    <form
                        className="admin-form"
                        onSubmit={handleAddUser}
                    >

                        {/* Name */}
                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter full name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* Email */}
                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* Password */}
                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <small>
                                8–16 characters, including one uppercase
                                letter and one special character.
                            </small>

                        </div>


                        {/* Address */}
                        <div className="form-group">

                            <label>
                                Address
                            </label>

                            <textarea
                                placeholder="Enter address"
                                value={address}
                                onChange={(e) =>
                                    setAddress(e.target.value)
                                }
                                rows="4"
                                required
                            />

                        </div>


                        {/* Role */}
                        <div className="form-group">

                            <label>
                                User Role
                            </label>

                            <select
                                value={role}
                                onChange={(e) =>
                                    setRole(e.target.value)
                                }
                            >
                                <option value="USER">
                                    Normal User
                                </option>

                                <option value="ADMIN">
                                    Administrator
                                </option>

                                <option value="STORE_OWNER">
                                    Store Owner
                                </option>

                            </select>

                        </div>


                        {/* Buttons */}
                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate("/admin")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                Add User
                            </button>

                        </div>

                    </form>


                    {/* Message */}
                    {message && (
                        <div className="form-message">
                            {message}
                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default AdminAddUser;