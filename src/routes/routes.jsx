

import Dashboard from '../pages/Home/Dashboard/Dashboard';
import PrivateRoute from './RouteProtection';


const routes = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },

];

export default routes;
