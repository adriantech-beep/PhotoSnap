import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import PayPage from "./pages/PayPage";
import WelcomePage from "./pages/WelcomePage";
import QRPage from "./pages/QRPage";
import ChooseControlPage from "./pages/ChooseControlPage";
// import EditPage from "./pages/EditPage";
import OpenCamera from "./camera/OpenCamera";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/booth" element={<QRPage />} />
        <Route path="/pay/:id" element={<PayPage />} />
        <Route path="/choose-control/:id" element={<ChooseControlPage />} />
        <Route path="/live/:id" element={<OpenCamera />} />
        {/* <Route path="/edit/:id" element={<EditPage />}>
          <Route index element={<Navigate to="live" replace />} />
          <Route path="live" element={<OpenCamera />} />
          <Route path="editor" element={<OpenCamera />} />
        </Route> */}
      </Routes>
    </HashRouter>
  );
}

export default App;
