import { type RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Campaigns from '@/pages/Campaigns';
import Stories from '@/pages/Stories';
import Donate from '@/pages/Donate';
import Shop from '@/pages/Shop';
import Traceability from '@/pages/Traceability';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import CampaignDetail from '@/pages/CampaignDetail';
import ProductDetail from '@/pages/ProductDetail';
import NotFound from '@/pages/NotFound';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'campaigns', element: <Campaigns /> },
      { path: 'campaigns/:id', element: <CampaignDetail /> },
      { path: 'stories', element: <Stories /> },
      { path: 'donate', element: <Donate /> },
      { path: 'shop', element: <Shop /> },
      { path: 'shop/:id', element: <ProductDetail /> },
      { path: 'traceability', element: <Traceability /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
