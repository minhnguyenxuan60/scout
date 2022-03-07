import 'antd/dist/antd.css';
import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SideNav from './components/SideNav/SideNav';
import HomePage from './layout/HomePage/HomePage';
import DatasetPage from './layout/DatasetPage/DatasetPage';
import CollectionPage from './layout/CollectionPage/CollectionPage';
import AboutPage from './layout/AboutPage/AboutPage';
import CollectionsPage from './layout/CollectionsPage/CollectionsPage';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import GHPagesRedirect from './components/GHPagesRedirect/GHPagesRedirect';
import { DEFAULT_PORTAL } from './portals';
import { USE_SINGLE_CITY } from './flags';
import UserAccountModal from './components/UserAccountModal/UserAccountModal';
import { ProfilePage } from './layout/ProfilePage/ProfilePage';
import { usePortals } from './hooks/graphQLAPI';

const queryClient = new QueryClient();

function PortalRoute() {
  // TODO: move this to HomePage?
  const { data: portalData } = usePortals();
  const Portals = portalData ? portalData.portals : null;
  const { portal } = useParams();

  console.log('Portals retrieved:', Portals);

  if (
    ['login', 'about', 'profile', 'collection', 'collections'].includes(portal)
  ) {
    return null;
  }
  const portalDetails = Portals
    ? Portals.find(p => p.abbreviation === portal)
    : null;
  if (Portals && !portalDetails) {
    return <Navigate to={`/${DEFAULT_PORTAL}`} />;
  }

  // TODO: remove this when multi-city is ready to go
  if (portalDetails && portal !== DEFAULT_PORTAL && USE_SINGLE_CITY) {
    return <Navigate to={`/${DEFAULT_PORTAL}`} />;
  }

  return Portals ? (
    <HomePage portal={Portals.find(p => p.abbreviation === portal)} />
  ) : (
    'Loading ...'
  );
}

function App() {
  const baseName = process.env.PUBLIC_URL
    ? `/${process.env.PUBLIC_URL.split('/').slice(-1)[0]}`
    : '';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router basename={baseName}>
          <div className="content">
            <Routes>
              <Route
                exact
                path="/"
                element={
                  sessionStorage.redirect ? null : (
                    <Navigate from="/" to={`/explore/${DEFAULT_PORTAL}`} />
                  )
                }
              />
              {!USE_SINGLE_CITY && (
                <Route exact path="/login" element={<UserAccountModal />} />
              )}
              <Route exact path="/about" element={<AboutPage />} />
              <Route exact path="/profile" element={<ProfilePage />} />

              <Route path="/collections" element={<CollectionsPage />} />
              <Route
                path="/collection/:name/:datasetIds"
                element={<CollectionPage />}
              />
              <Route path="/collection/:id" element={<CollectionPage />} />
              <Route path="/explore/:portal" element={<PortalRoute />} />
              <Route path="/explore/:portal/dataset/:datasetId">
                <Route path=":tab" element={<DatasetPage />} />
                <Route path="" element={<DatasetPage />} />
              </Route>
              <Route
                path="*"
                element={
                  <Navigate from="/" to={`/explore/${DEFAULT_PORTAL}`} />
                }
              />
            </Routes>
          </div>
          <SideNav />
          <GHPagesRedirect />
          <WelcomeModal />
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
