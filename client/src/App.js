import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import FileExplorer from './components/FileExplorer';
import Layout from './components/Layout';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Header />
      <Layout>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/files" element={<PrivateRoute />}>
            <Route exact path="/files" element={<FileExplorer />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
