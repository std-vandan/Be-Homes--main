import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router';


export default function UpwardHead(props) {
    const { logout } = useContext(AuthContext);
    const { isLightMode, toggleMode } = useContext(ThemeContext);
    return (
       <div className="d-desktop">
       <div className="padd-common-16 py-3 upward-head d-flex justify-content-between mt-2 " >
            <div className="d-flex gap-3"> 
            <div className="page-title"> 
                 {props.pageTitle} 

            </div>
            <div>
         

            </div>
            </div>
            <div className="d-flex gap-3"> <button className="common-btn" onClick={logout}>Logout</button> 
            <div className="">   
                 <div className={`toggle ${isLightMode ? 'day' : ''}`} onClick={toggleMode}>
                <div className={`toggle-btn ${isLightMode ? 'sun' : 'moon'}`}></div>
            </div>
            </div>
            </div>


        </div>
        </div>
    )
}
