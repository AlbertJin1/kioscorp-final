import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarAlt, FaMoneyBillWave, FaClipboardCheck, FaClipboardList, FaBan } from 'react-icons/fa';
import Loader from '../Loader/Loader';
import axios from 'axios';

const Overview = () => {
    const [loading, setLoading] = useState(true);
    const [annualSales, setAnnualSales] = useState(0);
    const [dailySales, setDailySales] = useState(0);
    const [totalPaidOrders, setTotalPaidOrders] = useState(0);
    const [totalPendingOrders, setTotalPendingOrders] = useState(0);
    const [totalVoidOrders, setTotalVoidOrders] = useState(0);

    const [animatedAnnualSales, setAnimatedAnnualSales] = useState(0);
    const [animatedDailySales, setAnimatedDailySales] = useState(0);
    const [animatedTotalPaidOrders, setAnimatedTotalPaidOrders] = useState(0);
    const [animatedTotalPendingOrders, setAnimatedTotalPendingOrders] = useState(0);
    const [animatedTotalVoidOrders, setAnimatedTotalVoidOrders] = useState(0);

    const fetchOrderCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/orders/counts/', {
                headers: { Authorization: `Token ${token}` }
            });
            setTotalPaidOrders(response.data.totalPaidOrders);
            setTotalPendingOrders(response.data.totalPendingOrders);
            setTotalVoidOrders(response.data.totalVoidOrders);
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    };

    const fetchSalesData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/sales/data/', {
                headers: { Authorization: `Token ${localStorage.getItem('token')}` }
            });
            setAnnualSales(response.data.annual_sales);
            setDailySales(response.data.daily_sales);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    const formatAmount = (amount) => {
        if (amount === 0) return "₱0";
        const parts = amount.toString().split(".");
        const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `₱${formattedInteger}${parts.length > 1 ? "." + parts[1] : ""}`;
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchSalesData();
            await fetchOrderCounts();
            setLoading(false);  // Set loading to false after fetching data
        };
        loadData();

        const interval = setInterval(() => {
            fetchSalesData();
            fetchOrderCounts();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setAnimatedAnnualSales(annualSales);
        setAnimatedDailySales(dailySales);
        setAnimatedTotalPaidOrders(totalPaidOrders);
        setAnimatedTotalPendingOrders(totalPendingOrders);
        setAnimatedTotalVoidOrders(totalVoidOrders);
    }, [annualSales, dailySales, totalPaidOrders, totalPendingOrders, totalVoidOrders]);

    return (
        <div className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-2 h-full">
            <h2 className="text-2xl font-semibold flex items-center mb-2">
                <FaChartLine className="text-3xl mr-2 text-blue-500" />
                Overview
            </h2>
            {!loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-grow">
                    <div className="col-span-2 p-2 border rounded bg-gray-50 flex flex-col items-center h-full">
                        <h3 className="flex items-center text-lg mb-1">
                            <FaCalendarAlt className="text-green-500 mr-1" />
                            Annual Sales
                        </h3>
                        <p className="text-2xl transition-transform duration-500">{formatAmount(animatedAnnualSales)}</p>
                    </div>
                    {[{
                        title: 'Paid',
                        icon: <FaClipboardCheck className="text-green-500" />,
                        value: animatedTotalPaidOrders
                    }, {
                        title: 'Daily Sales',
                        icon: <FaMoneyBillWave className="text-orange-500" />,
                        value: formatAmount(animatedDailySales)
                    }, {
                        title: 'Pending',
                        icon: <FaClipboardList className="text-orange-500" />,
                        value: animatedTotalPendingOrders
                    }, {
                        title: 'Void',
                        icon: <FaBan className="text-red-500" />,
                        value: animatedTotalVoidOrders
                    }].map(({ title, icon, value }) => (
                        <div key={title} className="p-2 border rounded bg-gray-50 flex flex-col items-center h-full">
                            <h3 className="flex items-center text-lg mb-1">
                                {icon}
                                <span className="ml-1">{title}</span>
                            </h3>
                            <p className="text-2xl transition-transform duration-500">{value}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <Loader />
            )}
        </div>
    );
};

export default Overview;