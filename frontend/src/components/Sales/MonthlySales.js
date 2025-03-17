import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { FaChartBar } from 'react-icons/fa';
import Loader from '../Loader/Loader';
import Swal from 'sweetalert2'; // Import SweetAlert2
import ProductModal from './ProductModal'; // Import the modal component
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the required elements
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const MonthlySales = () => {
    const [salesData, setSalesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonthRange, setSelectedMonthRange] = useState([1, new Date().getMonth() + 1]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [viewType, setViewType] = useState('month'); // 'month' or 'day'
    const [selectedMonth, setSelectedMonth] = useState(''); // Add this line

    useEffect(() => {
        // Set default dates for the past 60 days when switching to day view
        if (viewType === 'day') {
            const today = new Date();
            const past60Days = new Date(today);
            past60Days.setDate(today.getDate() - 60);
            setStartDate(past60Days.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        }

        // Update selectedMonthRange when selectedYear changes
        if (viewType === 'month') {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            if (selectedYear < currentYear) {
                setSelectedMonthRange([1, 12]);
            } else {
                setSelectedMonthRange([1, currentMonth]);
            }
        }
    }, [viewType, selectedYear]);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const token = localStorage.getItem('token');
                let response;

                if (viewType === 'month') {
                    response = await axios.get('http://localhost:8000/api/sales/monthly/', {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                        params: {
                            year: selectedYear,
                            month_start: selectedMonthRange[0],
                            month_end: selectedMonthRange[1],
                        },
                    });
                } else {
                    // Validate date range
                    if (!startDate || !endDate) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Invalid Date Range',
                            text: 'Please select both start and end dates.',
                        });
                        return;
                    }

                    // Allow startDate to be greater than endDate for day view
                    if (new Date(startDate) > new Date(endDate)) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Invalid Date Range',
                            text: 'Start date cannot be after end date.',
                        });
                        return;
                    }

                    response = await axios.get('http://localhost:8000/api/sales/daily/', {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                        params: {
                            start_date: startDate,
                            end_date: endDate,
                        },
                    });
                }

                setSalesData(response.data);
            } catch (error) {
                console.error('Error fetching sales data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not fetch sales data.',
                });
            } finally {
                setLoading(false);
            }
        };

        // Only fetch data if the view type is set and dates are valid
        if (viewType === 'month' || (viewType === 'day' && startDate && endDate)) {
            fetchSalesData();
        }
    }, [selectedYear, selectedMonthRange, viewType, startDate, endDate]); // Fetch data when year, month range, view type, or date range changes

    // Prepare data for the chart
    let labels, salesValues;

    if (viewType === 'month') {
        const monthsToShow = Array.from({ length: selectedMonthRange[1] - selectedMonthRange[0] + 1 }, (_, i) => selectedMonthRange[0] + i);
        labels = monthsToShow.map(month => new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' }));
        salesValues = monthsToShow.map(month => salesData[month] || 0);
    } else {
        // Assuming salesData is structured with dates as keys
        labels = Object.keys(salesData).map(date => new Date(date).toLocaleDateString());
        salesValues = Object.values(salesData);
    }

    const data = {
        labels,
        datasets: [
            {
                label: viewType === 'month' ? 'Monthly Sales' : 'Daily Sales',
                data: salesValues,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.1,
            },
        ],
    };

    // Generate year options (e.g., from 2020 to the current year)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

    // Handle month range change
    const handleMonthRangeChange = (startMonth, endMonth) => {
        if (startMonth > endMonth) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Month Range',
                text: 'Start month cannot be greater than end month.',
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            setSelectedMonthRange([startMonth, endMonth]);
        }
    };

    // Handle date change for day view
    const handleDateChange = (start, end) => {
        if (new Date(start) > new Date(end)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date Range',
                text: 'Start date cannot be after end date.',
                showConfirmButton: false, // No confirm button
                timer: 1500, // Timeout of 1.5 seconds
                position: 'top-end', // Position at the top-end
                toast: true, // Make it a toast notification
            });
        } else {
            setStartDate(start);
            setEndDate(end);
        }
    };

    const handleMonthClick = async (month) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/monthly-products-sold/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
                params: {
                    year: selectedYear,
                    month: month, // Pass the month number
                },
            });
            setProducts(response.data);

            // Get the month name
            const monthName = new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' });

            // Pass the month name to the modal
            setModalIsOpen(true);
            setSelectedMonth(monthName); // Store the selected month name
        } catch (error) {
            console.error('Error fetching product data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not fetch product data.',
            });
        }
    };

    const handleDayClick = (date) => {
        // Show feature unavailable alert
        Swal.fire({
            icon: 'info',
            title: 'Feature Not Available',
            text: 'The daily view feature is not yet available at this time.',
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            toast: true,
        });
    };



    return (
        <div className="bg-white shadow-md p-4 rounded-lg flex-grow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                    <FaChartBar className="mr-2 text-blue-500 text-3xl" />
                    Monthly Sales Overview
                </h2>
                <div className="flex items-center space-x-4">

                    {/* Year Selector - Only show if viewType is 'month' */}
                    {viewType === 'month' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border rounded-md p-1"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}

                    {/* Date Pickers for Day View */}
                    {viewType === 'day' ? (
                        <>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleDateChange(e.target.value, endDate)}
                                className="border rounded-md p-1"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleDateChange(startDate, e.target.value)}
                                className="border rounded-md p-1"
                            />
                        </>
                    ) : (
                        <>
                            {/* Start Month Selector */}
                            <select
                                value={selectedMonthRange[0]}
                                onChange={(e) => handleMonthRangeChange(Number(e.target.value), selectedMonthRange[1])}
                                className="border rounded-md p-1"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>

                            {/* End Month Selector */}
                            <select
                                value={selectedMonthRange[1]}
                                onChange={(e) => handleMonthRangeChange(selectedMonthRange[0], Number(e.target.value))}
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
            </div >
            {
                loading ? (
                    <Loader />
                ) : (
                    <div className="w-full flex-grow h-72">
                        <Line
                            data={data}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                onClick: (event, elements) => {
                                    if (elements.length > 0) {
                                        const index = elements[0].index;
                                        if (viewType === 'month') {
                                            const month = selectedMonthRange[0] + index; // Get the month
                                            handleMonthClick(month); // Fetch products for the selected month
                                        } else {
                                            const selectedDate = labels[index]; // Get the selected date
                                            handleDayClick(selectedDate); // Fetch products for the selected day
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            <ProductModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                products={products}
                selectedMonth={selectedMonth} // Pass the selected month name
            />
        </div >
    );
};

export default MonthlySales;