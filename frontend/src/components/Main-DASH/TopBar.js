import React, { useEffect, useState } from 'react';
import logo from '../../img/logo/dashboard.png'; // Adjust the path as needed
import { FaFileExport } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const TopBar = ({ currentPage, loggedInUser }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [availableYears, setAvailableYears] = useState([]);

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

    useEffect(() => {
        // Generate a list of available years (e.g., from 2020 to the current year)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 2020; year--) {
            years.push(year);
        }
        setAvailableYears(years);
    }, []);

    let title = '';
    switch (currentPage) {
        case 'menu':
            title = 'Menu';
            break;
        case 'dashboard':
            title = 'Dashboard';
            break;
        case 'inventory':
            title = 'Inventory';
            break;
        case 'sales-management':
            title = 'Sales';
            break;
        case 'order-history':
            title = 'Order History';
            break;
        case 'product':
            title = 'Products';
            break;
        default:
            title = 'Dashboard';
    }

    const handleExportSales = async () => {
        const { value: year } = await Swal.fire({
            title: 'Select Year to Export Sales Data',
            input: 'select',
            inputOptions: availableYears.reduce((options, year) => {
                options[year] = year;
                return options;
            }, {}),
            inputPlaceholder: 'Select a year',
            showCancelButton: true,
            confirmButtonText: 'Export',
            cancelButtonText: 'Cancel',
            inputValue: new Date().getFullYear(), // Default to current year
        });

        if (year) {
            // Fetch sales data from the backend with token
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            const response = await fetch(`http://localhost:8000/api/sales/data/whole/?year=${year}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Add the token to the headers
                    'Content-Type': 'application/json',
                },
            });
            const salesData = await response.json();

            // Create an Excel workbook
            const workbook = new ExcelJS.Workbook();

            // Month names mapping
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            // 1st Sheet: Total Sales by Month
            const totalSalesSheet = workbook.addWorksheet('Total Sales by Month');
            totalSalesSheet.addRow(['Month', 'Total Sales']);
            salesData.monthlySales.forEach((monthData, index) => {
                const monthName = monthNames[monthData.month - 1]; // Get month name
                const row = totalSalesSheet.addRow([monthName, monthData.total]);
                // Apply alternate row color
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' },
                };
                // Center the month column and right-align the total sales column
                totalSalesSheet.getCell(`A${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                totalSalesSheet.getCell(`B${index + 2}`).alignment = { vertical: 'middle', horizontal: 'right' };
                // Set font size for data rows
                row.font = { size: 14 };
            });

            // Style the header
            totalSalesSheet.getRow(1).font = { bold: true, size: 16 };
            totalSalesSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF00' },
            };

            // Adjust column widths
            totalSalesSheet.getColumn(1).width = 25; // Month
            totalSalesSheet.getColumn(2).width = 20; // Total Sales

            // 2nd Sheet: Daily Sales
            const dailySalesSheet = workbook.addWorksheet('Daily Sales');
            dailySalesSheet.addRow(['Date', 'Total Sales']);
            salesData.dailySales.forEach((day, index) => {
                const formattedDate = new Date(day.date).toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
                const row = dailySalesSheet.addRow([formattedDate, day.total]);
                // Apply alternate row color
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' },
                };
                // Center the date column and right-align the total sales column
                dailySalesSheet.getCell(`A${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                dailySalesSheet.getCell(`B${index + 2}`).alignment = { vertical: 'middle', horizontal: 'right' };
                // Set font size for data rows
                row.font = { size: 14 };
            });

            // Style the header
            dailySalesSheet.getRow(1).font = { bold: true, size: 16 };
            dailySalesSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF00' },
            };

            // Adjust column widths
            dailySalesSheet.getColumn(1).width = 25; // Date
            dailySalesSheet.getColumn(2).width = 20; // Total Sales

            // 3rd Sheet: Paid Orders
            const paidOrdersSheet = workbook.addWorksheet('Paid Orders');
            paidOrdersSheet.addRow(['Order ID', 'Amount', 'Product Name', 'Product Type', 'Color', 'Size']);
            salesData.paidOrders.forEach((order, index) => {
                const orderIdStr = String(order.order_id); // Convert order_id to string
                if (orderIdStr.startsWith(year)) { // Only include orders from the selected year
                    const row = paidOrdersSheet.addRow([orderIdStr, order.amount, order.product_name, order.product_type, order.color, order.size]);
                    // Apply alternate row color
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' },
                    };
                    // Center the Order ID column and right-align the Amount column
                    paidOrdersSheet.getCell(`A${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                    paidOrdersSheet.getCell(`B${index + 2}`).alignment = { vertical: 'middle', horizontal: 'right' };
                    // Set font size for data rows
                    row.font = { size: 14 };
                }
            });

            // Style the header
            paidOrdersSheet.getRow(1).font = { bold: true, size: 16 };
            paidOrdersSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF00' },
            };

            // Adjust column widths
            paidOrdersSheet.getColumn(1).width = 20; // Order ID
            paidOrdersSheet.getColumn(2).width = 20; // Amount
            paidOrdersSheet.getColumn(3).width = 65; // Product Name
            paidOrdersSheet.getColumn(4).width = 25; // Product Type
            paidOrdersSheet.getColumn(5).width = 25; // Color
            paidOrdersSheet.getColumn(6).width = 25; // Size

            // 4th Sheet: Products Sold
            const productsSoldSheet = workbook.addWorksheet('Products Sold');
            productsSoldSheet.addRow(['Product Name', 'Product Type', 'Color', 'Size', 'Total Sold']);
            salesData.productsSold.forEach((product, index) => {
                if (product.totalSold > 0) { // Only include products that were sold
                    const row = productsSoldSheet.addRow([product.name, product.product_type, product.color, product.size, product.totalSold]);
                    // Apply alternate row color
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' },
                    };
                    // Align Product Name, Product Type, Color, Size to the left and Total Sold to the right
                    productsSoldSheet.getCell(`A${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                    productsSoldSheet.getCell(`B${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                    productsSoldSheet.getCell(`C${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                    productsSoldSheet.getCell(`D${index + 2}`).alignment = { vertical: 'middle', horizontal: 'left' };
                    productsSoldSheet.getCell(`E${index + 2}`).alignment = { vertical: 'middle', horizontal: 'right' };
                    // Set font size for data rows
                    row.font = { size: 14 };
                }
            });

            // Style the header
            productsSoldSheet.getRow(1).font = { bold: true, size: 16 };
            productsSoldSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF00' },
            };

            // Adjust column widths
            productsSoldSheet.getColumn(1).width = 65; // Product Name
            productsSoldSheet.getColumn(2).width = 25; // Product Type
            productsSoldSheet.getColumn(3).width = 25; // Color
            productsSoldSheet.getColumn(4).width = 25; // Size
            productsSoldSheet.getColumn(5).width = 20; // Total Sold

            // Save the workbook as a .xlsx file using saveAs
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `sales_data_${year}.xlsx`);
        }
    };

    return (
        <div className="bg-white shadow pt-2 pb-2 pl-4 pr-4 items-center">
            <div className="flex items-start w-full justify-between">
                <div className="flex items-start">
                    <img src={logo} alt="Dashboard Icon" className="h-16 mr-4" />
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">Welcome, {loggedInUser.firstName} {loggedInUser.lastName}</h1>
                        <h2 className="text-lg">Inventory Management System</h2>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <h2 className="text-xl text-[#033372] font-bold">Universal Auto Supply <span className='text-[#FFBD59]'>and</span> Bolt Center</h2>
                    <h3 className="text-lg font-bold pl-4 pr-4 pt-1 pb-1 rounded-2xl" style={{ backgroundColor: '#033372', color: 'white' }}>
                        {currentDate} | {currentTime}
                    </h3>
                </div>
            </div>

            <div className="flex w-full justify-between items-center mt-2">
                <div className="pl-2 pr-2 pt-1 pb-1 rounded" style={{ backgroundColor: '#033372' }}>
                    <h1 className="font-bold text-[#FFBD59] text-2xl">{title}</h1>
                </div>
                {currentPage === 'sales-management' && (
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white rounded px-4 py-2 ml-4 transition duration-200 flex items-center font-bold"
                        onClick={handleExportSales}
                    >
                        <FaFileExport className="mr-2" size={23} /> {/* Add the icon with some margin */}
                        Export Sales
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopBar;