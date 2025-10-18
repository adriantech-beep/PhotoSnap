import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import PayPage from "./pages/PayPage";
import WelcomePage from "./pages/WelcomePage";
import QRPage from "./pages/QRPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/booth" element={<QRPage />} />
        <Route path="/pay/:id" element={<PayPage />} />
        <Route path="/edit" element={<h1>🖼️ Editing Page Placeholder</h1>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
