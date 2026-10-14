import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider.jsx';
import { AuthProvider } from '../auth/AuthProvider.jsx';
import AppRoutes from './AppRoutes.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
