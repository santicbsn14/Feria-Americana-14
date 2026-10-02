import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import ProductGrid from './components/ProductGrid'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ProductDetail from './components/ProductDetail'
import AdminPage from './components/admin/AdminPage'
import './styles/global.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/about.css'
import './styles/catalog.css'
import './styles/cart.css'
import './styles/contact.css'
import './styles/footer.css'
import './styles/productDetail.css'
import './styles/admin.css'

function Home() {
  return (
    <>
      <Hero />
      <About />
      <div id="catalogo">
        <ProductGrid />
      </div>
      <Contact />
    </>
  )
}

function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  return (
    <CartProvider>
      <div className="app">
        {!isAdmin && <Header />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
      </div>
    </CartProvider>
  )
}

export default App