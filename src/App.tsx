import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Main } from "./Pages/main/main";
import { Login } from "./Pages/Login";
import { Navbar } from "./components/navbar";
import { CreatePost } from "./Pages/create-post/create-post";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/createpost" element={<CreatePost />} />
              </Routes>
            </>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
