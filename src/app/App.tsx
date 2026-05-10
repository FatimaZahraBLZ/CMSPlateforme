import { AuthProvider } from './contexts/AuthContext';
import { CMSProvider } from './contexts/CMSContext';
import { SubdomainRouter } from './components/SubdomainRouter';

function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <SubdomainRouter />
      </CMSProvider>
    </AuthProvider>
  );
}

export default App;