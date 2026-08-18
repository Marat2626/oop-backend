// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout/MainLayout";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Calendar from "./pages/Calendar/Calendar";
import Vebinars from "./pages/Vebinars/Vabinars";
import Expert from "./pages/Expert/Expert.jsx";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="experts" element={<Expert />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="webinars" element={<Vebinars />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
