import React, { useState, useEffect, useRef } from 'react';
import "./Home.css";
import { SideBar } from './SideBar';
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    // State Variables
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isTimerPopupVisible, setIsTimerPopupVisible] = useState(false);
    const [isBusyMode, setIsBusyMode] = useState(false);
    const [currentOptions, setCurrentOptions] = useState(["Busy Mode", "Auto Reject Timer"]);

    const [isOrderClicked, setIsOrderClicked] = useState(false);        // State for "Order" click
    const [menus, setMenus] = useState([]);                             // State for menus
    const [category, setCategory] = useState(''); // State to store selected category
    const [foodItems, setFoodItems] = useState([]); // State to store fetched food items
    const [searchQuery, setSearchQuery] = useState("");                 // New state for search input
    const [hours, setHours] = useState('');                             // New state for hours input
    const [minutes, setMinutes] = useState('');                         // New state for minutes input
    const [amPm, setAmPm] = useState('AM');                             // New state for AM/PM selection
    const [autoRejectTime, setAutoRejectTime] = useState(null);         // New state for auto reject time
    const timerRef = useRef(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Fetch menus when the component mounts
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
                    console.log("Fetched menus:", data); 
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
    // Show the list of Menus in the restaurant owned by the username
    // useEffect(() => {
    //     console.log("Menus state updated:", menus);
    // }, [menus]); // This effect will run whenever `menus` changes



    const handleModeClick = () => {
        setIsPopupVisible(true);
    };

    const handleOptionSelect = (option) => {
        if (option === "Busy Mode") {
            setBusyModeManually(true);
        } else if (option === "Turn off Busy Mode") {
            setBusyModeManually(false);
        } else if (option === "Auto Reject Timer") {
            setIsTimerPopupVisible(true);
            setIsPopupVisible(false);
        }
        setIsPopupVisible(false);
    };

    const setBusyModeManually = (isBusy) => {
        setIsBusyMode(isBusy);
        if (isBusy) {
            setCurrentOptions(["Turn off Busy Mode"]);
        } else {
            setCurrentOptions(["Busy Mode", "Auto Reject Timer"]);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                setAutoRejectTime(null);
            }
        }
    };

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

    const handleLogout = () => {
        // Clear the login state and token
        sessionStorage.removeItem("isLoggedIn"); // Clear login state
        localStorage.removeItem("token"); // Remove the token
        navigate("/login"); // Redirect to the login page after logging out
        window.location.reload(); // Optional reload
    };


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

    return (
        <div className="sidebar">
            <div>
                <h1>Welcome to Home!</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>
    
            <h2>Your Menus:</h2>
            {menus.length > 0 ? (
                <ul>
                    {menus.map((menu, index) => (
                        <li key={index}>{menu.food_name}</li>
                    ))}
                </ul>
            ) : (
                <p>No menus available.</p>
            )}
    
            <div className="menu-container">
                {isOrderClicked && (
                    <div>
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
    
                        <h2>Food Items in Category: {category}</h2>
                        {foodItems.length > 0 ? (
                            <ul>
                                {foodItems.map((foodItem, index) => (
                                    <li key={index}>
                                        {foodItem.food_name}: ${foodItem.food_price}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No food items available for this category.</p>
                        )}
                    </div>
                )}
                {isOrderClicked && menus.length === 0 && <p>No menus available.</p>}
            </div>
    
            <ul className="sidebar-list">
                {SideBar.map((value, key) => (
                    <li
                        className={`row ${
                            value.title === "Mode" && isBusyMode ? 'red' : ''
                        }`}
                        key={key}
                        onClick={() => {
                            if (value.title === "Dish") {
                                setIsOrderClicked(true);
                            } else if (value.title === "Mode") {
                                handleModeClick();
                            } else if (value.title === "Logout") {
                                handleLogout();
                            } else {
                                window.location.pathname = value.link;
                            }
                        }}
                    >
                        <div id="icon">{value.icon}</div>
                        <div id="title">{value.title}</div>
    
                        {value.title === "Mode" && autoRejectTime && (
                            <div className="mode-timer">
                                {autoRejectTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
    
            {isPopupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Select a Mode</h3>
                        {currentOptions.includes("Busy Mode") && (
                            <button onClick={() => handleOptionSelect("Busy Mode")}>
                                Busy Mode
                            </button>
                        )}
                        {currentOptions.includes("Auto Reject Timer") && (
                            <button onClick={() => handleOptionSelect("Auto Reject Timer")}>
                                Auto Reject Timer
                            </button>
                        )}
                        {currentOptions.includes("Turn off Busy Mode") && (
                            <button onClick={() => handleOptionSelect("Turn off Busy Mode")}>
                                Turn off Busy Mode
                            </button>
                        )}
                        <button onClick={() => setIsPopupVisible(false)}>Dismiss</button>
                    </div>
                </div>
            )}
    
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
                                onChange={(e) => setHours(e.target.value)}
                            />
                            <span>:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                placeholder="Minute"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
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
                            <button className="popup-button" onClick={handleTimerSubmit}>
                                OK
                            </button>
                            <button
                                className="popup-button"
                                onClick={() => setIsTimerPopupVisible(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }


export default Home;
