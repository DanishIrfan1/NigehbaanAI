import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CrisisMap from "../pages/CrisisMap";
import Logs from "../pages/Logs";
import Actions from "../pages/Actions";
import Alerts from "../pages/Alerts";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/map" element={<CrisisMap />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/actions" element={<Actions />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
