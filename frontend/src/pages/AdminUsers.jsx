import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("");

    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            const params = new URLSearchParams();

            if (name) params.append("name", name);
            if (email) params.append("email", email);
            if (address) params.append("address", address);
            if (role) params.append("role", role);

            params.append("sortBy", sortBy);
            params.append("sortOrder", sortOrder);

            const response = await fetch(
                `http://localhost:5000/api/admin/users?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to load users"
                );
                return;
            }

            const sortedUsers = [...data.users].sort((a, b) => {
                const valueA = String(
                    a[sortBy] || ""
                ).toLowerCase();

                const valueB = String(
                    b[sortBy] || ""
                ).toLowerCase();

                const comparison =
                    valueA.localeCompare(valueB);

                return sortOrder === "asc"
                    ? comparison
                    : -comparison;
            });

            setUsers(sortedUsers);

        } catch (error) {
            console.error(
                "Users fetch error:",
                error
            );

            setMessage(
                "Unable to connect to the server"
            );
        }
    };

    const viewUser = async (userId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/admin/users/${userId}`,
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
                    "Failed to load user details"
                );
                return;
            }

            setSelectedUser(data);

        } catch (error) {
            console.error(
                "User details error:",
                error
            );

            setMessage(
                "Unable to load user details"
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
                    className="active"
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


            {/* Main */}
            <main className="admin-content">

                <div className="page-title">

                    <h2>
                        Users & Administrators
                    </h2>

                    <p className="page-subtitle">
                        Manage RateHub users, administrators,
                        and store owners
                    </p>

                </div>


                {/* Filters */}
                <div className="filter-card">

                    <div className="filter-grid">

                        <input
                            type="text"
                            placeholder="Search by name"
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
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                        >
                            <option value="">
                                All Roles
                            </option>

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

                            <option value="role">
                                Sort by Role
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

    <button onClick={fetchUsers}>
        Search
    </button>

    <button
        className="secondary-button"
        onClick={fetchUsers}
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


                {/* User Table */}
                {users.length === 0 ? (

                    <div className="empty-state">
                        No users found.
                    </div>

                ) : (

                    <div className="table-card">

                        <div className="table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {users.map((user) => (

                                        <tr key={user.id}>

                                            <td>
                                                <strong>
                                                    {user.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {user.email}
                                            </td>

                                            <td>
                                                {user.address}
                                            </td>

                                            <td>
                                                {user.role}
                                            </td>

                                            <td>

                                                <button
                                                    className="table-action"
                                                    onClick={() =>
                                                        viewUser(
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


                {/* User Details */}
                {selectedUser && (

                    <div className="details-overlay">

                        <div className="details-modal">

                            <div className="details-header">

                                <div>
                                    <h2>
                                        User Details
                                    </h2>

                                    <p>
                                        Account information
                                    </p>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setSelectedUser(null)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="details-content">

                                <div className="detail-row">
                                    <span>Name</span>
                                    <strong>
                                        {selectedUser.user.name}
                                    </strong>
                                </div>

                                <div className="detail-row">
                                    <span>Email</span>
                                    <strong>
                                        {selectedUser.user.email}
                                    </strong>
                                </div>

                                <div className="detail-row">
                                    <span>Address</span>
                                    <strong>
                                        {selectedUser.user.address}
                                    </strong>
                                </div>

                                <div className="detail-row">
                                    <span>Role</span>
                                    <strong>
                                        {selectedUser.user.role}
                                    </strong>
                                </div>

                            </div>


                            <div className="details-footer">

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setSelectedUser(null)
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default AdminUsers;