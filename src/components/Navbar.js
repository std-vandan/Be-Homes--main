import React, { useContext, useState } from "react";

import { Link, useLocation } from 'react-router';

import ToggleIcon from "../img/toggle-icon.svg";


import ActiveDashboardIcon from "../img/active-dashboard-icon.svg";
import InactiveDashboardIcon from "../img/dashboard-icon.svg";




import ActivePresentationIcon from "../img/active-presentation-icon.svg";
import InactivePresentationIcon from "../img/presentation-icon.svg";

import ActiveMeasurementIcon from "../img/active-measurement-icon.svg";
import InactiveMeasurementIcon from "../img/measurement-icon.svg";

import ActiveQuotationIcon from "../img/active-quotation-icon.svg";
import InactiveQuotationIcon from "../img/quotation-icon.svg";

import ActivePlanningIcon from "../img/active-planning-icon.svg";
import InactivePlanningIcon from "../img/planning-icon.svg";

import ActivePurchaseIcon from "../img/active-purchase-icon.svg";
import InactivePurchaseIcon from "../img/purchase-icon.svg";

import ActiveMaterialIcon from "../img/active-material-icon.svg";
import InactiveMaterialIcon from "../img/material-icon.svg";



import ActiveDispatchIcon from "../img/active-dispatch-icon.svg";
import InactiveDispatchIcon from "../img/dispatch-icon.svg";

import ActivePaymentIcon from "../img/active-payment-icon.svg";
import InactivePaymentIcon from "../img/payment-icon.svg";



import LogoDark from "../img/logo-dark.svg";
import LogoLight from "../img/logo-light.svg";

import { ThemeContext } from "../components/ThemeContext";

const Navbar = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const location = useLocation();
    // const { isLightMode } = useContext(ThemeContext);
    const { isLightMode, toggleMode } = useContext(ThemeContext);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleDrawingDropdown = () => {
        setIsDrawingOpen(!isDrawingOpen);
    };

    return (
        <>


            {/* Desktop Header */}
            <div className={`sidebar ${isOpen ? 'open' : 'closed'} d-desktop`}>
                <div className={`nav-head d-flex justify-content-between align-items-center mt-3 px-2 ${isOpen ? '' : 'flex-column-reverse'}`} >


                    <Link to="/" >
                        <div className={`logo-details text-center ${isOpen ? '' : 'logo-small'}`}>
                            <img src={isLightMode ? LogoLight : LogoDark} alt="Toggle Sidebar" />
                        </div>
                    </Link>
                    <button onClick={toggleSidebar} className="toggle-button">
                        <img src={ToggleIcon} alt="Toggle Sidebar" />
                    </button>
                </div>
                <ul className="desktop-nav-list">

                    <li>

                        <Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/' ? ActiveDashboardIcon : InactiveDashboardIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/' ? ActiveDashboardIcon : InactiveDashboardIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Dashboard</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
         

                    
                    <li>

                        <Link to="/presentation" className={location.pathname === '/presentation' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/presentation' ? ActivePresentationIcon : InactivePresentationIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/presentation' ? ActivePresentationIcon : InactivePresentationIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Presentation</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>       
                    



                </ul>
            </div>

            <header className="global-header d-mobile" >
    <nav className="">
      <div className="wrapper">
      <div className="d-flex align-items-center " >
        <input type="radio" name="slider" id="menu-btn" />
        <input type="radio" name="slider" id="close-btn" />
        <ul className="nav-links">
          <label htmlFor="close-btn" className="btn close-btn"><i class='bx bx-chevrons-left'></i></label>
          <li>

<Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>


   
        <div>
            <img src={location.pathname === '/' ? ActiveDashboardIcon : InactiveDashboardIcon} alt="" />
        </div>
  
        <img className="icon" src={location.pathname === '/' ? ActiveDashboardIcon : InactiveDashboardIcon} alt="" />
   
     <span className={location.pathname === '/' ? 'text-nav-active' : 'links_name'}> Dashboard</span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/execution-planning" className={location.pathname === '/execution-planning' ? 'nav-active' : ''}>


 
        <div>
            <img src={location.pathname === '/execution-planning' ? ActivePlanningIcon : InactivePlanningIcon} alt="" />
        </div>
  
        <img className="icon" src={location.pathname === '/execution-planning' ? ActivePlanningIcon : InactivePlanningIcon} alt="" />
    
    <span className={location.pathname === '/execution-planning' ? 'text-nav-active' : 'links_name'}> Execution Planning</span>
</Link>
<span className="tooltip"></span>
</li>






<li>

<Link to="/presentation" className={location.pathname === '/presentation' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/presentation' ? ActivePresentationIcon : InactivePresentationIcon} alt="" />
        </div>

        <img className="icon" src={location.pathname === '/presentation' ? ActivePresentationIcon : InactivePresentationIcon} alt="" />
     <span className={location.pathname === '/presentation' ? 'text-nav-active' : ''}> Presentation</span>
</Link>
<span className="tooltip"></span>
</li>      







        </ul>
        <label htmlFor="menu-btn" className="btn menu-btn"><i class='bx bx-menu-alt-right'></i></label>

        <div className="logo">  <Link to="/" >
          <div className="logo-details text-center">

          <Link to="/" >
                        <div className={`logo-details text-center ${isOpen ? '' : 'logo-small'}`}>
                            <img src={isLightMode ? LogoLight : LogoDark} alt="Toggle Sidebar" />
                        </div>
                    </Link>
          </div>
        </Link></div>
        </div>
        <div className="">   
                 <div className={`toggle ${isLightMode ? 'day' : ''}`} onClick={toggleMode}>
                <div className={`toggle-btn ${isLightMode ? 'sun' : 'moon'}`}></div>
            </div>
            </div>
      </div>
    </nav>
    </header>



        </>
    );
};



export default Navbar;
