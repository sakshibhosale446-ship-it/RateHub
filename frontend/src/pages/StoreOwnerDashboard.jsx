import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StoreOwnerDashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/store-owner/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to load dashboard"
                );
                return;
            }

            setDashboard(data);

        } catch (error) {
            console.error(
                "Dashboard error:",
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
            <div className="dashboard-page">
                <div className="dashboard-content">
                    <div className="message">
                        {message}
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-content">
                    <div className="empty-state">
                        Loading dashboard...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* Header */}
            <header className="dashboard-header">

                <div>
                    <h1>RateHub</h1>
                    <p>Store Owner Dashboard</p>
                </div>

                <div className="user-info">

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <button
                        onClick={() =>
                            navigate(
                                "/store-owner/change-password"
                            )
                        }
                    >
                        Change Password
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* Main */}
            <main className="dashboard-content">

                <div className="owner-page-heading">

                    <h2>
                        Store Overview
                    </h2>

                    <p>
                        Monitor your store ratings
                        and customer feedback.
                    </p>

                </div>


                {/* Store Cards */}
                <div className="store-grid">

                    {dashboard.stores.map(
                        (store) => (

                            <div
                                className="store-card"
                                key={store.id}
                            >

                                <div className="store-card-header">

                                    <div>

                                        <h3>
                                            {store.name}
                                        </h3>

                                        <p>
                                            {store.address}
                                        </p>

                                    </div>

                                    <div className="rating-box">

                                        <span>
                                            ★
                                        </span>

                                        <strong>
                                            {
                                                store.average_rating
                                            }
                                        </strong>

                                    </div>

                                </div>

                                <div className="rating-label">
                                    Average Store Rating
                                </div>

                            </div>
                        )
                    )}

                </div>


                {/* Customer Ratings */}
                <section className="ratings-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Customer Ratings
                            </h2>

                            <p>
                                Users who have submitted
                                ratings for your store
                            </p>

                        </div>

                        <div className="rating-count">

                            {dashboard.ratings.length}{" "}
                            {dashboard.ratings.length === 1
                                ? "Rating"
                                : "Ratings"}

                        </div>

                    </div>


                    {dashboard.ratings.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                No ratings submitted yet.
                            </p>

                        </div>

                    ) : (

                        <div className="ratings-table-wrapper">

                            <table className="ratings-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Store
                                        </th>

                                        <th>
                                            Rating
                                        </th>

                                        <th>
                                            Date
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {dashboard.ratings.map(
                                        (rating) => (

                                            <tr
                                                key={
                                                    rating.rating_id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            rating.user_name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        rating.user_email
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        rating.store_name
                                                    }
                                                </td>

                                                <td>

                                                    <span className="star-rating">
                                                        ★{" "}
                                                        {
                                                            rating.rating
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {new Date(
                                                        rating.created_at
                                                    ).toLocaleDateString()}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default StoreOwnerDashboard;