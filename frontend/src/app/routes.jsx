import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/Home/Home.jsx'));
const InternshipsPage = lazy(() => import('../pages/Internships/Internships.jsx'));
const HirePage = lazy(() => import('../pages/Hire/Hire.jsx'));
const EventsPage = lazy(() => import('../pages/Events/Events.jsx'));
const ProfilePage = lazy(() => import('../pages/Profile/Profile.jsx'));
const LetsBuildPage = lazy(() => import('../pages/LetsBuild/LetsBuild.jsx'));

const routes = [
  {
    path: '/',
    element: HomePage,
    allowedRoles: ['student', 'startup', 'admin'],
  },
  {
    path: '/internships',
    element: InternshipsPage,
    allowedRoles: ['student'],
  },
  {
    path: '/hire',
    element: HirePage,
    allowedRoles: ['startup', 'admin'],
  },
  {
    path: '/events',
    element: EventsPage,
    allowedRoles: ['student', 'startup', 'admin'],
  },
  {
    path: '/profile',
    element: ProfilePage,
    allowedRoles: ['student', 'startup', 'admin'],
  },
  {
    path: '/lets-build',
    element: LetsBuildPage,
    allowedRoles: ['student', 'startup', 'admin'],
  },
];

export default routes;
