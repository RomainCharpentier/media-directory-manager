import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import DashboardPage from './components/DashboardPage';
import PrivateRoute from './PrivateRoute';
import Header from './components/Header';
import FileExplorer from './components/FileExplorer';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route exact path="/" element={<PrivateRoute />}>
          <Route exact path="/" element={<DashboardPage />} />
        </Route>
        <Route exact path="/files" element={<PrivateRoute />}>
          <Route exact path="/files" element={<FileExplorer />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
