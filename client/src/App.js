import { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codecast-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('codecast-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <Toaster position='top-center' />
      <div className={`app-shell theme-${theme}`}>
        <Routes>
          <Route path='/' element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
