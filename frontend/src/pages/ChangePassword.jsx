import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsSuccess(false);

        try {
            const token =
                localStorage.getItem("token");

            const changePasswordUrl =
                user?.role === "STORE_OWNER"
                    ? "http://localhost:5000/api/store-owner/change-password"
                    : "http://localhost:5000/api/user/change-password";

            const response = await fetch(
                changePasswordUrl,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Password change failed"
                );
                return;
            }

            setMessage(
                "Password changed successfully!"
            );

            setIsSuccess(true);

            setCurrentPassword("");
            setNewPassword("");

        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            setMessage(
                "Unable to connect to the server"
            );
        }
    };

    const handleBack = () => {
        if (user?.role === "STORE_OWNER") {
            navigate("/store-owner");
        } else {
            navigate("/user");
        }
    };

    return (
        <div className="password-page">

            <div className="password-card">

                {/* Header */}
                <div className="password-header">

                    <div className="logo-mark">
                        R
                    </div>

                    <h1>
                        Change Password
                    </h1>

                    <p>
                        Update your RateHub account password
                    </p>

                </div>


                {/* Form */}
                <form
                    onSubmit={handleChangePassword}
                    className="password-form"
                >

                    <div className="form-group">

                        <label>
                            Current Password
                        </label>

                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter current password"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            New Password
                        </label>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter new password"
                            required
                        />

                        <small className="password-hint">
                            8–16 characters, including at least
                            one uppercase letter and one special
                            character.
                        </small>

                    </div>


                    {/* Message */}
                    {message && (

                        <div
                            className={
                                isSuccess
                                    ? "password-message success"
                                    : "password-message error"
                            }
                        >
                            {message}
                        </div>

                    )}


                    {/* Buttons */}
                    <div className="password-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleBack}
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Change Password
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default ChangePassword;