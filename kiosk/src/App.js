import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainComponent from './components/MainComponent';

function App() {
  return (
    <Router>
      <MainComponent />
    </Router>
  );
}

export default App;
