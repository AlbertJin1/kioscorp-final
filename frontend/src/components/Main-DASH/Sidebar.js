import React, { useEffect, useState } from 'react';
import { FaChevronLeft, FaWarehouse, FaChartBar, FaHome, FaHistory, FaCashRegister, FaSignOutAlt, FaBoxes, FaCubes } from 'react-icons/fa';
import logo from '../../img/logo/KIOSCORP LOGO.png';
import { useNavigate } from 'react-router-dom';
import '../Styles/SidebarMain.css';

const Sidebar = ({ setCurrentPage, currentPage, handleLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [indicatorPosition, setIndicatorPosition] = useState({ top: 0, height: 0 });
    const navigate = useNavigate();

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handlePageClick = (page, index) => {
        if (page === currentPage) {
            setCurrentPage('');
            setTimeout(() => {
                setCurrentPage(page);
            }, 0);
        } else {
            setCurrentPage(page);
        }
    };

    const handlePOSAccess = () => {
        navigate('/pos');
    };

    useEffect(() => {
        const activeElement = document.querySelector(`li[data-key="${currentPage}"]`);
        if (activeElement) {
            const { offsetTop, offsetHeight } = activeElement;
            const indicatorHeight = 40; // Height of the indicator
            const topPosition = offsetTop + (offsetHeight - indicatorHeight) / 2; // Centering the indicator
            setIndicatorPosition({ top: topPosition, height: indicatorHeight });
        }
    }, [currentPage]);

    return (
        <div className={`min-h-screen flex flex-col bg-[#033372] text-white transition-all duration-300 select-none ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between p-4">
                {!isCollapsed && <img src={logo} alt="Kioscorp Logo" className="h-14" draggable="false" />}
                <button onClick={toggleCollapse} className={`focus:outline-none flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
                    <FaChevronLeft className={`text-white text-2xl transition-transform duration-300 ${isCollapsed ? 'transform rotate-180' : ''}`} />
                </button>
            </div>
            <ul className="flex-grow relative">
                {[
                    { icon: <FaCubes className="text-white" size={30} />, label: 'Menu', page: 'menu' },
                    { icon: <FaHome className="text-white" size={30} />, label: 'Dashboard', page: 'dashboard' },
                    { icon: <FaBoxes className="text-white" size={30} />, label: 'Inventory', page: 'inventory' },
                    { icon: <FaChartBar className="text-white" size={30} />, label: 'Sales', page: 'sales-management' },
                    { icon: <FaHistory className="text-white" size={30} />, label: 'Order History', page: 'order-history' },
                    { icon: <FaWarehouse className="text-white" size={30} />, label: 'Products', page: 'product' },
                ].map((item, index) => (
                    <li
                        key={index}
                        data-key={item.page} // Add data attribute to identify the active tab
                        className={`flex items-center px-4 py-6 cursor-pointer relative transition duration-300 ${currentPage === item.page ? 'bg-[#022a5e]' : 'hover:bg-[#022a5e]'}`}
                        onClick={() => handlePageClick(item.page, index)}
                    >
                        <div className="flex justify-center items-center">
                            {item.icon}
                        </div>
                        {!isCollapsed && <span className="ml-2 text-lg font-semibold overflow-hidden">{item.label}</span>}
                    </li>
                ))}
                {/* Indicator */}
                <div
                    className="absolute right-0 h-full w-2 bg-white transition-all duration- 300 rounded-tl rounded-bl"
                    style={{
                        top: indicatorPosition.top,
                        height: indicatorPosition.height,
                    }}
                />
            </ul>

            {/* POS Button */}
            <button
                onClick={handlePOSAccess}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} m-4 rounded p-2  bg-white text-black hover:bg-blue-200 transition duration-200 font-semibold text-xl`}
            >
                <FaCashRegister size={30} className={`${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span>POS</span>}
            </button>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} mx-4 mb-4 rounded p-2  bg-white text-black hover:bg-blue-200 transition duration-200 font-semibold text-xl`}
            >
                <FaSignOutAlt size={30} className={`${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span>Logout</span>}
            </button>
        </div>
    );
};

export default Sidebar;