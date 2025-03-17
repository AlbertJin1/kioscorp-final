import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaUsers } from 'react-icons/fa';
import Loader from '../Loader/Loader';
import axios from 'axios';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the required elements
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const CustomerCountChart = () => {
    const [loading, setLoading] = useState(false); // Start with loading as false
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewType, setViewType] = useState('month');
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true when fetching data
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/customers/counts/${viewType}/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                    params: {
                        start_date: viewType === 'day' ? `${selectedYear}-${selectedMonth}-01` : '',
                        end_date: viewType === 'day' ? `${selectedYear}-${selectedMonth}-${new Date(selectedYear, selectedMonth, 0).getDate()}` : '',
                        year: selectedYear, // Pass selected year as a query parameter
                    },
                });
                const data = response.data;

                const labels = viewType === 'month'
                    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    : Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, i) => i + 1);

                const customerCounts = data.length > 0 ? data : Array(labels.length).fill(0);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: viewType === 'month' ? 'Paid Order Count (Monthly)' : 'Paid Order Count (Daily)',
                            data: customerCounts,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };

        fetchData();
    }, [viewType, selectedYear, selectedMonth]);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="bg-white shadow-md p-4 rounded-lg flex-grow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                    <FaUsers className="mr-2 text-blue-500 text-3xl" />
                    Paid Orders
                </h2>
                <div className="flex items-center space-x-4">

                    {viewType === 'month' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(Number(e.target.value));
                                setLoading(false); // Prevent loader when changing year
                            }}
                            className="border rounded-md p-1"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}

                    {viewType === 'day' && (
                        <>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(Number(e.target.value));
                                    setLoading(false); // Prevent loader when changing year
                                }}
                                className="border rounded-md p-1"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(Number(e.target.value));
                                    setLoading(false); // Prevent loader when changing month
                                }}
                                className="border rounded-md p-1"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </>
                    )}

                    <div className="flex items-center py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 select-none">
                        <span
                            className="mr-2 text-sm cursor-pointer font-semibold"
                            onClick={() => {
                                setViewType(viewType === 'day' ? 'month' : 'day');
                                if (viewType === 'day') {
                                    setSelectedMonth(new Date().getMonth() + 1); // Reset to current month when switching to day view
                                }
                                setLoading(false); // Prevent loader when switching view
                            }}
                        >
                            {viewType === 'day' ? 'View by Day' : 'View by Month'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={viewType === 'day'}
                                onChange={() => {
                                    setViewType(viewType === 'day' ? 'month' : 'day');
                                    if (viewType === 'day') {
                                        setSelectedMonth(new Date().getMonth() + 1); // Reset to current month when switching to day view
                                    }
                                    setLoading(false); // Prevent loader when switching view
                                }}
                            />
                            <div
                                className={`w-16 h-8 rounded-full shadow-inner transition-colors duration-200 ease-in-out ${viewType === 'day' ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}
                            ></div>
                            <div
                                className={`absolute w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ease-in-out flex items-center justify-center ${viewType === 'day' ? 'translate-x-9' : 'translate-x-1'
                                    }`}
                            >
                                <span
                                    className={`text-sm font-bold text-gray-800 transition-opacity duration-200 ${viewType === 'day' ? 'opacity-0' : 'opacity-100'
                                        }`}
                                >
                                    M
                                </span>
                                <span
                                    className={`text-sm font-bold text-gray-800 absolute transition-opacity duration-200 ${viewType === 'day' ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    D
                                </span>
                            </div>
                        </label>
                    </div>

                </div>
            </div>
            {
                loading ? (
                    <Loader />
                ) : (
                    <div className="w-full flex-grow h-72">
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                            }}
                        />
                    </div>
                )
            }
        </div>
    );
};

export default CustomerCountChart;