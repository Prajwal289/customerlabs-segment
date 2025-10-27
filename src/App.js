import React, { useState } from 'react';
import SaveSegmentModal from './SaveSegmentModal';
import './App.css';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app">
      <h1>Customerlabs — Segment Builder</h1>
      <button className="primary" onClick={() => setShowModal(true)}>
        Save segment
      </button>

      {showModal && <SaveSegmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default App;
