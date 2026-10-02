import { useEffect, useState } from "react";

function StoreList() {
    const [stores, setStores] = useState([]);
    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    const [selectedRatings, setSelectedRatings] = useState({});

    const [ratingMessage, setRatingMessage] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/user/stores?search=${encodeURIComponent(
                    search
                )}`,
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
                    "Failed to load stores"
                );
                return;
            }

            setStores(data.stores);

        } catch (error) {
            console.error(
                "Store fetch error:",
                error
            );

            setMessage(
                "Unable to connect to the server"
            );
        }
    };


    const handleRatingChange = (
        storeId,
        rating
    ) => {
        setSelectedRatings((previous) => ({
            ...previous,
            [storeId]: rating
        }));

        setRatingMessage("");
    };


    const submitRating = async (storeId) => {
        try {
            const token =
                localStorage.getItem("token");

            const rating =
                selectedRatings[storeId];

            if (!rating) {
                setRatingMessage(
                    "Please select a rating first."
                );
                return;
            }

            const store = stores.find(
                (item) => item.id === storeId
            );

            const method = store?.my_rating
                ? "PUT"
                : "POST";

            const url = store?.my_rating
                ? `http://localhost:5000/api/user/ratings/${storeId}`
                : "http://localhost:5000/api/user/ratings";

            const body = store?.my_rating
                ? { rating }
                : {
                    store_id: storeId,
                    rating
                };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data =
                await response.json();

            if (!response.ok) {
                setRatingMessage(
                    data.message ||
                    "Rating submission failed"
                );
                return;
            }

            setRatingMessage(
                store?.my_rating
                    ? "Rating updated successfully!"
                    : "Rating submitted successfully!"
            );

            await fetchStores();

        } catch (error) {
            console.error(
                "Rating error:",
                error
            );

            setRatingMessage(
                "Unable to submit rating"
            );
        }
    };


    if (message) {
        return (
            <div className="message">
                {message}
            </div>
        );
    }


    return (
        <div className="store-list-page">

            {/* Search */}
            <div className="store-search">

                <input
                    type="text"
                    placeholder="Search by store name or address"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <button
                    onClick={fetchStores}
                >
                    Search
                </button>

            </div>


            {ratingMessage && (
                <div className="message">
                    {ratingMessage}
                </div>
            )}


            {/* Store Cards */}
            {stores.length === 0 ? (

                <div className="empty-state">
                    No stores available.
                </div>

            ) : (

                <div className="user-store-list">

                    {stores.map((store) => (

                        <div
                            className="user-store-card"
                            key={store.id}
                        >

                            <div className="store-card-top">

                                <div>

                                    <h3>
                                        {store.name}
                                    </h3>

                                    <p>
                                        {store.address}
                                    </p>

                                </div>

                                <div className="user-rating-box">

                                    <span>
                                        ★
                                    </span>

                                    <strong>
                                        {store.average_rating}
                                    </strong>

                                </div>

                            </div>


                            <div className="rating-info">

                                <div>
                                    <span>
                                        Overall Rating
                                    </span>

                                    <strong className="overall-rating">
                                        ★ {store.average_rating}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Your Rating
                                    </span>

                                    <strong>
                                        {store.my_rating
                                            ? `★ ${store.my_rating}`
                                            : "Not rated yet"}
                                    </strong>
                                </div>

                            </div>


                            {/* Rating */}
                            <div className="rating-section">

                                <p>
                                    {store.my_rating
                                        ? "Modify your rating"
                                        : "Rate this store"}
                                </p>


                                <div className="rating-buttons">

                                    {[1, 2, 3, 4, 5].map(
                                        (rating) => (

                                            <button
                                                key={rating}
                                                type="button"
                                                className={
                                                    selectedRatings[
                                                        store.id
                                                    ] === rating
                                                        ? "rating-button selected"
                                                        : "rating-button"
                                                }
                                                onClick={() =>
                                                    handleRatingChange(
                                                        store.id,
                                                        rating
                                                    )
                                                }
                                            >
                                                {rating}
                                            </button>

                                        )
                                    )}

                                </div>


                                <button
                                    type="button"
                                    className="submit-rating-button"
                                    onClick={() =>
                                        submitRating(
                                            store.id
                                        )
                                    }
                                >
                                    {store.my_rating
                                        ? "Modify Rating"
                                        : "Submit Rating"}
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default StoreList;