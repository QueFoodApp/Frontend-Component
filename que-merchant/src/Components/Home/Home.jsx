import React, { useState, useEffect, useRef } from 'react';
import "./Home.css";
import { SideBar } from './SideBar';

function Home() {

    // define use state for pop up windows 
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isTimerPopupVisible, setIsTimerPopupVisible] = useState(false);

    // define use state for busy mode selection 
    const [isBusyMode, setIsBusyMode] = useState(false);
    const [currentOptions, setCurrentOptions] = useState(["Busy Mode", "Auto Reject Timer"]);

    // define use state for auto reject timer 
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [amPm, setAmPm] = useState('AM');
    const [autoRejectTime, setAutoRejectTime] = useState(null); // Store scheduled time
    const timerRef = useRef(null); // Store the timeout ID

    // Cleanup timeout on unmount - optional for now 
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // change state to isPopupVisible, make mode seletion popup window visible in HTML 
    const handleModeClick = () => {
        setIsPopupVisible(true);
    };

    // 
    const handleOptionSelect = (option) => {
        if (option === "Busy Mode") {
            setBusyModeManually(true); // Activate Busy Mode manually
        } 
        else if (option === "Turn off Busy Mode") {
            setBusyModeManually(false); // Deactivate Busy Mode manually
        } 
        else if (option === "Auto Reject Timer") {
            setIsTimerPopupVisible(true); // Show timer popup
            setIsPopupVisible(false);
        }
        setIsPopupVisible(false);
    };

    // function to handle with auto reject timer, manually to turn it off 
    const setBusyModeManually = (isBusy) => {

        setIsBusyMode(isBusy);
        if (isBusy) {
            setCurrentOptions(["Turn off Busy Mode"]);
        } 
        else {
            setCurrentOptions(["Busy Mode", "Auto Reject Timer"]);
            if (timerRef.current) {
                clearTimeout(timerRef.current); // Clear active timer if Busy Mode is turned off
                setAutoRejectTime(null);
            }
        }
    };


    const handleTimerSubmit = () => {

        // validate user input (invalid characters)
        if (!hours || !minutes || isNaN(hours) || isNaN(minutes)) {
            alert('Invalid input! Please enter valid numbers.');
            return;
        }

        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        // validate user input (invalid time)
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            alert('Please enter a valid time.');
            return;
        }

        // define current time and store user's input time
        const now = new Date();
        let timerTime = new Date();
        timerTime.setHours(amPm === 'PM' ? hour + 12 : hour);
        timerTime.setMinutes(minute);
        timerTime.setSeconds(0);

        // check the timer is setting up correctly, in this case, the time cannot exceed one day duration 
        if (timerTime <= now) {
            alert('Time must be in the future.');
            return;
        }

        setAutoRejectTime(timerTime);                              
        setIsBusyMode(true); 
        setCurrentOptions(["Turn off Busy Mode"]);
        setIsTimerPopupVisible(false);

        // calculate count down time 
        const timeUntilAutoReject = timerTime.getTime() - now.getTime();
        console.log(`Auto Reject Timer set for ${timerTime.toLocaleTimeString()}.`);

        if (timerRef.current) clearTimeout(timerRef.current); // Clear previous timer
        timerRef.current = setTimeout(() => {
            setBusyModeManually(false); // Automatically turn off Busy Mode
            console.log("Busy Mode turned off automatically.");
        }, timeUntilAutoReject);
    };

    return (
        <div className="sidebar">
            <ul className="sidebar-list">
                {SideBar.map((value, key) => (
                    <li
                        className={`row ${value.title === "Mode" && isBusyMode ? 'red' : ''}`}
                        key={key}
                        onClick={() => {
                            if (value.title === "Mode") {
                                handleModeClick();
                            } else {
                                window.location.pathname = value.link;
                            }
                        }}
                    >
                        <div id="icon"> {value.icon} </div>
                        <div id="title"> {value.title} </div>

                        {/* Display Timer within the Mode Section */}
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

            {/* Render HTML if the state == isPopupVisible */}
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

            {/* Render HTML if the state == isTimerPopupVisible */}
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
                        <button className="popup-button" onClick={handleTimerSubmit}>OK</button>
                        <button className="popup-button" onClick={() => setIsTimerPopupVisible(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
