import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import BackgroundScenes from './scenes';

export default function App() {
  return (
    <>
      {/* Fixed, full-viewport, pointer-events:none, z-0 — behind everything and
          inert. Code-split internally, so Three.js never blocks first paint. */}
      <BackgroundScenes />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}
