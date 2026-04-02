import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { CMSProvider } from './contexts/CMSContext';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <RouterProvider router={router} />
      </CMSProvider>
    </AuthProvider>
  );
}

export default App;