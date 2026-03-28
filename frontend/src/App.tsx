import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { UploadView } from './pages/UploadView';
import { MusicViewer } from './pages/MusicViewer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50/50 w-full font-sans antialiased text-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadView />} />
          <Route path="/music/:id" element={<MusicViewer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
