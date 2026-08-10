import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import MosaicBackground from './mosaic';

export default function App() {
  return (
    <>
      {/* Fixed, full-viewport, pointer-events:none, z-0 — behind everything and
          inert. Code-split internally, so neither mosaics.json nor the canvas
          work blocks first paint. */}
      <MosaicBackground />
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
