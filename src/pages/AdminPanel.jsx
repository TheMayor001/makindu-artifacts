import React, { useState } from "react";
// Import the saveArtifact function we updated in the firebase service file
import { saveArtifact } from "../services/firebase";
import { CheckCircle, AlertTriangle, Plus } from "lucide-react";

const initialFormState = {
  name: "",
  price: "",
  description: "",
  imagePlaceholder: "", // Used for a short text description of the image content
};

const AdminPanel = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Basic validation
    if (!formData.name || !formData.price) {
      setMessage({
        type: "error",
        text: "Name and Price are required fields.",
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure price is a number
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setMessage({
        type: "error",
        text: "Price must be a valid positive number.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the saveArtifact function to write to Firestore
      await saveArtifact({
        name: formData.name.trim(),
        price: priceValue,
        description: formData.description.trim(),
        imagePlaceholder:
          formData.imagePlaceholder.trim() || "Artifact Image Placeholder",
        // The Firestore function automatically adds the timestamp and ID
      });

      setMessage({
        type: "success",
        text: `Artifact "${formData.name}" added successfully!`,
      });
      setFormData(initialFormState); // Clear form on success
    } catch (error) {
      console.error("Failed to save artifact:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "An unexpected error occurred while saving the artifact.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const MessageDisplay = ({ type, text }) => (
    <div
      className={`p-4 rounded-xl mb-6 flex items-center shadow-md ${
        type === "success"
          ? "bg-green-100 text-green-700 border-green-400"
          : "bg-red-100 text-red-700 border-red-400"
      } border`}
      role="alert"
    >
      {type === "success" ? (
        <CheckCircle className="w-6 h-6 mr-3" />
      ) : (
        <AlertTriangle className="w-6 h-6 mr-3" />
      )}
      <p className="font-medium">{text}</p>
    </div>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    value,
    placeholder,
    isRequired = false,
  }) => (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={isRequired}
        // Tailwind classes for consistent styling
        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-4 flex items-center">
          <Plus className="w-8 h-8 text-indigo-600 mr-3" />
          Makindu Inventory Admin
        </h1>
        <p className="text-gray-600 mb-8">
          Add new handcrafted artifacts to the public inventory collection.
        </p>

        {message && <MessageDisplay type={message.type} text={message.text} />}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name Input */}
            <InputField
              label="Artifact Name"
              name="name"
              value={formData.name}
              placeholder="e.g., Kamba Wooden Sculpture"
              isRequired
            />
            {/* Price Input */}
            <InputField
              label="Price (KES)"
              name="price"
              type="number"
              value={formData.price}
              placeholder="e.g., 4500"
              isRequired
            />
          </div>

          {/* Image Placeholder */}
          <InputField
            label="Image Placeholder Text"
            name="imagePlaceholder"
            value={formData.imagePlaceholder}
            placeholder="A short description for the placeholder (e.g., Hand-carved sculpture)."
          />

          {/* Description Textarea */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief description of the artifact, its origin, and materials..."
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition duration-200 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Artifact...
              </span>
            ) : (
              "Save Artifact to Inventory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
