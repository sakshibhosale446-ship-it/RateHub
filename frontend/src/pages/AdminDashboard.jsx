import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to load dashboard"
                );
                return;
            }

            setDashboard(data);

        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

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

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (message) {
        return (
            <div className="admin-page">
                <p>{message}</p>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="admin-page">
                <p>Loading dashboard...</p>
            </div>
        );
    }

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
                        {user?.name}
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
                    className="active"
                    onClick={() => navigate("/admin")}
                >
                    Dashboard
                </button>

                <button
                    onClick={() =>
                        navigate("/admin/users")
                    }
                >
                    Users
                </button>

                <button
                    onClick={() =>
                        navigate("/admin/stores")
                    }
                >
                    Stores
                </button>

                <button
                    onClick={() =>
                        navigate("/admin/add-user")
                    }
                >
                    Add User
                </button>

                <button
                    onClick={() =>
                        navigate("/admin/add-store")
                    }
                >
                    Add Store
                </button>

            </nav>


            {/* Main Content */}
            <main className="admin-content">

                <h2>Overview</h2>

                <div className="stats-grid">

                    {/* Users */}
                    <div className="stat-card">

                        <h3>Total Users</h3>

                        <p>
                            {dashboard.totalUsers}
                        </p>

                    </div>


                    {/* Stores */}
                    <div className="stat-card">

                        <h3>Total Stores</h3>

                        <p>
                            {dashboard.totalStores}
                        </p>

                    </div>


                    {/* Ratings */}
                    <div className="stat-card">

                        <h3>Total Ratings</h3>

                        <p>
                            {dashboard.totalRatings}
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default AdminDashboard;