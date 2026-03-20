import React, { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";

const MainPage = React.lazy(() =>
  import("./Pages/main/main").then((m) => ({ default: m.Main }))
);
const LoginPage = React.lazy(() =>
  import("./Pages/Login").then((m) => ({ default: m.Login }))
);
const CreatePostPage = React.lazy(() =>
  import("./Pages/create-post/create-post").then((m) => ({ default: m.CreatePost }))
);
const ProfilePage = React.lazy(() =>
  import("./Pages/profile/Profile").then((m) => ({ default: m.Profile }))
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-4 py-8 text-slate-600">Loading...</div>}>
        {children}
      </Suspense>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <MainPage />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginPage />
      </Layout>
    ),
  },
  {
    path: "/createpost",
    element: (
      <Layout>
        <CreatePostPage />
      </Layout>
    ),
  },
  {
    path: "/profile/:uid",
    element: (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}