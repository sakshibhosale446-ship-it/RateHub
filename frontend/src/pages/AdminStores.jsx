import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminStores() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [message, setMessage] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem("token");

            const params = new URLSearchParams();

            if (name) {
                params.append("name", name);
            }

            if (email) {
                params.append("email", email);
            }

            if (address) {
                params.append("address", address);
            }

            params.append("sortBy", sortBy);
            params.append("order", sortOrder);

            const response = await fetch(
                `http://localhost:5000/api/admin/stores?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to load stores"
                );
                return;
            }

            setStores(data.stores);

        } catch (error) {
            console.error(
                "Stores fetch error:",
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
                    onClick={() =>
                        navigate("/admin")
                    }
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
                    className="active"
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


            {/* Main */}
            <main className="admin-content">

                <h2 className="page-title">
                    Stores
                </h2>

                <p className="page-subtitle">
                    View and manage all registered stores
                </p>


                {/* Filters */}
                <div className="filter-card">

                    <div className="filter-grid">

                        <input
                            type="text"
                            placeholder="Search by store name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />

                        <input
                            type="text"
                            placeholder="Search by email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                        <input
                            type="text"
                            placeholder="Search by address"
                            value={address}
                            onChange={(e) =>
                                setAddress(e.target.value)
                            }
                        />

                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value)
                            }
                        >
                            <option value="name">
                                Sort by Name
                            </option>

                            <option value="email">
                                Sort by Email
                            </option>

                            <option value="address">
                                Sort by Address
                            </option>

                            <option value="rating">
                                Sort by Rating
                            </option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(e.target.value)
                            }
                        >
                            <option value="asc">
                                Ascending
                            </option>

                            <option value="desc">
                                Descending
                            </option>
                        </select>

                    </div>


                    <div className="filter-actions">

                        <button onClick={fetchStores}>
                            Search
                        </button>

                        <button
                            className="secondary-button"
                            onClick={fetchStores}
                        >
                            Apply Sort
                        </button>

                    </div>

                </div>


                {message && (
                    <div className="form-message">
                        {message}
                    </div>
                )}


                {/* Store Count */}
                <div
                    style={{
                        marginBottom: "15px",
                        color: "#697384",
                        fontSize: "14px"
                    }}
                >
                    Total Stores:{" "}
                    <strong>
                        {stores.length}
                    </strong>
                </div>


                {/* Store Table */}
                {stores.length === 0 ? (

                    <div className="empty-state">
                        No stores found.
                    </div>

                ) : (

                    <div className="table-card">

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Store Name
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Address
                                        </th>

                                        <th>
                                            Rating
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {stores.map((store) => (

                                        <tr key={store.id}>

                                            <td>
                                                <strong>
                                                    {store.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {store.email}
                                            </td>

                                            <td>
                                                {store.address}
                                            </td>

                                            <td>

                                                <span
                                                    className="star-rating"
                                                >
                                                    ★{" "}
                                                    {
                                                        store.average_rating
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default AdminStores;