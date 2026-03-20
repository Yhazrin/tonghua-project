import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import FlipPageTransition from '@/components/transitions/FlipPageTransition';
import ErrorBoundary from '@/components/editorial/ErrorBoundary';
import { useSessionRestore } from '@/hooks/useSessionRestore';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));
const CampaignDetail = lazy(() => import('@/pages/CampaignDetail'));
const Stories = lazy(() => import('@/pages/Stories'));
const ArtworkDetail = lazy(() => import('@/pages/ArtworkDetail'));
const Donate = lazy(() => import('@/pages/Donate'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Traceability = lazy(() => import('@/pages/Traceability'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50dvh]">
      <div className="w-6 h-6 border-2 border-warm-gray border-t-rust rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  useSessionRestore(); // Restore session on app load

  return (
    <ErrorBoundary>
      <FlipPageTransition>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route index element={<ErrorBoundary><Home /></ErrorBoundary>} />
            <Route path="about" element={<ErrorBoundary><About /></ErrorBoundary>} />
            <Route path="campaigns" element={<ErrorBoundary><Campaigns /></ErrorBoundary>} />
            <Route path="campaigns/:id" element={<ErrorBoundary><CampaignDetail /></ErrorBoundary>} />
            <Route path="stories" element={<ErrorBoundary><Stories /></ErrorBoundary>} />
            <Route path="artworks/:id" element={<ErrorBoundary><ArtworkDetail /></ErrorBoundary>} />
            <Route path="donate" element={<ErrorBoundary><Donate /></ErrorBoundary>} />
            <Route path="shop" element={<ErrorBoundary><Shop /></ErrorBoundary>} />
            <Route path="shop/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
            <Route path="traceability" element={<ErrorBoundary><Traceability /></ErrorBoundary>} />
            <Route path="contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
            <Route path="login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
            <Route path="register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
            <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
            <Route path="*" element={<NotFound />} />
          </Route>
          </Routes>
        </Suspense>
      </FlipPageTransition>
    </ErrorBoundary>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
