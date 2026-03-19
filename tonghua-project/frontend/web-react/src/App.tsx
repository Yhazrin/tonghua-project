import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import FlipPageTransition from '@/components/transitions/FlipPageTransition';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Campaigns from '@/pages/Campaigns';
import CampaignDetail from '@/pages/CampaignDetail';
import Stories from '@/pages/Stories';
import Donate from '@/pages/Donate';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Traceability from '@/pages/Traceability';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <FlipPageTransition>
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="stories" element={<Stories />} />
          <Route path="donate" element={<Donate />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:id" element={<ProductDetail />} />
          <Route path="traceability" element={<Traceability />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </FlipPageTransition>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
