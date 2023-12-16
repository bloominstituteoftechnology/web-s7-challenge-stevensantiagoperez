import React, { useState, useEffect } from 'react';
import * as yup from 'yup';

const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
};

const schema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required('Full name is required')
    .matches(/^\s*\S+\s*$/, 'Full name must not be empty or contain only whitespace') // Ensure not empty or whitespace
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: yup.string(),
  toppings: yup.array(),
});

const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [formData, setFormData] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });

  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // New state to track form validity

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox'
        ? (checked
          ? [...prevData[name], value]
          : prevData[name].filter((item) => item !== value))
        : value,
    }));
  
    // Trigger validation only when changing 'fullName' or 'size'
    if (name === 'fullName' || name === 'size') {
      validateForm();
    }
  };

  const getSizeText = (size) => {
    const sizeMap = {
      S: 'small',
      M: 'medium',
      L: 'large',
    };
    return sizeMap[size] || size;
  };

  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsFormValid(true);
      setShowSuccessMessage('');
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const newErrors = {};
        validationError.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
        setIsFormValid(false);
      } else {
        console.error(validationError);
        // Assuming server-side error, clear validation errors and set generic error
        // Only set "Something went wrong" for server-side errors
        setShowSuccessMessage('Something went wrong. Please try again later.');
        setIsFormValid(false);
      }
    }
  
    // Ensure the form is disabled if either 'fullName' or 'size' is invalid
    if (!formData.fullName || !formData.size) {
      setIsFormValid(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [formData]);



  const onSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await validateForm();
  
      // Validate form data using Yup
      await schema.validate(formData, { abortEarly: false });
  
      // If validation successful, reset errors
      setErrors({});
  
      // Map selected toppings to their corresponding IDs
      const selectedToppings = formData.toppings.map((toppingText) => {
        const topping = toppings.find((t) => t.text === toppingText);
        return topping ? topping.topping_id : null;
      });
  
      // Remove null values (in case a topping text doesn't have a corresponding ID)
      const sanitizedToppings = selectedToppings.filter((id) => id !== null);
  
      // Prepare payload for the POST request
      const payload = {
        fullName: formData.fullName,
        size: formData.size,
        toppings: sanitizedToppings,
      };
  
      // Make a POST request to the API endpoint
      const response = await fetch('http://localhost:9009/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      // Check if the request was successful (you might need to adjust this based on your API)
      if (response.ok) {
        // Customize success message based on form data
        const sizeText = getSizeText(formData.size);
        const toppingsText =
          sanitizedToppings.length > 0
            ? `with ${sanitizedToppings.length} topping${sanitizedToppings.length > 1 ? 's' : ''}`
            : 'with no toppings';
  
        const successMessage = `Thank you for your order, ${formData.fullName || 'Customer'}! Your ${sizeText} pizza ${toppingsText} is on the way.`;
  
        // Reset form data
        setFormData({
          fullName: '',
          size: '',
          toppings: [],
        });
  
        // Show success message
        setShowSuccessMessage(successMessage);
      } else {
        // Handle error response from the server
        console.error('Failed to submit order:', response.statusText);
  
        // Display a generic error message
        setShowSuccessMessage('Something went wrong. Please try again later.');
  
        // You might want to handle errors in a more user-friendly way based on your application's requirements
      }
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        // If Yup validation error, update errors state
        const newErrors = {};
        validationError.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
        console.error(validationError);
      } else {
        // Handle other types of errors if necessary
        console.error(validationError);
      }
  
      // Hide success message
      setShowSuccessMessage(false);
    }
  };
  

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {/* Display success or failure message based on form submission */}
      {showSuccessMessage && (
        <div className='success'>
          {showSuccessMessage}
        </div>
      )}
      {Object.keys(errors).length > 0 && <div className='failure'>Something went wrong</div>}

      <div className='input-group'>
      <div>
        <label htmlFor='fullName'>Full Name</label>
        <br />
        <input id='fullName' name='fullName' value={formData.fullName} onChange={handleInputChange} placeholder='Type full name' type='text' />
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>
      </div>

      <div className='input-group'>
        <div>
          <label htmlFor='size'>Size</label>
          <br />
          <select id='size' name='size' value={formData.size} onChange={handleInputChange}>
            <option value=''>----Choose Size----</option>
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
          </select>
          {errors.size && <div className='error'>{errors.size}</div>}
        </div>
      </div>

      <div className='input-group'>
        {/* Generate the checkboxes dynamically */}
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input name='toppings' type='checkbox' value={topping.text} checked={formData.toppings.includes(topping.text)} onChange={handleInputChange} />
            {topping.text}
            <br />
          </label>
        ))}
        {errors.toppings && <div className='error'>{errors.toppings}</div>}
      </div>
      {/* Make sure the submit stays disabled until the form validates */}
      <input disabled={!isFormValid} type='submit' />
    </form>
  );
}
