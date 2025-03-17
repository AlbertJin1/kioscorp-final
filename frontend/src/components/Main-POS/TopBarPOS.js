import React, { useEffect, useState } from 'react';
import logo from '../../img/logo/point-of-sale.png'; // Adjust the path as needed

const TopBarPOS = ({ loggedInUser, pendingOrderCount, handleLogout }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            setCurrentTime(time);
            setCurrentDate(date);
        };
        updateTime();
        const intervalId = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="bg-white shadow pt-2 pb-2 pl-4 pr-4 items-center">
            <div className="flex items-start w-full justify-between">
                <div className="flex items-start">
                    <img src={logo} alt="Dashboard Icon" className="h-16 mr-4" />
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">Welcome, {loggedInUser.firstName} {loggedInUser.lastName}</h1>
                        <h2 className="text-lg">Point of Sale System</h2>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <h2 className="text-xl text-[#033372] font-bold">Universal Auto Supply <span className='text-[#FFBD59]'>and</span> Bolt Center</h2>
                    <h3 className="text-lg font-bold pl-4 pr-4 pt-1 pb-1 rounded-2xl" style={{ backgroundColor: '#033372', color: 'white' }}>
                        {currentDate} | {currentTime}
                    </h3>
                </div>
            </div>

            <div className="flex w-full justify-center items-center mt-2">

                {/* Current Orders Counter */}
                <div className={`pl-2 pr-2 pt-1 pb-1 rounded-full ${loggedInUser.role === 'admin' || loggedInUser.role === 'owner' ? 'ml-4' : 'mx-auto'}`} style={{ backgroundColor: '#033372' }}>
                    <h1 className="font-bold text-[#FFBD59] text-2xl">Current Orders: {pendingOrderCount}</h1>
                </div>
            </div>
        </div>
    );
};

export default TopBarPOS; // Ensure default export