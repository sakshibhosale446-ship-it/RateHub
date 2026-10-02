import { useNavigate } from "react-router-dom";
import StoreList from "../components/StoreList";

function UserDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    return (
        <div className="dashboard-page">

            {/* Header */}
            <header className="dashboard-header">

                <div>
                    <h1>RateHub</h1>
                    <p>User Dashboard</p>
                </div>

                <div className="user-info">

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <button
                        onClick={() =>
                            navigate("/user/change-password")
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


            {/* Store Section */}
            <main className="dashboard-content">

                <div className="user-page-heading">

                    <h2>
                        Rate Stores
                    </h2>

                    <p>
                        Search stores and share your experience
                        by submitting a rating.
                    </p>

                </div>

                <StoreList />

            </main>

        </div>
    );
}

export default UserDashboard;