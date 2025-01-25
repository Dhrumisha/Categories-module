import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: 'stock_availability',
    direction: 'descending'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/categories/allCategories"
      );
      if (!response.ok) throw new Error("Failed to fetch categories.");
      const result = await response.json();
      setCategories(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectCategory = (e, categoryId) => {
    e.stopPropagation();
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredAndSortedCategories.map(category => category._id);
      setSelectedCategories(new Set(allIds));
    } else {
      setSelectedCategories(new Set());
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedCategories.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.size} categories?`))
      return;

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/categories/deleteCategoriesById",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryIds: Array.from(selectedCategories)
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete categories");
      }

      setSelectedCategories(new Set());
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/categories/deleteCategoryById/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleEdit = (categoryId) => {
    navigate(`/edit-category/${categoryId}`);
  };
  

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <span className="ml-1 text-gray-400 inline-block">↕</span>;
    }
    return (
      <span className="ml-1 inline-block">
        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
      </span>
    );
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  useEffect(() => {
    if (searchTerm) {
      const matchingParentIds = new Set();
      
      // Find all parent IDs that have matching children
      categories.forEach(category => {
        const hasMatchingChild = category.children?.some(child =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (hasMatchingChild) {
          matchingParentIds.add(category._id);
        }
      });

      // Update expanded categories if we found matches
      if (matchingParentIds.size > 0) {
        setExpandedCategories(prev => new Set([...prev, ...matchingParentIds]));
      }
    }
  }, [searchTerm, categories]);

  const getMatchingCategories = (categories, searchTerm) => {
    if (!searchTerm) return categories;

    return categories.filter(category => {
      const matchesCurrentCategory = 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChildren = category.children?.some(child =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchesCurrentCategory || matchesChildren;
    });
  };

  const filteredAndSortedCategories = getSortedData(
    getMatchingCategories(categories, searchTerm)
  );

  // Add these styles to the table header
  const tableHeaderClass = "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200 select-none";

  // Add these styles to the table cell
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700";

  const renderCategoryRow = (category, level = 0) => {
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = selectedCategories.has(category._id);
    
    return (
      <React.Fragment key={category._id}>
        <tr className="hover:bg-gray-50 transition-colors duration-200">
          <td className={`${tableCellClass} pl-6`}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => toggleSelectCategory(e, category._id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
            </div>
          </td>
          <td className={tableCellClass}>
            <div className="flex items-center">
              {category.children?.length > 0 && (
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none mr-2"
                >
                  <span 
                    className="transform transition-transform duration-200 inline-block text-3xl leading-none" 
                    style={{ 
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      marginTop: '-2px'
                    }}
                  >
                    ›
                  </span>
                </button>
              )}
              {!category.children?.length && <span className="w-4 mr-2"></span>}
              <span className="font-medium text-gray-900">{category.name}</span>
            </div>
          </td>
          <td className={tableCellClass}>
            <span className="text-gray-500">{category.description}</span>
          </td>
          <td className={`${tableCellClass} text-center`}>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                category.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {category.status}
            </span>
          </td>
          <td className={`${tableCellClass} text-center`}>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                category.stock_availability
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {category.stock_availability ? "In Stock" : "Out of Stock"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <div className="flex justify-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(category._id);
                }}
                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                title="Edit Category"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category._id);
                }}
                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                title="Delete Category"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        {isExpanded &&
          category.children?.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center justify-between bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Categories
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {categories.length} total
              </span>
            </h1>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex space-x-3">
            {selectedCategories.size > 0 && (
              <button
                onClick={handleMultipleDelete}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedCategories.size})
              </button>
            )}
            <Link
              to="/add-category"
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full text-sm text-gray-900 placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-blue-600 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading categories...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`${tableHeaderClass} w-12 pl-6`}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.size === filteredAndSortedCategories.length && filteredAndSortedCategories.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className={`${tableHeaderClass} w-1/4`}
                      onClick={() => sortData('name')}
                    >
                      <div className="flex items-center">
                        <span>NAME</span>
                        <span className="ml-2">{getSortIndicator('name')}</span>
                      </div>
                    </th>
                    <th 
                      className={`${tableHeaderClass} w-1/3`}
                      onClick={() => sortData('description')}
                    >
                      <div className="flex items-center">
                        <span>DESCRIPTION</span>
                        <span className="ml-2">{getSortIndicator('description')}</span>
                      </div>
                    </th>
                    <th 
                      className={`${tableHeaderClass} w-1/6`}
                      onClick={() => sortData('status')}
                    >
                      <div className="flex items-center">
                        <span>STATUS</span>
                        <span className="ml-2">{getSortIndicator('status')}</span>
                      </div>
                    </th>
                    <th 
                      className={`${tableHeaderClass} w-1/6`}
                      onClick={() => sortData('stock_availability')}
                    >
                      <div className="flex items-center">
                        <span>STOCK</span>
                        <span className="ml-2">{getSortIndicator('stock_availability')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCategories.length > 0 ? (
                    filteredAndSortedCategories.map((category) =>
                      renderCategoryRow(category)
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No categories found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;