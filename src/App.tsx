import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomeScene } from './components/HomeScene';
import { PortfolioLanding } from './components/PortfolioLanding';
import { ClutchPage } from './pages/ClutchPage';
import { HallPage } from './pages/HallPage';
import { PlayersPage } from './pages/PlayersPage';
import { TacticsPage } from './pages/TacticsPage';
import { TrainingPage } from './pages/TrainingPage';

export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<PortfolioLanding />} />
      <Route path="/basketball" element={<HomeScene />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/hall" element={<HallPage />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/tactics" element={<TacticsPage />} />
      <Route path="/clutch" element={<ClutchPage />} />
    </Route>
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
