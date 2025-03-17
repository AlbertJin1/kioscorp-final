import React, { useState, useEffect } from 'react';
import MyProfile from './MyProfile';
import UserManagement from './UserManagement';
import Logs from './Logs';
import ChangePassword from './ChangePassword';
import ClearSalesData from './ClearSalesData';
import VATSetting from './VATSetting';
import About from './About';
import CashierTransactions from './CashierTransactions'; // Import the new component

const Menu = ({ setIsAuthenticated, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex h-full overflow-hidden p-4">
            <div className="w-1/3 mr-4 bg-blue-900 text-white h-full flex flex-col rounded shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Menu</h2>
                    <ul className="space-y-4 transition">
                        <li>
                            <button
                                onClick={() => handleTabChange('profile')}
                                className={`w-full text-left p-2 rounded-md ${activeTab === 'profile' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                            >
                                My Profile
                            </button>
                        </li>
                        {(userRole === 'owner' || userRole === 'admin') && (
                            <li>
                                <button
                                    onClick={() => handleTabChange('management')}
                                    className={`w-full text-left p-2 rounded-md ${activeTab === 'management' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                                >
                                    User Management
                                </button>
                            </li>
                        )}
                        {(userRole === 'owner' || userRole === 'admin') && (
                            <li>
                                <button
                                    onClick={() => handleTabChange('logs')}
                                    className={`w-full text-left p-2 rounded-md ${activeTab === 'logs' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                                >
                                    Logs
                                </button>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={() => handleTabChange('changePassword')}
                                className={`w-full text-left p-2 rounded-md ${activeTab === 'changePassword' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                            >
                                Change Password
                            </button>
                        </li>
                        {(userRole === 'owner' || userRole === 'admin') && (
                            <li>
                                <button
                                    onClick={() => handleTabChange('cashierTransactions')}
                                    className={`w-full text-left p-2 rounded-md ${activeTab === 'cashierTransactions' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                                >
                                    Cashier Transactions
                                </button>
                            </li>
                        )}
                        {userRole === 'owner' && (
                            <li>
                                <button
                                    onClick={() => handleTabChange('clearSalesData')}
                                    className={`w-full text-left p-2 rounded-md ${activeTab === 'clearSalesData' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                                >
                                    Clear Sales Data
                                </button>
                            </li>
                        )}
                        {(userRole === 'owner' || userRole === 'admin') && (
                            <li>
                                <button
                                    onClick={() => handleTabChange('vatSetting')}
                                    className={`w-full text-left p-2 rounded-md ${activeTab === 'vatSetting' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                                >
                                    VAT Setting
                                </button>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={() => handleTabChange('about')}
                                className={`w-full text-left p-2 rounded-md ${activeTab === 'about' ? 'bg-blue-700 transition duration-200' : 'hover:bg-blue-800 transition duration-200'}`}
                            >
                                About
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-full h-full flex flex-col overflow-y-auto">
                <>
                    {activeTab === 'profile' && <MyProfile setIsAuthenticated={setIsAuthenticated} handleLogout={handleLogout} />}
                    {(activeTab === 'management' && (userRole === 'owner' || userRole === 'admin')) && <UserManagement />}
                    {(activeTab === 'logs' && (userRole === 'owner' || userRole === 'admin')) && <Logs />}
                    {activeTab === 'changePassword' && <ChangePassword />}
                    {activeTab === 'cashierTransactions' && <CashierTransactions />} {/* Render Cashier Transactions component */}
                    {activeTab === 'clearSalesData' && userRole === 'owner' && <ClearSalesData handleLogout={handleLogout} />}
                    {activeTab === 'vatSetting' && userRole === 'owner' && <VATSetting userRole={userRole} />}
                    {activeTab === 'about' && <About />}
                </>
            </div>
        </div>
    );
};

export default Menu;