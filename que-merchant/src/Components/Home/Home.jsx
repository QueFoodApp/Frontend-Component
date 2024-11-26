import React, { useState, useEffect, useRef } from 'react';
import "./Home.css";
import { SideBar } from './SideBar';
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';

function Home() {
    const navigate = useNavigate();

    // popup window states variable 
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isTimerPopupVisible, setIsTimerPopupVisible] = useState(false);

    // busy mode states variable 
    const [isBusyMode, setIsBusyMode] = useState(false);
    const [currentOptions, setCurrentOptions] = useState(["Busy Mode", "Auto Reject Timer"]);

    // display menu states variable 
    const [isOrderClicked, setIsOrderClicked] = useState(false);        // State for "Order" click
    const [menus, setMenus] = useState([]);                             // State for menus
    const [searchQuery, setSearchQuery] = useState("");                 // New state for search input

    // display food and price states variable 
    const [category, setCategory] = useState('');                       // State to store selected category

    // auto reject timer states variable 
    const [hours, setHours] = useState('');                             // New state for hours input
    const [minutes, setMinutes] = useState('');                         // New state for minutes input
    const [amPm, setAmPm] = useState('AM');                             // New state for AM/PM selection
    const [autoRejectTime, setAutoRejectTime] = useState(null);         // New state for auto reject time
    const timerRef = useRef(null);

    // food item states variable 
    const [foodItems, setFoodItems] = useState([]);
    const [toggledItems, setToggledItems] = useState({});
    const [masterToggle, setMasterToggle] = useState({});

    // display order states variable
    const [orders, setFetchedOrders] = useState([]); // Fetched orders
    const [order, setOrders] = useState(false); // Display control for orders
    const [visibleOrders, setVisibleOrders] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
    const [status, setStatus] = useState("Pending"); // Initial status

    // Order Page: handle pickup or rejection 
    const updateOrderStatus = async (orderNumber, status) => {
        const token = localStorage.getItem("token"); // Retrieve JWT token
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/order/update-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_number: orderNumber,
                    status: status, // The new status to set
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update order status: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Order status updated successfully:', data);
            
            // Return updated status for the order
            return data.new_status; // Assume the API returns the updated status
            
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error; // Rethrow error for handling in handleChange
        }
    };
    
    // Updated handleChange function
    const handleChange = async (event, orderNumber) => {
        const selectedValue = event.target.value;
    
        let newStatus = status; // Default to the current status
        if (selectedValue == "Ready to Pick Up") {
            newStatus = "complete"; // Set to Completed
        } else if (selectedValue == "Cancel This Order") {
            newStatus = "cancelled"; // Set to Cancelled
        }

        console.log('Request Body:', {
            order_number: orderNumber,
            status: newStatus,
        });
    
        // Call the fetch function to update the status
        try {
            const updatedStatus = await updateOrderStatus(orderNumber, newStatus);
            // Update local status state for the specific order directly
            setFetchedOrders((prevOrders) => 
                prevOrders.map(order => 
                    order.order_number == orderNumber ? { ...order, status: updatedStatus } : order
                )
            );
            
            setStatus(newStatus); // Update local general status if needed
        } catch (error) {
            console.error("Failed to update status in UI:", error);
        }
    };

    // Dish Page: handle dish avaiablity toggle
    const handleToggle = async (index) => {
        // Toggle the item's availability state
        const newToggleState = !(foodItems[index].availability == "available"); // Get the new toggle state
    
        // Update the toggledItems state
        // setToggledItems((prevState) => ({
        //     ...prevState,
        //     [index]: newToggleState,
        // }));
    
        // Get the corresponding food item details
        const foodItem = foodItems[index]; // Assuming foodItems is an array of objects
        const foodName = foodItem.food_name; // Food name for validation
    
        // Use the category defined in state
        const selectedCategory = category; // Use the state variable we declared
    
        // Determine the availability status based on the toggle state
        const availability = newToggleState ? 'available' : 'unavailable';
    
        // Fetch request to update the availability in the backend
        await updateFoodAvailability(selectedCategory, foodName, availability);

        fetchFoodByCategory(category);
    };
    
    // Function to fetch and update food availability
    const updateFoodAvailability = async (category, foodName, availability) => {
        const token = localStorage.getItem("token"); // Retrieve JWT token
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/menus/availability`, {
                method: 'PUT', // Or 'PATCH' based on your API design
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category, // Use the state-defined category
                    food_name: foodName,
                    availability: availability,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update availability for ${foodName}: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Update successful:', data);
    
        } catch (error) {
            console.error("Error updating food availability:", error);
        }
    };

    // Dish Page: Handle master dish avaiability toggle
    const handleMasterToggle = async () => {
        // Check if all food items are currently available
        const areAllAvailable = foodItems.every(item => item.availability === 'available');
        
        // Determine the new availability status
        const availability = areAllAvailable ? 'unavailable' : 'available'; // Toggle logic
    
        // Use the current category
        const selectedCategory = category; 
    
        // Fetch request to update availability for all items in the category
        const token = localStorage.getItem("token"); // Retrieve the JWT token
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/menus/update-availability`, {
                method: 'PUT', // Modify if your API requires a different method
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: selectedCategory,  // Send the current category
                    availability: availability    // Set to either 'available' or 'unavailable'
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update availability: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Update successful:', data);
            fetchFoodByCategory(category);
            
            // Here, you can update your local state if needed
            const newToggledItems = {};
            foodItems.forEach((_, index) => {
                newToggledItems[index] = availability === 'available'; // Set every item's toggle based on availability
            });
            // setToggledItems(newToggledItems);  // Update the toggle items states
    
        } catch (error) {
            console.error("Error updating food availability:", error);
        }
    };
    
    // Mode Page: Auto Rejection Timer, Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Dish Page: API Fetch menus when the component mounts
    useEffect(() => {
        const fetchMenus = async () => {
            const token = localStorage.getItem("token"); // Get the JWT token
            if (token) {
                try {
                    const response = await fetch("http://127.0.0.1:8000/api/menus", { 
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`, // Authorization with the token
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch menus.");
                    }

                    const data = await response.json(); // Parse JSON data
                    setMenus(data); // Set the menus in state
                } catch (error) {
                    console.error("Error fetching menus:", error);
                    navigate("/login"); // Redirect to login if there's an error (e.g., no valid token)
                }
            } else {
                navigate("/login"); // Redirect to login if no token is found
            }
        };

        fetchMenus(); // Call fetch function
    }, [navigate]);

    // Order Page: API Fetch orders when the compoinent mounts
    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://127.0.0.1:8000/api/order", { 
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to fetch orders. Status: ${response.status}, Detail: ${errorData.detail}`);
                    }
    
                    const data = await response.json(); 
                    setFetchedOrders(data); // Set the fetched orders
                } catch (error) {
                    console.error("Error fetching orders:", error);
                    navigate("/login");
                }
            } else {
                navigate("/login");
            }
        };
    
        fetchOrders();
    }, []);
    

    // Mode Page: toogle popup visible or not 
    const handleModeClick = () => {
        setIsPopupVisible(true); // Show popup for mode options
    };

    // Dish Page: search bar 
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Dish Page: search bar function
    const filteredMenus = menus.filter((menu) =>
        menu.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dish Page: API Display Food Items 
    const fetchFoodByCategory = async (selectedCategory) => {
        const token = localStorage.getItem("token"); // Your JWT token
        const url = `http://127.0.0.1:8000/api/menus/food?category=${encodeURIComponent(selectedCategory)}`; // Construct the URL

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch food items');
            }

            const data = await response.json();
            console.log('Fetched food items:', data);
            setFoodItems(data); // Set the fetched food items in state
        } catch (error) {
            console.error('Error fetching food items:', error);
        }
    };

    const handleCategoryClick = (menu) => {
        setCategory(menu.category); // Set selected category
        fetchFoodByCategory(menu.category); // Fetch food items based on category
    };

    // Busy mode & Auto Rejection Timer: toggle different popup windows 
    const handleOptionSelect = (option) => {
        if (option === "Busy Mode") {
            setBusyModeManually(true);
        } 
        else if (option === "Turn off Busy Mode") {
            setBusyModeManually(false);
        } 
        else if (option === "Auto Reject Timer") {
            setIsTimerPopupVisible(true);
            setIsPopupVisible(false);
        }
        setIsPopupVisible(false);
    };

    // Auto reject timer: turn off busy mode manually 
    const setBusyModeManually = (isBusy) => {
        setIsBusyMode(isBusy);
        if (isBusy) {
            setCurrentOptions(["Turn off Busy Mode"]);
        } 
        else {
            setCurrentOptions(["Busy Mode", "Auto Reject Timer"]);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                setAutoRejectTime(null);
            }
        }
    };

    // Auto Rejection Timer: handle invalid user inputs 
    const handleTimerSubmit = () => {
        // Validate user input
        if (!hours || !minutes || isNaN(hours) || isNaN(minutes)) {
            alert('Invalid input! Please enter valid numbers.');
            return;
        }

        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        // Validate timing
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            alert('Please enter a valid time.');
            return;
        }

        // Calculate the timer time
        const now = new Date();
        let timerTime = new Date();
        timerTime.setHours(amPm === 'PM' ? hour + 12 : hour);
        timerTime.setMinutes(minute);
        timerTime.setSeconds(0);

        if (timerTime <= now) {
            alert('Time must be in the future.');
            return;
        }

        setAutoRejectTime(timerTime);
        setIsBusyMode(true);
        setCurrentOptions(["Turn off Busy Mode"]);
        setIsTimerPopupVisible(false);

        // Calculate countdown time
        const timeUntilAutoReject = timerTime.getTime() - now.getTime();
        console.log(`Auto Reject Timer set for ${timerTime.toLocaleTimeString()}.`);

        if (timerRef.current) clearTimeout(timerRef.current); // Clear any previous timer
        timerRef.current = setTimeout(() => {
            setBusyModeManually(false); // Automatically turn off Busy Mode after the timer
            console.log("Busy Mode turned off automatically.");
        }, timeUntilAutoReject);
    };

    // Logout function 
    const handleLogout = () => {
        // Clear the login state and token
        sessionStorage.removeItem("isLoggedIn"); // Clear login state
        localStorage.removeItem("token"); // Remove the token
        navigate("/login"); // Redirect to the login page after logging out
        window.location.reload(); // Optional reload
    };

    const toggleOrderVisibility = async (event, index, orderNumber, orderStatus) => {
        // Only make the clicked order visible
        setVisibleOrders({ [index]: true }); 
        if(orderStatus == "new" || orderStatus == "prepare")
        {
            setStatus("Pending");
        }
    
        let newStatus = status; // Default to the current status
        
        if (orderStatus == "new") {
            newStatus = "prepare"; 
    
            try {
                const updatedStatus = await updateOrderStatus(orderNumber, newStatus);
                
                // Update local status state for the specific order directly
                setFetchedOrders((prevOrders) => 
                    prevOrders.map(order => 
                        order.order_number === orderNumber ? { ...order, status: updatedStatus } : order
                    )
                );
                
                
            } catch (error) {
                console.error("Failed to update status in UI:", error);
            }
        } 
    };

    // Order Page: status icon color 
    const getStatusBadgeStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'new':
                return { backgroundColor: '#ff6b6b' }; // Red
            case 'cancelled':
                return { backgroundColor: '#808080' }; // Grey
            case 'delay':
                return { backgroundColor: '#ff6b6b' }; // Red
            case 'complete':
                return { backgroundColor: '#28a745' }; // Green
            case 'prepare':
                return { backgroundColor: '#28a745' }; // Green
            default:
                return { backgroundColor: '#000' }; // Default black for unknown status
        }
    };

    // Main: Display HTML page 
    return (

        <div className="main-container">

            <div className="background-text">
                <h1>WELCOME</h1>
                <h2>TO</h2>
                <h1>QUE</h1>
                <h2>FOODHALL</h2>
            </div>

            {/* Display menus only if the "Order" item is clicked */}
            {isOrderClicked && (
                <div className="menu-container">
                    <h1>Category</h1>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search for a category..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {filteredMenus.length > 0 ? (
                        filteredMenus.map((menu, index) => (
                            <div key={index} className="menu-category">
                                <div className="menu-category-title">{menu.category}</div>
                                <button
                                    className="edit-menu"
                                    onClick={() => handleCategoryClick(menu)}
                                >
                                    &gt;
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No menus available.</p>
                    )}
                </div>
            )}

            {/* Display Order List */}
            {order && orders.length > 0 ? (
                <div className="order-container">
                    <ul>
                        {orders.map((orderItem, index) => (
                            <ul className="order-category" key={index}>
                                <button className="order-edit" onClick={(event) => toggleOrderVisibility(event, index, orderItem.order_number, orderItem.status)}>&gt;</button>
                                <p className="order-title">Order Number: {orderItem.order_number}</p>
                                <p className="order-status">
                                    <span className="status-badge" style={getStatusBadgeStyle(orderItem.status)}>Status: {orderItem.status}</span>
                                </p>
                                <p>
                                    <strong>Item Count:</strong> {orderItem.items_count}
                                    <br/>
                                    <strong>Total:</strong> ${orderItem.total}
                                </p>
                            </ul>
                        ))}
                    </ul>
                </div>
            ) : (
                order && <></>
            )}

            {/* Right Section: Display Selected Order Details */}
            <div className="food-container">
                {order && orders.length > 0 && (
                    <div>
                        {orders.map((orderItem, index) =>
                            visibleOrders[index] ? (
                                <div key={index}>
                                    
                                    <p className="order-title-inside">Order Number: {orderItem.order_number}</p>
                                    <br/>
                                    <h3> Due Date:{' '}{format(new Date(orderItem.due_date), 'hh:mm a')} </h3>
                                                                    
                                    <p className="order-status-inside">
                                        <span className="status-badge-inside" style={getStatusBadgeStyle(orderItem.status)} >Status: {orderItem.status}</span>
                                    </p>
                                    <hr className="line-break"></hr>

                                    {orderItem.fooditems && orderItem.fooditems.length > 0 ? (
                                        <div className="order-details">
                                            <ul className="food-list">
                                                {Object.entries(
                                                    orderItem.fooditems.reduce((acc, item) => {
                                                        if (!acc[item.food_name]) {
                                                            acc[item.food_name] = { ...item, quantity: 1 };
                                                        } else {
                                                            acc[item.food_name].quantity += 1;
                                                            acc[item.food_name].food_price = (
                                                                parseFloat(acc[item.food_name].food_price) +
                                                                parseFloat(item.food_price)
                                                            ).toFixed(2); // Sum up prices
                                                        }
                                                        return acc;
                                                    }, {})
                                                ).map(([foodName, groupedItem], itemIndex) => (
                                                    <li key={itemIndex} className="food-item">
                                                        <div className="food-info">
                                                            <h3 className="food-name">Quantity: {groupedItem.quantity}</h3>
                                                            <h3 className="food-name">{foodName}</h3>
                                                            <h3 className="food-price"> ${parseFloat(groupedItem.food_price).toFixed(2)}</h3>
                                                        </div>
                                                        <hr className="line-break" />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p>No food items found for this order.</p>
                                    )}

                                    <hr className="line-break"></hr>

                                    <div className="subtotal">
                                        <p><strong>Subtotal: ${parseFloat(orderItem.subtotal).toFixed(2)}</strong></p>
                                        <p><strong>Tax: ${parseFloat(orderItem.taxes).toFixed(2)}</strong></p>
                                        <h3><strong>Total:</strong> ${parseFloat(orderItem.total).toFixed(2)}</h3>
                                    </div>

                                    <div className="update-order-status">
                                        {status === "Pending" ? (
                                            <select
                                                className="custom-dropdown"
                                                onChange={(event) => handleChange(event, orderItem.order_number)} // Pass order number
                                            >
                                                <option value="Update the order status">Update the Order Status</option>
                                                <option value="Ready to Pick Up">Ready to Pick Up</option>
                                                <option value="Cancel This Order">Cancel This Order</option>
                                            </select>
                                        ) : (
                                            <p>Order Status: {status}</p>
                                        )}
                                    </div>

                                </div>
                            ) : null
                        )}
                    </div>
                )}
            </div>

            <div className="food-container"> {isOrderClicked && (
                <div>

                    <div className="inline-container-master">
                        <h2>All dishes of: {category}</h2>
                        <p>Disable/Enable</p>
                        <button
    className={`toggle-button master-toggle ${foodItems.every(item => item.availability == 'available') ? 'toggled' : ''}`} onClick={handleMasterToggle}></button>
                    </div>

                    <div className="food-category"> {foodItems.length > 0 ? (
                            <ul>{foodItems.map((foodItem, index) => (
                                <li className="food-items" key={index}>
                                    <p id="food-name">{foodItem.food_name}</p>
                                    <div className="inline-container">
                                        <p id="food-price">${foodItem.food_price}</p>
                                        <button className={`toggle-button ${foodItems[index].availability == "available" ? 'toggled' : ''}`} onClick={() => handleToggle(index)}></button>
                                    </div>
                                </li>
                                ))}
                            </ul>
                            ) : (
                                <p>No food items available for this category.</p >
                            )}
                    </div>
                </div>
                )}
            </div>

            <div className="sidebar">

                <ul className="sidebar-list">{SideBar.map((value, key) => (
                   
                   <li className={`row ${value.title === "Mode" && isBusyMode ? 'red' : ''}`} key={key} onClick={() => {
                        if (value.title === "Dish") {
                            setOrders(false); // Ensure the "Order" view is hidden
                            setIsOrderClicked(true); // Show the "Dish" view
                        } 
                        else if (value.title === "Order") {
                            setOrders(true); // Show the "Order" view
                            setIsOrderClicked(false); // Ensure the "Dish" view is hidden
                        }
                        else if (value.title === "Mode") {
                            handleModeClick();
                        } 
                        else if (value.title === "Logout") {
                            handleLogout();
                        } 
                        else {
                            window.location.pathname = value.link;
                        }
                    }}
                    >
                        <div id="icon"> {value.icon} </div>
                        <div id="title"> {value.title} </div> 
                        {value.title === "Mode" && autoRejectTime && (
                            <div className="mode-timer">
                                {autoRejectTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true,})}
                            </div>
                        )}
                    </li>
                    ))}
                </ul>

                {/* Popup for selecting modes */}
                {isPopupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Select a Mode</h3>
                        {currentOptions.includes("Busy Mode") && (
                            <button onClick={() => handleOptionSelect("Busy Mode")}>Busy Mode</button>
                        )}
                        {currentOptions.includes("Auto Reject Timer") && (
                            <button onClick={() => handleOptionSelect("Auto Reject Timer")}>Auto Reject Timer</button>
                        )}
                        {currentOptions.includes("Turn off Busy Mode") && (
                            <button onClick={() => handleOptionSelect("Turn off Busy Mode")}>Turn off Busy Mode</button>
                        )}
                        <button onClick={() => setIsPopupVisible(false)}>Dismiss</button>
                    </div>
                </div>
                )}

                {/* Popup for timer input */}
                {isTimerPopupVisible && (
                    <div className="timer-popup">
                        <div className="timer-popup-content">
                            <h3>Set Auto Reject Timer</h3>
                            <div className="timer-input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    placeholder="Hour"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)} // Handle input change
                                />
                                <span>:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="Minute"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)} // Handle input change
                                />
                                <div className="am-pm-container">
                                    <button
                                        className={`am-pm-button ${amPm === 'AM' ? 'selected' : ''}`}
                                        onClick={() => setAmPm('AM')}
                                    >
                                        AM
                                    </button>
                                    <button
                                        className={`am-pm-button ${amPm === 'PM' ? 'selected' : ''}`}
                                        onClick={() => setAmPm('PM')}
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                            <button className="popup-button" onClick={handleTimerSubmit}>OK</button>
                            <button className="popup-button" onClick={() => setIsTimerPopupVisible(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
