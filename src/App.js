import { BrowserRouter as Router } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import { AuthProvider } from './Contexts/AuthContext'

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <PublicRoute />
      </Router>
    </AuthProvider>
  );
}

export default App;