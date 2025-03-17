import React from 'react';
import Overview from './Overview';
import FeedbackChart from './FeedbackChart'; // Import the new FeedbackChart component
import CustomerCountChart from './CustomerCountChart';
import TopSellingProducts from './TopSellingProducts';
import InventoryLevel from './InventoryLevel';

const Dashboard = () => {
    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                <div className="md:col-span-1 h-full">
                    <div className="h-full flex flex-col">
                        <Overview />
                    </div>
                </div>

                <div className="md:col-span-1 h-full">
                    <div className="h-full flex flex-col">
                        <InventoryLevel />
                    </div>
                </div>

                <div className="md:col-span-1 h-full">
                    <div className="h-full flex flex-col">
                        <TopSellingProducts />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                <div className="md:col-span-2 h-full">

                    <div className="h-full flex flex-col">
                        <CustomerCountChart />
                    </div>
                </div>
                <div className="md:col-span-1 h-full">

                    <div className="h-full flex flex-col">
                        <FeedbackChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;