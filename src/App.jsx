import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceSearch from './components/VoiceSearch';
import productsData from './data/products.json';
import { FaHeart, FaRegHeart, FaSun, FaMoon } from 'react-icons/fa';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    performSearch(query);
    setSearchHistory((prev) => [query, ...prev.slice(0, 9)]);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle voice commands
  const handleCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.startsWith('add to favorites')) {
      const itemName = lowerCommand.replace('add to favorites', '').trim();
      addToFavoritesByName(itemName);
    } else if (lowerCommand.startsWith('go to page')) {
      const pageNumber = parseInt(lowerCommand.replace('go to page', '').trim());
      if (!isNaN(pageNumber)) {
        goToPage(pageNumber);
      }
    }
    // Add more commands as needed
  };

  // Handle confidence score
  const handleConfidence = (score) => {
    // You can utilize the confidence score as needed
    // For this implementation, it's displayed in the VoiceSearch component
    console.log(`Confidence Score: ${score}`);
  };

  // Perform search with filters and sorting
  const performSearch = (query) => {
    if (!query) {
      setResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    let filteredResults = productsData.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery)
    );

    if (filter !== 'all') {
      filteredResults = filteredResults.filter((product) => product.category === filter);
    }

    if (sortOrder === 'asc') {
      filteredResults.sort((a, b) => a.price - b.price);
    } else {
      filteredResults.sort((a, b) => b.price - a.price);
    }

    setResults(filteredResults);
  };

  // Add to favorites by product name
  const addToFavoritesByName = (name) => {
    const product = productsData.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (product) {
      toggleFavorite(product.id);
    } else {
      alert(`Product with name "${name}" not found.`);
    }
  };

  // Toggle favorite
  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle voice commands to navigate pages
  const goToPage = (pageNumber) => {
    const totalPages = Math.ceil(results.length / resultsPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      alert(`Page number ${pageNumber} is out of range.`);
    }
  };

  // Pagination calculations
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <motion.div 
      className={`App ${theme}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header 
        className="app-header"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.button 
          onClick={toggleTheme} 
          className="theme-button" 
          aria-label="Toggle Theme"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Voice Search Demo
        </motion.h1>
      </motion.header>

      <VoiceSearch
        onSearch={handleSearch}
        onCommand={handleCommand}
        onConfidence={handleConfidence}
      />

      <AnimatePresence>
        {searchHistory.length > 0 && (
          <motion.div 
            className="history-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Search History</h3>
            <ul>
              {searchHistory.map((item, index) => (
                <motion.li 
                  key={index} 
                  onClick={() => handleSearch(item)} 
                  className="history-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
            <motion.button 
              onClick={() => setSearchHistory([])} 
              className="clear-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear History
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchQuery && (
          <motion.div 
            className="results-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Search Results for: "{searchQuery}"</h2>
            <div className="filter-sort-container">
              {/* ... (keep existing filter and sort options) */}
            </div>
            {currentResults.length > 0 ? (
              <motion.ul 
                className="product-list"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                {currentResults.map((product) => (
                  <motion.li 
                    key={product.id} 
                    className="product-item"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <motion.button 
                      onClick={() => toggleFavorite(product.id)} 
                      className="favorite-button" 
                      aria-label="Toggle Favorite"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      {favorites.includes(product.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                    </motion.button>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <p>No matching results found.</p>
            )}
            {totalPages > 1 && (
              <motion.div 
                className="pagination"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* ... (keep existing pagination buttons) */}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {favorites.length > 0 && (
          <motion.div 
            className="favorites-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Favorites</h2>
            <motion.ul 
              className="product-list"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {favorites.map((id) => {
                const product = productsData.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <motion.li 
                    key={id} 
                    className="product-item"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <motion.button 
                      onClick={() => toggleFavorite(product.id)} 
                      className="favorite-button" 
                      aria-label="Toggle Favorite"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <FaHeart color="red" />
                    </motion.button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
