import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../../types/common';
import classes from './ProductSearch.module.css';

interface ProductSearchProps {
  products: Product[];
  onFilteredProducts: (filteredProducts: Product[]) => void;
  placeholder?: string;
  className?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  onFilteredProducts,
  placeholder = "Поиск товаров по названию...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  useEffect(() => {
    onFilteredProducts(filteredProducts);
  }, [filteredProducts, onFilteredProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`${classes.searchContainer} ${className} ${isFocused ? classes.focused : ''}`}>
      <div className={classes.searchWrapper}>
        <div className={classes.searchIcon}>
          🔍
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={classes.searchInput}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className={classes.clearButton}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      {searchTerm && (
        <div className={classes.searchResults}>
          <span className={classes.resultsText}>
            Найдено товаров: <strong>{filteredProducts.length}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
