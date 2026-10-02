import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAddStore() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [message, setMessage] = useState("");

    const handleAddStore = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/stores",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        address,
                        owner_id: Number(ownerId)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to add store"
                );
                return;
            }

            setMessage("Store added successfully!");

            setName("");
            setEmail("");
            setAddress("");
            setOwnerId("");

        } catch (error) {
            console.error("Add store error:", error);
            setMessage(
                "Unable to connect to the server"
            );
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
                    onClick={() => navigate("/admin/add-user")}
                >
                    Add User
                </button>

                <button
                    className="active"
                    onClick={() => navigate("/admin/add-store")}
                >
                    Add Store
                </button>

            </nav>


            {/* Main Content */}
            <main className="admin-content">

                <div className="page-title">

                    <div>
                        <h2>Add Store</h2>

                        <p>
                            Create a new store and assign its owner
                        </p>
                    </div>

                </div>


                {/* Form */}
                <div className="form-card">

                    <form
                        className="admin-form"
                        onSubmit={handleAddStore}
                    >

                        {/* Store Name */}
                        <div className="form-group">

                            <label>
                                Store Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter store name"
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
                                Store Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter store email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* Address */}
                        <div className="form-group">

                            <label>
                                Store Address
                            </label>

                            <textarea
                                placeholder="Enter store address"
                                value={address}
                                onChange={(e) =>
                                    setAddress(e.target.value)
                                }
                                rows="4"
                                required
                            />

                        </div>


                        {/* Owner ID */}
                        <div className="form-group">

                            <label>
                                Store Owner ID
                            </label>

                            <input
                                type="number"
                                placeholder="Enter store owner user ID"
                                value={ownerId}
                                onChange={(e) =>
                                    setOwnerId(e.target.value)
                                }
                                required
                            />

                            <small>
                                Enter the User ID of an existing
                                Store Owner account.
                            </small>

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
                                Add Store
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

export default AdminAddStore;