import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash, FaTimes, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight, FaPlus, FaDownload } from 'react-icons/fa'; // Imported icons
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import imagePlaceholder from '../../img/logo/placeholder-image.png'; // Path to your placeholder image

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    // New user state
    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserGender, setNewUserGender] = useState('');
    const [newUserRole, setNewUserRole] = useState('');
    const [newUserPhoneNumber, setNewUserPhoneNumber] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');

    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15; // Show 10 rows per page

    // Sort state
    const [sortKey, setSortKey] = useState('id'); // Default sorting by ID
    const [sortOrder, setSortOrder] = useState('asc'); // Default to ascending

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not fetch users. Please try again later.',
                    position: 'top-end', // Position at top-end
                    timer: 2000, // Auto-close after 2 seconds
                    backdrop: false, // No background dimming
                    showConfirmButton: false, // No confirmation button
                });
            }
        };

        if (editModalOpen && localStorage.getItem('role') === 'admin' && selectedUser && selectedUser.role === 'owner') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'You do not have permission to edit this user\'s profile.',
            });
            setEditModalOpen(false);
        }

        if (localStorage.getItem('role') !== 'admin' && localStorage.getItem('role') !== 'owner') {
            setAddModalOpen(false);
        }

        fetchUsers();
    }, [editModalOpen, selectedUser]);

    // Sorting function
    const sortedUsers = [...users].sort((a, b) => {
        const isAscending = sortOrder === 'asc' ? 1 : -1;
        if (sortKey === 'id') {
            return (a.id - b.id) * isAscending;
        }
        if (sortKey === 'firstName') {
            return (a.firstName.localeCompare(b.firstName)) * isAscending;
        }
        if (sortKey === 'email') {
            return (a.email.localeCompare(b.email)) * isAscending;
        }
        if (sortKey === 'gender') {
            return (a.gender.localeCompare(b.gender)) * isAscending;
        }
        if (sortKey === 'role') {
            return (a.role.localeCompare(b.role)) * isAscending;
        }
        return 0;
    });


    // Filter and pagination logic
    const filteredUsers = sortedUsers.filter(user => {
        const matchesSearchTerm = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toString().includes(searchTerm);

        return matchesSearchTerm;
    });

    // Pagination controls
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const getPaginationRange = () => {
        const pages = [];
        if (totalPages <= 3) {
            // If total pages are less than or equal to 3, show all
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show the first page
            pages.push(1);

            // Show pages around the current page
            if (currentPage > 1) pages.push(currentPage - 1);
            pages.push(currentPage);
            if (currentPage < totalPages) pages.push(currentPage + 1);

            // Always show the last page if not already included
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }

            // Sort the pages to maintain order
            pages.sort((a, b) => a - b);
        }
        return pages;
    };

    const paginationPages = getPaginationRange();

    // Handle header click to toggle sorting
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
        } else {
            setSortKey(key);
            setSortOrder('asc'); // Default to ascending
        }
    };

    // Reset new user form fields
    const resetNewUserForm = () => {
        setNewUserUsername('');
        setNewUserFirstName('');
        setNewUserLastName('');
        setNewUserEmail('');
        setNewUserGender('');
        setNewUserRole('');
        setNewUserPhoneNumber('');
        setNewUserPassword('');
    };

    // Delete user by ID
    const handleDelete = async (userId) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirmDelete.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8000/api/users/${userId}/delete/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                Swal.fire('Deleted!', 'User  has been deleted.', 'success', {
                    position: 'top-end',
                    timer: 2000,
                    backdrop: false,
                    showConfirmButton: false,
                });
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not delete user. Please try again later.',
                    position: 'top-end',
                    timer: 2000,
                    backdrop: false,
                    showConfirmButton: false,
                });
            }
        }
    };

    // Edit user by selecting their data and opening the modal
    const handleEdit = (user) => {
        setSelectedUser(user); // Prepare user for editing
        setEditModalOpen(true);
    };

    // View user details by ID
    const handleView = async (user) => {
        if (!user || !user.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'User data is not available.',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Fetch user details
            const response = await axios.get(`http://localhost:8000/api/users/${user.id}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            // Fetch profile picture as blob
            let profilePicture = imagePlaceholder; // Default to placeholder

            try {
                const profileResponse = await axios.get(`http://localhost:8000/api/users/${user.id}/profile-picture/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                    responseType: 'blob',  // Fetch as blob for images
                });

                if (profileResponse.data) {
                    // If profile picture is returned, convert it to a URL
                    profilePicture = URL.createObjectURL(profileResponse.data);
                }
            } catch (error) {
                console.warn('No profile picture available, using placeholder.');
            }

            setSelectedUser({ ...response.data, profilePicture });
            setViewModalOpen(true);
        } catch (error) {
            console.error('Error fetching user details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not fetch user details. Please try again later.',
            });
        }
    };



    const handleCloseModals = () => {
        setViewModalOpen(false);
        setEditModalOpen(false);
        setAddModalOpen(false); // Close add user modal
        setSelectedUser(null);
        resetNewUserForm();
    };

    // Save changes after editing
    const handleSaveChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/users/${selectedUser.id}/update/`, selectedUser, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            Swal.fire('Success', 'User  information updated!', 'success', {
                position: 'top-end',
                timer: 2000,
                backdrop: false,
                showConfirmButton: false,
            });
            setEditModalOpen(false);
            setUsers(users.map(user => (user.id === selectedUser.id ? selectedUser : user)));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not update user. Please try again later.',
                position: 'top-end',
                timer: 2000,
                backdrop: false,
                showConfirmButton: false,
            });
        }
    };

    const handleAddUser = async () => {
        const newUser = {
            username: newUserUsername,
            firstName: newUserFirstName,
            lastName: newUserLastName,
            email: newUserEmail,
            gender: newUserGender,
            role: newUserRole,
            phoneNumber: newUserPhoneNumber,
            password: newUserPassword,
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/users/add/', newUser, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            Swal.fire('Success', 'New user added successfully!', 'success', {
                position: 'top-end',
                timer: 2000,
                backdrop: false,
                showConfirmButton: false,
            });
            setUsers([...users, newUser]); // Update the users state to include the new user
            handleCloseModals(); // Close the modal after successful addition
        } catch (error) {
            console.error(error.response.data); // Log the error response data
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not add user. Please try again later.',
                position: 'top-end',
                timer: 2000,
                backdrop: false,
                showConfirmButton: false,
            });
        }
    };

    const handleExportUsers = () => {
        const data = users.map((user) => ({
            id: user.id,
            username: user.username,
            firstName: user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1),
            lastName: user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1),
            email: user.email,
            gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            phoneNumber: user.phoneNumber,
        }));

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Define the columns
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Email', key: 'email', width: 45 },
            { header: 'Gender', key: 'gender', width: 15 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        ];

        // Add the data
        data.forEach(user => worksheet.addRow(user)); // Add rows properly

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
                    left: { style: 'thin' },
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
            saveAs(blob, 'users.xlsx');

            // Show success alert after download
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'User  data has been downloaded successfully!',
                position: 'top-end', // Position at top-end
                timer: 2000, // Auto-close after 2 seconds
                backdrop: false, // No background dimming
                showConfirmButton: false, // No confirmation button
            });
        });
    };

    return (
        <div className="flex flex-col h-full bg-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
                {(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'owner') && (
                    <div className="flex justify-between">
                        <div className="flex justify-between gap-x-4">
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 px-3 rounded flex justify-center items-center transition duration-200 ease-in-out transform"
                                title="Export Users"
                                onClick={handleExportUsers}
                            >
                                <FaDownload className="mr-2" size={25} />
                                Export Users
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 px-3 rounded flex justify-center items-center transition duration-200 ease-in-out transform"
                                title="Add New User"
                                onClick={() => setAddModalOpen(true)} // Open add user modal
                            >
                                <FaPlus className="mr-2" size={25} />
                                Add User
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 p-2 rounded mb-4 w-full text-black"
            />

            <div className="overflow-auto flex-grow custom-scrollbar">
                <table className="min-w-full text-black">
                    <thead className="bg-[#022a5e] text-white text-lg sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('id')}>
                                <div className="flex items-center justify-between">
                                    <span>ID</span>
                                    <span>
                                        {sortKey === 'id' ? (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronUp className="opacity-50" />}
                                    </span>
                                </div>
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('firstName')}>
                                <div className="flex items-center justify-between">
                                    <span>Name</span>
                                    <span>
                                        {sortKey === 'firstName' ? (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronUp className="opacity-50" />}
                                    </span>
                                </div>
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>
                                <div className="flex items-center justify-between">
                                    <span>Email</span>
                                    <span>
                                        {sortKey === 'email' ? (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronUp className="opacity-50" />}
                                    </span>
                                </div>
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('gender')}>
                                <div className="flex items-center justify-between">
                                    <span>Gender</span>
                                    <span>
                                        {sortKey === 'gender' ? (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronUp className="opacity-50" />}
                                    </span>
                                </div>
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('role')}>
                                <div className="flex items-center justify-between">
                                    <span>Position</span>
                                    <span>
                                        {sortKey === 'role' ? (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronUp className="opacity-50" />}
                                    </span>
                                </div>
                            </th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className='text-black'>
                        {filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((user, index) => (
                            <tr key={user.id} className={`border-b transition duration-300 ease-in-out ${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100`}>
                                <td className="border-r border-gray-300 px-4 py-2 text-center">{user.id}</td>
                                <td className="border-r border-gray-300 px-4 py-2 text-center">{user.firstName} {user.lastName}</td>
                                <td className="border-r border-gray-300 px-4 py-2 text-center">{user.email}</td>
                                <td className="border-r border-gray-300 px-4 py-2 text-center">{user.gender}</td>
                                <td className="border-r border-gray-300 px-4 py-2 text-center capitalize">{user.role}</td>
                                {/* Actions Cell */}
                                <td className="p-4 text-center">
                                    <div className="flex justify-center space-x-4">
                                        <FaEye
                                            className="cursor-pointer text-yellow-500 hover:text-yellow-700 transition-colors duration-300"
                                            onClick={() => handleView(user)}
                                            size={25}
                                        />
                                        <FaEdit
                                            className="cursor-pointer text-green-500 hover:text-green-700 transition-colors duration-300"
                                            onClick={() => handleEdit(user)}
                                            size={25}
                                        />
                                        {localStorage.getItem('role') !== 'admin' && (
                                            <FaTrash
                                                className="cursor-pointer text-red-500 hover:text-red-700 transition-colors duration-300"
                                                onClick={() => handleDelete(user.id)}
                                                size={25}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    className={`py-2 px-4 text-white transition-colors duration-200 focus:outline-none rounded flex items-center ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft className="mr-2" />
                    Prev
                </button>

                <div className="flex items-center space-x-2">
                    {paginationPages.map((page) => (
                        <button
                            key={page}
                            className={`py-2 px-4 text-white transition-colors duration-200 focus:outline-none rounded ${currentPage === page ? 'bg-blue-800' : 'bg-blue-700 hover:bg-blue-800'}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    className={`py-2 px-4 text-white transition-colors duration-200 focus:outline-none rounded flex items-center ${currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                    <FaChevronRight className="ml-2" />
                </button>
            </div>

            {/* Modal for Adding User */}
            {addModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-white p-6 rounded-md shadow-lg z-50 text-black w-11/12 max-w-lg">
                        <h2 className="text-xl font-bold mb-4 col-span-2">Add New User</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Username */}
                            <div>
                                <label className="block">Username</label>
                                <input
                                    type="text"
                                    value={newUserUsername}
                                    onChange={(e) => setNewUserUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="border px-2 py-1 w-full"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block">Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                />
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block">First Name</label>
                                <input
                                    type="text"
                                    value={newUserFirstName}
                                    onChange={(e) => setNewUserFirstName(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block">Last Name</label>
                                <input
                                    type="text"
                                    value={newUserLastName}
                                    onChange={(e) => setNewUserLastName(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block">Gender</label>
                                <select
                                    value={newUserGender}
                                    onChange={(e) => setNewUserGender(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block">Role</label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                >
                                    {localStorage.getItem('role') === 'admin' ? (
                                        <option value="cashier">Cashier</option>
                                    ) : (
                                        <>
                                            <option value="" disabled>Select Role</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="admin">Admin</option>
                                            <option value="owner">Owner</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block">Phone Number</label>
                                <input
                                    type="text"
                                    value={newUserPhoneNumber}
                                    onChange={(e) => setNewUserPhoneNumber(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block">Password</label>
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="border px-2 py-1 w-full"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-2 col-span-2">
                            <button onClick={handleAddUser} className="bg-green-500 text-white p-2 rounded">Add User</button>
                            <button onClick={handleCloseModals} className="bg-red-500 text-white p-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal for Viewing User */}
            {
                viewModalOpen && selectedUser && (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                        {/* Overlay Background */}
                        <div className="fixed inset-0 bg-black opacity-50"></div>

                        {/* Modal Content */}
                        <div className="bg-white p-6 rounded-md shadow-lg z-50 text-black w-11/12 max-w-2xl relative">
                            {/* Close Icon */}
                            <button
                                onClick={handleCloseModals}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <FaTimes size={20} />
                            </button>

                            {/* User Information Title */}
                            <h2 className="text-xl font-bold mb-4 text-center">User  Information</h2>

                            {/* Profile Picture and User Data Section */}
                            <div className="flex flex-col md:flex-row md:items-center">
                                {/* Profile Picture Section */}
                                <div className="flex-shrink-0 flex items-center justify-center mb-4 md:mb-0 md:mr-4">
                                    <img
                                        src={selectedUser.profilePicture || imagePlaceholder}
                                        alt="Profile"
                                        className="h-32 w-32 md:h-64 md:w-64 rounded border-2 border-black object-cover shadow-lg"
                                    />
                                </div>

                                {/* User Information Section */}
                                <div className="flex-grow flex flex-col">
                                    <div className="mb-2">
                                        <span className="font-semibold">First Name:</span> {selectedUser.firstName}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Last Name:</span> {selectedUser.lastName}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Email:</span> {selectedUser.email}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Gender:</span> {selectedUser.gender}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Phone Number:</span> {selectedUser.phoneNumber}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Role:</span> {selectedUser.role.toUpperCase()} {/* Capitalize role */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal for Editing User */}
            {
                editModalOpen && selectedUser && (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                        <div className="fixed inset-0 bg-black opacity-50"></div>
                        <div className="bg-white p-6 rounded-md shadow-lg z-50 text-black w-11/12 max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Edit User</h2>
                            {localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner' ? (
                                <div className="text-red-500 text-center mb-4">
                                    You do not have permission to edit this user's profile.
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 flex">
                                        <div className="mr-2 flex-1">
                                            <label className="block">First Name</label>
                                            <input
                                                type="text"
                                                value={selectedUser.firstName || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                                                className="border px-2 py-1 w-full"
                                                disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block">Last Name</label>
                                            <input
                                                type="text"
                                                value={selectedUser.lastName || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                                                className="border px-2 py-1 w-full"
                                                disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Email</label>
                                        <input
                                            type="email"
                                            value={selectedUser.email || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                            className="border px-2 py-1 w-full"
                                            disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Gender</label>
                                        <select
                                            value={selectedUser.gender || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, gender: e.target.value })}
                                            className="border px-2 py-1 w-full"
                                            disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Phone Number</label>
                                        <input
                                            type="text"
                                            value={selectedUser.phoneNumber || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                                            className="border px-2 py-1 w-full"
                                            disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block">Role</label>
                                        <select
                                            value={selectedUser.role || ''}
                                            onChange={(e) => {
                                                if (localStorage.getItem('role') === 'owner') {
                                                    setSelectedUser({ ...selectedUser, role: e.target.value });
                                                }
                                            }}
                                            className={`border px-2 py-1 w-full ${localStorage.getItem('role') !== 'owner' ? 'pointer-events-none opacity-50' : ''}`}
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="admin">Admin</option>
                                            <option value="cashier">Cashier</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleSaveChanges}
                                        className="bg-green-500 text-white p-2 rounded mr-2"
                                        disabled={localStorage.getItem('role') === 'admin' && selectedUser.role === 'owner'}
                                    >
                                        Save Changes
                                    </button>
                                    <button onClick={handleCloseModals} className="bg-red-500 text-white p-2 rounded">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserManagement;
