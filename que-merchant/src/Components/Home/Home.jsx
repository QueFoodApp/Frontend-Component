import React, { useState } from 'react';
import "./Home.css";
import { SideBar } from './SideBar';

function Home() {

    // define use state for busy mode 
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isTimerPopupVisible, setIsTimerPopupVisible] = useState(false);
    const [isBusyMode, setIsBusyMode] = useState(false);
    const [currentOptions, setCurrentOptions] = useState(["Busy Mode", "Auto Reject Timer"]);

    // define use staate for auto reject timer 
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [amPm, setAmPm] = useState('AM');

    // make popup window visible 
    const handleModeClick = () => {
        setIsPopupVisible(true);
    };

    // switch between busy mode and non-busy mode 
    const handleOptionSelect = (option) => {

        if (option === "Busy Mode") {
            setIsBusyMode(true);                                           // Turn the "Mode" item red
            setCurrentOptions(["Turn off Busy Mode"]);                     // change the use state to turn off busy mode
        } 
        else if (option === "Turn off Busy Mode") {
            setIsBusyMode(false);                                          // Reset color to normal
            setCurrentOptions(["Busy Mode", "Auto Reject Timer"]);         // change the use state to non-busy mode 
        } 
        else if (option === "Auto Reject Timer") {
            setIsTimerPopupVisible(true);                                  // Show timer input popup
            setIsPopupVisible(false);                                      // hide the select mode popup window
            return;                                                        // optional: exit early to prevent further execution
        }
        setIsPopupVisible(false);                                          // hide the select mode popup window
    };

    const handleTimerSubmit = () => {
        // Validate inputs
        if (!hours || !minutes) {
            alert('Input is invalid! Please enter again!');
            return; // Exit early if inputs are empty
        }
    
        if (isNaN(hours) || isNaN(minutes)) {
            alert('Input is invalid! Please enter again!');
            return; // Exit early if inputs are not numbers
        }
    
        if (hours < 1 || hours > 12) {
            alert('Input is invalid! Please enter again!');
            return; // Exit early if hours are out of range
        }
    
        if (minutes < 0 || minutes > 59) {
            alert('Input is invalid! Please enter again!');
            return; // Exit early if minutes are out of range
        }
    
        // If validation passes, log the timer
        console.log(`Timer set for ${hours} hours, ${minutes} minutes, ${amPm}`);
    
        // Close the timer popup
        setIsTimerPopupVisible(false);
        // Reset input fields if needed
        setHours('');
        setMinutes('');
    };

    return (
        <div className="sidebar">
            <ul className="sidebar-list">
                {SideBar.map((value, key) => {
                    return (
                        <li className={`row ${value.title === "Mode" && isBusyMode ? 'red' : ''}`} key={key} 
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
                        </li>
                    );
                })}
            </ul>

            {/* Popup window */}
            {isPopupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Choose Between Busy Mode and Auto Reject Timer</h3>
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

                
            {/* Timer Input Popup */}
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
