import React, { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { motion } from "framer-motion";

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

const CyberLoader = () => (
  <div className="flex min-h-screen items-center justify-center animated-bg">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Triple ring loader */}
      <div className="relative h-32 w-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-violet shadow-neon-violet"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-4 border-transparent border-t-neon-indigo shadow-neon-indigo"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full border-4 border-transparent border-t-neon-pink shadow-neon-pink"
        />
        
        {/* Center glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-gradient-to-r from-neon-violet to-neon-indigo blur-xl"
        />
      </div>
      
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-center text-sm font-semibold tracking-wider text-neon-violet"
      >
        INITIALIZING...
      </motion.p>
    </motion.div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <Suspense fallback={<CyberLoader />}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
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