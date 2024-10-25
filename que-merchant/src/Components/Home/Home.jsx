import React from 'react';
import "./Home.css";
import {SideBar} from './SideBar';

function Home() {
    return (
        <div className="sidebar">
            <ul className='sidebar-list'>
                {SideBar.map((value, key) =>{
                    return(
                        <li className='row' key={key} onClick={() =>{window.location.pathname = value.link}}>
                            <div id='icon'> {value.icon} </div>
                            <div id='title'> {value.title} </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}

export default Home;