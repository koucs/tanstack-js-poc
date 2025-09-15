import {
  Outlet,
  Link,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import Home from './pages/Home';
import Users from './pages/Users';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function RootLayout() {
  return (
    <>
      <nav>
        <Link to="/" activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/users">Users</Link>
      </nav>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: Users,
});

const routeTree = rootRoute.addChildren([indexRoute, usersRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

