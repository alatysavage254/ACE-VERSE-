import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Main } from "./Pages/main/main";
import { Login } from "./Pages/Login";
import { Navbar } from "./components/navbar";
import { CreatePost } from "./Pages/create-post/create-post";
import { Profile } from "./Pages/profile/Profile";
import './styles/global.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="App">
        <Navbar />
        <Main />
      </div>
    ),
  },
  {
    path: "/login",
    element: (
      <div className="App">
        <Navbar />
        <Login />
      </div>
    ),
  },
  {
    path: "/createpost",
    element: (
      <div className="App">
        <Navbar />
        <CreatePost />
      </div>
    ),
  },
  {
    path: "/profile/:uid",
    element: (
      <div className="App">
        <Navbar />
        <Profile />
      </div>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
