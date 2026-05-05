import React, { useContext, useState } from "react";

import { Link, useLocation } from 'react-router';

import ToggleIcon from "../img/toggle-icon.svg";


import ActiveDashboardIcon from "../img/active-dashboard-icon.svg";
import InactiveDashboardIcon from "../img/dashboard-icon.svg";

import ActiveDrawingIcon from "../img/active-drawing-icon.svg";
import InactiveDrawingIcon from "../img/drawing-icon.svg";


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

import ActiveListIcon from "../img/active-snag-list.svg";
import InactiveListIcon from "../img/snag-list.svg";

import ActiveDispatchIcon from "../img/active-dispatch-icon.svg";
import InactiveDispatchIcon from "../img/dispatch-icon.svg";

import ActivePaymentIcon from "../img/active-payment-icon.svg";
import InactivePaymentIcon from "../img/payment-icon.svg";

import ActiveInstallIcon from "../img/active-installation-icon.svg";
import InactiveInstallIcon from "../img/installation-icon.svg";

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

                        <Link to="/execution-planning" className={location.pathname === '/execution-planning' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/execution-planning' ? ActivePlanningIcon : InactivePlanningIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/execution-planning' ? ActivePlanningIcon : InactivePlanningIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Execution Planning</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>

                    <li>

                        <Link to="/basic-drawing" className={location.pathname === '/basic-drawing' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/basic-drawing' ? ActiveDrawingIcon : InactiveDrawingIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/basic-drawing' ? ActiveDrawingIcon : InactiveDrawingIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Basic Drawing</span>}
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
                    </li>       <li>

                        <Link to="/quotation" className={location.pathname === '/quotation' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/quotation' ? ActiveQuotationIcon : InactiveQuotationIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/quotation' ? ActiveQuotationIcon : InactiveQuotationIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Quotation</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/measurement" className={location.pathname === '/measurement' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/measurement' ? ActiveMeasurementIcon : InactiveMeasurementIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/measurement' ? ActiveMeasurementIcon : InactiveMeasurementIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Measurement</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>
                        <div onClick={toggleDrawingDropdown} className={`nav-item ${isDrawingOpen ? 'nav-active' : ''}`}>
                            <img src={isDrawingOpen ? ActiveDrawingIcon : InactiveDrawingIcon} alt="Drawing Icon" className="icon" />
                            <span className="links_name"> Drawing </span>
                            {/* <img src={isDrawingOpen ? ToggleIcon : ToggleIcon} alt="Toggle Dropdown" className="down-arrow" /> */}
                            <span className="tooltip"></span>
                        </div>
                        {isDrawingOpen && (
                            <ul className="dropdown">
                                <li>
                                    <Link to="/working-drawing" className={location.pathname === '/working-drawing' ? 'nav-active' : ''}>
                                        <span className="links_name"> Working Drawing </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shop-drawing" className={location.pathname === '/shop-drawing' ? 'nav-active' : ''}>
                                        <span className="links_name"> Shop Drawing </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/final-drawing" className={location.pathname === '/final-drawing' ? 'nav-active' : ''}>
                                        <span className="links_name"> Production Drawing </span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>

                        <Link to="/purchase" className={location.pathname === '/purchase' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/purchase' ? ActivePurchaseIcon : InactivePurchaseIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/purchase' ? ActivePurchaseIcon : InactivePurchaseIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Purchase</span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/material-received" className={location.pathname === '/material-received' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/material-received' ? ActiveMaterialIcon : InactiveMaterialIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/material-received' ? ActiveMaterialIcon : InactiveMaterialIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Material Received </span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/snag-list" className={location.pathname === '/snag-list' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/snag-list' ? ActiveListIcon : InactiveListIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/snag-list' ? ActiveListIcon : InactiveListIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Snag List </span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/dispatch" className={location.pathname === '/dispatch' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/dispatch' ? ActiveDispatchIcon : InactiveDispatchIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/dispatch' ? ActiveDispatchIcon : InactiveDispatchIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Dispatch </span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/payment" className={location.pathname === '/payment' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/payment' ? ActivePaymentIcon : InactivePaymentIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/payment' ? ActivePaymentIcon : InactivePaymentIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Payment </span>}
                        </Link>
                        <span className="tooltip"></span>
                    </li>
                    <li>

                        <Link to="/installation" className={location.pathname === '/installation' ? 'nav-active' : ''}>


                            {isOpen ? (
                                <div>
                                    <img src={location.pathname === '/installation' ? ActiveInstallIcon : InactiveInstallIcon} alt="" />
                                </div>
                            ) : (
                                <img className="icon" src={location.pathname === '/installation' ? ActiveInstallIcon : InactiveInstallIcon} alt="" />
                            )}
                            {isOpen && <span className="links_name"> Installation </span>}
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

<Link to="/basic-drawing" className={location.pathname === '/basic-drawing' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/basic-drawing' ? ActiveDrawingIcon : InactiveDrawingIcon} alt="" />
        </div>

        <img className="icon" src={location.pathname === '/basic-drawing' ? ActiveDrawingIcon : InactiveDrawingIcon} alt="" />
   
   <span className={location.pathname === '/basic-drawing' ? 'text-nav-active' : 'links_name'}> Basic Drawing</span>
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

 <li>

<Link to="/quotation" className={location.pathname === '/quotation' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/quotation' ? ActiveQuotationIcon : InactiveQuotationIcon} alt="" />
        </div>
    
        <img className="icon" src={location.pathname === '/quotation' ? ActiveQuotationIcon : InactiveQuotationIcon} alt="" />
    <span className={location.pathname === '/quotation' ? 'text-nav-active' : 'links_name'}> Quotation</span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/measurement" className={location.pathname === '/measurement' ? 'nav-active' : ''}>


  
        <div>
            <img src={location.pathname === '/measurement' ? ActiveMeasurementIcon : InactiveMeasurementIcon} alt="" />
        </div>
  
        <img className="icon" src={location.pathname === '/measurement' ? ActiveMeasurementIcon : InactiveMeasurementIcon} alt="" />
    <span className={location.pathname === '/measurement' ? 'text-nav-active' : 'links_name'}> Measurement</span>
</Link>
<span className="tooltip"></span>
</li>
<li>
<div onClick={toggleDrawingDropdown} className={`nav-item ${isDrawingOpen ? 'nav-active' : ''}`}>
    <img src={isDrawingOpen ? ActiveDrawingIcon : InactiveDrawingIcon} alt="Drawing Icon" className="icon" />
    <span className="links_name"> Drawing </span>
    {/* <img src={isDrawingOpen ? ToggleIcon : ToggleIcon} alt="Toggle Dropdown" className="down-arrow" /> */}
    <span className="tooltip"></span>
</div>
{isDrawingOpen && (
    <ul className="dropdown">
        <li>
            <Link to="/shop-drawing" className={location.pathname === '/shop-drawing' ? 'nav-active' : ''}>
                <span className="links_name"> Shop Drawing </span>
            </Link>
        </li>
        <li>
            <Link to="/final-drawing" className={location.pathname === '/final-drawing' ? 'nav-active' : ''}>
                <span className="links_name"> Production Drawing </span>
            </Link>
        </li>
    </ul>
)}
</li>
<li>

<Link to="/purchase" className={location.pathname === '/purchase' ? 'nav-active' : ''}>


   
        <div>
            <img src={location.pathname === '/purchase' ? ActivePurchaseIcon : InactivePurchaseIcon} alt="" />
        </div>
   
        <img className="icon" src={location.pathname === '/purchase' ? ActivePurchaseIcon : InactivePurchaseIcon} alt="" />
    
    <span className={location.pathname === '/purchase' ? 'text-nav-active' : 'links_name'}> Purchase</span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/material-received" className={location.pathname === '/material-received' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/material-received' ? ActiveMaterialIcon : InactiveMaterialIcon} alt="" />
        </div>
    
        <img className="icon" src={location.pathname === '/material-received' ? ActiveMaterialIcon : InactiveMaterialIcon} alt="" />
    
   <span className={location.pathname === '/material-received' ? 'text-nav-active' : 'links_name'}> Material Received </span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/snag-list" className={location.pathname === '/snag-list' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/snag-list' ? ActiveListIcon : InactiveListIcon} alt="" />
        </div>
    
        <img className="icon" src={location.pathname === '/snag-list' ? ActiveListIcon : InactiveListIcon} alt="" />
  <span className={location.pathname === '/snag-list' ? 'text-nav-active' : 'links_name'}> Snag List </span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/dispatch" className={location.pathname === '/dispatch' ? 'nav-active' : ''}>


   
        <div>
            <img src={location.pathname === '/dispatch' ? ActiveDispatchIcon : InactiveDispatchIcon} alt="" />
        </div>
   
        <img className="icon" src={location.pathname === '/dispatch' ? ActiveDispatchIcon : InactiveDispatchIcon} alt="" />
   <span className={location.pathname === '/dispatch' ? 'text-nav-active' : 'links_name'}> Dispatch </span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/payment" className={location.pathname === '/payment' ? 'nav-active' : ''}>


    
        <div>
            <img src={location.pathname === '/payment' ? ActivePaymentIcon : InactivePaymentIcon} alt="" />
        </div>

        <img className="icon" src={location.pathname === '/payment' ? ActivePaymentIcon : InactivePaymentIcon} alt="" />
    
    <span className={location.pathname === '/payment' ? 'text-nav-active' : 'links_name'}> Payment </span>
</Link>
<span className="tooltip"></span>
</li>
<li>

<Link to="/installation" className={location.pathname === '/installation' ? 'nav-active' : ''}>


   
        <div>
            <img src={location.pathname === '/installation' ? ActiveInstallIcon : InactiveInstallIcon} alt="" />
        </div>
   
        <img className="icon" src={location.pathname === '/installation' ? ActiveInstallIcon : InactiveInstallIcon} alt="" />
   
   <span className="links_name"> Installation </span>
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
