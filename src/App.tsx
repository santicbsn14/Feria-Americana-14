import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import ProductGrid from './components/ProductGrid'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './styles/global.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/about.css'
import './styles/catalog.css'
import './styles/cart.css'
import './styles/contact.css'
import './styles/footer.css'

function App() {
  return (
    <CartProvider>
      <div className="app">
        <Header />
        <main>
          <Hero />
          <About />
          <div id="catalogo">
            <ProductGrid />
          </div>
          <Contact />
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App