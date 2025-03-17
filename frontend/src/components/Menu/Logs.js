import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import { FaDownload, FaTrash } from 'react-icons/fa';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Loader from '../Loader/Loader'; // Import the Loader component

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/logs/');
                const data = response.data;
                setLogs(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false); // Ensure loading is set to false after the request completes
            }
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);
    }, []);

    const handleClearLogs = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                // Prompt for passkey confirmation
                Swal.fire({
                    title: 'Enter Passkey',
                    input: 'password',
                    inputPlaceholder: 'Enter passkey to confirm',
                    inputAttributes: {
                        autocapitalize: 'off',
                        autocorrect: 'off',
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                }).then((passkeyResult) => {
                    // Validate passkey
                    if (passkeyResult.isConfirmed && passkeyResult.value === 'WJnJ,`482g<UL\\1Vc>C%') {
                        // Passkey is correct, proceed with deletion
                        axios.delete('http://localhost:8000/logs/')
                            .then(() => {
                                setLogs([]);
                                Swal.fire('Deleted!', 'Logs have been deleted.', 'success');
                            })
                            .catch((error) => {
                                setError(error.message);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Could not delete logs.',
                                });
                            });
                    } else if (passkeyResult.isConfirmed) {
                        // Invalid passkey
                        Swal.fire({
                            icon: 'error',
                            title: 'Incorrect Passkey',
                            text: 'The passkey you entered is incorrect.',
                        });
                    }
                });
            }
        });
    };


    const handleExportLogs = () => {
        const data = logs.map((log) => ({
            username: log.username,
            action: log.action,
            timestamp: moment(log.timestamp).format('MMMM D, YYYY h:mm:ss A'),
        }));

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Logs');

        // Define the columns
        worksheet.columns = [
            { header: 'Username', key: 'username', width: 25 },
            { header: 'Action', key: 'action', width: 35 },
            { header: 'Timestamp', key: 'timestamp', width: 45 },
        ];

        // Add the data
        data.forEach(log => worksheet.addRow(log)); // Add rows properly

        // Apply styles to the header and increase its height
        worksheet.getRow(1).height = 30;  // Set header row height to 25 (adjust as needed)
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF0' },  // Light fill color
            };
        });

        // Apply styles to data rows
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: ' thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            // Alternate row color
            if (rowNumber % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEEEEEE' }, // Light grey for even rows
                    };
                });
            }
        });

        // Save the workbook to file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'logs.xlsx');
        });
    };

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const filteredLogs = logs.filter((log) => {
        const logTimestamp = moment(log.timestamp).format('MMMM D, YYYY h:mm:ss A'); // Format timestamp for searching
        const lowerCaseQuery = searchQuery.toLowerCase(); // Store lowercased search query for efficiency

        if (filterBy === 'all') {
            return (
                log.username.toLowerCase().includes(lowerCaseQuery) ||
                log.action.toLowerCase().includes(lowerCaseQuery) ||
                logTimestamp.includes(lowerCaseQuery) // Check if the timestamp contains the search query
            );
        } else if (filterBy === 'username') {
            return log.username.toLowerCase().includes(lowerCaseQuery);
        } else if (filterBy === 'action') {
            return log.action.toLowerCase().includes(lowerCaseQuery);
        } else {
            return false;
        }
    }).filter((log) => {
        if (dateFrom && dateTo) {
            const logDate = moment(log.timestamp).format('YYYY-MM-DD');
            return moment(logDate).isBetween(dateFrom, dateTo, undefined, '[]');
        } else if (dateFrom) {
            const logDate = moment(log.timestamp).format('YYYY-MM-DD');
            return moment(logDate).isSameOrAfter(dateFrom);
        } else if (dateTo) {
            const logDate = moment(log.timestamp).format('YYYY-MM-DD');
            return moment(logDate).isSameOrBefore(dateTo);
        } else {
            return true;
        }
    });
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    return (
        <div className="p-4 flex flex-col h-full bg-white rounded">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Audit Logs</h2>
                <div className="flex justify-between">
                    <button
                        className="bg-green-500 hover:bg-green-700 transition-colors duration-300 text-white font-bold p-2 rounded flex justify-center items-center"
                        title="Export Logs"
                        onClick={handleExportLogs}
                    >
                        <FaDownload className="mr-2" size={25} />
                        Export
                    </button>
                    {userRole !== 'admin' && (
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded flex justify-center items-center ml-4"
                            title="Clear Logs"
                            onClick={handleClearLogs}
                        >
                            <FaTrash className="mr-2" size={25} />
                            Delete
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap mb-4 text-lg">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full py-2 pl-3 text-gray-700 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                    />
                </div>
                <div className="w-full md:w-1/6 mb-2 md:mb-0 md:ml-4">
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="w-full py-2 pl-3 text-gray-700 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                    >
                        <option value="all">All</option>
                        <option value="username">Username</option>
                        <option value="action">Action</option>
                    </select>
                </div>
                < div className="w-full md:w-1/3 mb-2 md:mb-0 md:ml-4">
                    <div className="flex justify-between">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-1/2 py-2 pl-3 text-gray-700 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 mr-2"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-1/2 py-2 pl-3 text-gray-700 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-auto flex-grow custom-scrollbar">
                <table className="min-w-full text-black">
                    <thead className="bg-[#022a5e] text-white text-lg sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 w-1/5">Username</th>
                            <th className="px-4 py-2 w-1/3">Action</th>
                            <th className="px-4 py-2 w-1/3">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    <Loader /> {/* Display the Loader component */}
                                </td>
                            </tr>
                        ) : currentLogs.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    <p className="text-lg text-gray-600">No logs available.</p>
                                </td>
                            </tr>
                        ) : (
                            currentLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                        {moment(log.timestamp).format('MMMM D, YYYY h:mm:ss A')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-4 text-xl font-semibold">
                {totalPages > 0 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                        >
                            1
                        </button>
                        {currentPage > 3 && <span className="mx-2">...</span>}

                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                            const pageNum = Math.max(2, currentPage - 2) + index;
                            if (pageNum > totalPages - 1) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {currentPage < totalPages - 2 && <span className="mx-2">...</span>}

                        {totalPages > 1 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                            >
                                {totalPages}
                            </button>
                        )}
                    </>
                )}
            </div>

            {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
    );
};

export default Logs;