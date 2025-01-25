import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    status: "active",
    stock_availability: true,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/categories/allCategories"
        );
        const result = await response.json();
        setCategories(result.data.filter(cat => cat._id !== id) || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/categories/getCategoryById/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }
        const result = await response.json();
        setFormData(result.data);
      } catch (err) {
        setError(err.message);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
    fetchCategories();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        stock_availability: formData.stock_availability
      };

      if (formData.parentId && formData.parentId.trim() !== "") {
        payload.parentId = formData.parentId;
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/categories/updateCategoryById/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:bg-indigo-700 p-2 rounded-lg transition-colors"
                title="Back to Categories"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Edit Category
              </h2>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-red-500">*</span> Category Name
              </label>
              <input
                type="text"
            name="name"
                value={formData.name}
            onChange={handleChange}
            required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter category name"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-red-500">*</span> Description
              </label>
              <textarea
            name="description"
                value={formData.description}
            onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter category description"
              />
            </div>

            {/* Parent Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Parent Category (Optional)
              </label>
              <select
                name="parentId"
                value={formData.parentId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">No Parent</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Stock Availability Checkbox */}
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                name="stock_availability"
                checked={formData.stock_availability}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-200"
              />
              <label className="text-sm font-medium text-gray-700">
                Stock Available
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-400"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  "Update Category"
                )}
              </button>
            </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;