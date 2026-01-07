import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AnalysisList from './pages/AnalysisList'
import AnalysisDetail from './pages/AnalysisDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalysisList />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
