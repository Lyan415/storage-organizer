
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginView } from './components/auth/LoginView';
import { ProjectListView } from './views/ProjectListView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { SharedView } from './views/SharedView';
import { ApiGuidePage } from './views/ApiGuidePage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/share/:token" element={<SharedView />} />
        <Route path="/api-guide" element={<ApiGuidePage />} />

        <Route
          path="/"
          element={
            <AuthGuard>
              <ProjectListView />
            </AuthGuard>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <AuthGuard>
              <ProjectDetailView />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
