import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChartPreview from "./components/iStCharts/ChartPreview";
import ChartDetails from "./pages/ChartDetails";
import Chat from "./pages/Chat";
import DashboardModulePage from "./pages/DashboardModule";
import DashboardPage from "./pages/DashboardPage";
import DbBadgeTable from "./pages/DbBadgeTable";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import HomePage from "./pages/HomePage";
import InvoiceBookingPage from "./pages/InvoiceBookingPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import LoginFormPage from "./pages/LoginFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import RfqDetailsPage from "./pages/RfqDetailsPage";
import RfqListPage from "./pages/RfqListPage";
import RfqOffical from "./pages/RfqOffical";
import RfqPage from "./pages/RfqPage";
import SignUpPage from "./pages/SignUpPage";
import Layout from "./routes/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginFormPage />,
    },
    {
      path: "/signup",
      element: <SignUpPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgetPasswordPage />,
    },
      {
      path: "/rfq-offcial",
      element: <RfqOffical />,
    },
     {
      path: "/rfq-details/:id",
      element: <RfqDetailsPage />,
    },
     {
      path: "/rfq-details",
      element: <RfqDetailsPage />,
    },
 
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: [
            { index: true, element: <HomePage /> },

            { path: "/dashboard", element: <DashboardPage /> },
            {
              path: "/dashboard-details/:DashBoardID/:BadgeNo",
              element: <DbBadgeTable />,
            },
            {
              path: "/dashboard-module/:module",
              element: <DashboardModulePage />,
            },
            { path: "/chat", element: <Chat /> },
            { path: "/Chartdetails", element: <ChartDetails /> },

            { path: "/new-invoice", element: <InvoiceBookingPage /> },
            { path: "/edit-invoice/:id", element: <InvoiceBookingPage /> },
            { path: "/view-invoice/:id", element: <InvoiceBookingPage /> },
            { path: "/invoice-list", element: <InvoiceListPage /> },

            { path: "/new-rfq", element: <RfqPage /> },
            { path: "/edit-rfq/:id", element: <RfqPage /> },
            { path: "/view-rfq/:id", element: <RfqPage /> },
            { path: "rfq-list", element: <RfqListPage /> },
            { path: "/chart-preview", element: <ChartPreview /> },

          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
