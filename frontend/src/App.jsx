import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { IncidentsPage } from '@/pages/IncidentsPage'
import { MapViewPage } from '@/pages/MapViewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { RootCausePage } from '@/pages/RootCausePage'

function RootLayout() {
  return <AppShell />
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'incidents', element: <IncidentsPage /> },
      { path: 'root-cause', element: <RootCausePage /> },
      { path: 'map', element: <MapViewPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App