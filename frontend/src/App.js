import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainComponentDASH from './components/Main-DASH/MainComponentDASH';
import MainComponentPOS from './components/Main-POS/MainComponentPOS';
import Auth from './components/Auth/Auth';
import Swal from 'sweetalert2';
import axios from 'axios';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const validateSession = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/validate-session/', {
            headers: { Authorization: `Token ${token}` }
          });
          if (response.status === 200) {
            setIsAuthenticated(true);
            setLoggedInUser(response.data);
          } else {
            handleInvalidSession();
          }
        } catch (error) {
          handleInvalidSession();
        }
      };

      validateSession();
    }
  }, []);

  const handleInvalidSession = () => {
    Swal.fire({
      title: 'Session Invalid',
      text: 'Your session is invalid or has expired. Please log in again.',
      icon: 'error',
      confirmButtonColor: '#0f3a87',
      timer: 2000,
      showConfirmButton: false,
    });
    localStorage.clear();
    setIsAuthenticated(false);
    setLoggedInUser({ firstName: '', lastName: '', phoneNumber: '', role: '' });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8000/api/logout/', {}, {
        headers: { Authorization: `Token ${token}` }
      });

      // Clear local storage and reset authentication state
      localStorage.clear();
      setIsAuthenticated(false);
      setLoggedInUser({ firstName: '', lastName: '', phoneNumber: '', role: '' });

      window.location.reload();

      // Show logout success message
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have successfully logged out.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      // Show logout error message
      Swal.fire({
        title: 'Logout Failed!',
        text: 'There was an error logging you out. Please try again.',
        icon: 'error',
        confirmButtonColor: '#0f3a87',
      });
    }
  };

  // Render the appropriate component based on the user's role
  const renderComponent = () => {
    if (!isAuthenticated) {
      return <Auth setIsAuthenticated={setIsAuthenticated} setLoggedInUser={setLoggedInUser} />;
    }

    // Check user role and render the appropriate component
    if (loggedInUser && loggedInUser.role) {
      if (loggedInUser.role === 'cashier') {
        return <MainComponentPOS loggedInUser={loggedInUser} handleLogout={handleLogout} />;
      } else if (loggedInUser.role === 'admin' || loggedInUser.role === 'owner') {
        return <MainComponentDASH loggedInUser={loggedInUser} handleLogout={handleLogout} />;
      }
    }

    return <MainComponentDASH loggedInUser={loggedInUser} handleLogout={handleLogout} />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={renderComponent()} />
          <Route path="/pos" element={<MainComponentPOS loggedInUser={loggedInUser} handleLogout={handleLogout} />} />
          {/* You can add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;