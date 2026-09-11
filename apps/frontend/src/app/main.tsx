import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Aplicacao } from './Aplicacao'
import '../styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Aplicacao />
    </BrowserRouter>
  </StrictMode>,
)
