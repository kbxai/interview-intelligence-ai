import { createBrowserRouter, RouterProvider } from "react-router";
import { lazy, Suspense } from "react";
import Protected from "./features/auth/components/Protected";
import ErrorBoundary from "./components/ErrorBoundary";

const Landing = lazy(() => import("./features/interview/pages/Landing"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Home = lazy(() => import("./features/interview/pages/Home"));
const Interview = lazy(() => import("./features/interview/pages/Interview"));
const Reports = lazy(() => import("./features/interview/pages/Reports"));
const Resume = lazy(() => import("./features/interview/pages/Resume"));
const NotFound = lazy(() => import("./pages/NotFound"));

function SuspenseWrap({ children }) {
    return <Suspense fallback={<div style={{ minHeight: '100dvh' }} />}>{children}</Suspense>;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <SuspenseWrap><Landing /></SuspenseWrap>
    },
    {
        path: "/app",
        element: <Protected><SuspenseWrap><Home /></SuspenseWrap></Protected>
    },
    {
        path: "/login",
        element: <SuspenseWrap><Login /></SuspenseWrap>
    },
    {
        path: "/register",
        element: <SuspenseWrap><Register /></SuspenseWrap>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><SuspenseWrap><Interview /></SuspenseWrap></Protected>
    },
    {
        path: "/reports",
        element: <Protected><SuspenseWrap><Reports /></SuspenseWrap></Protected>
    },
    {
        path: "/interview/:interviewId/resume",
        element: <Protected><SuspenseWrap><Resume /></SuspenseWrap></Protected>
    },
    {
        path: "*",
        element: <SuspenseWrap><NotFound /></SuspenseWrap>
    }
]);

export default function AppRoutes() {
    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
}