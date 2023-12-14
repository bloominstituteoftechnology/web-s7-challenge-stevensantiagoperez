import React, { useState } from 'react';
import * as yup from 'yup';

const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S, M, or L',
};

const schema = yup.object().shape({
  fullName: yup.string().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required('Full name is required'),
  size: yup.string().matches(/^[SML]$/, validationErrors.sizeIncorrect).required('Size is required'),
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (checked ? [...prevData[name], value] : prevData[name].filter((item) => item !== value)) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate form data using Yup
    try {
      await schema.validate(formData, { abortEarly: false });

      // If validation successful, reset errors
      setErrors({});

      // Customize success message based on form data
      const successMessage = `Thank you for your order, ${formData.fullName}! Your ${formData.size} pizza ${
        formData.toppings && formData.toppings.length > 0
          ? `with ${formData.toppings.length} topping${formData.toppings.length > 1 ? 's' : ''}: ${formData.toppings.join(', ')}`
          : 'with no toppings'
      } is on the way.`;
      console.log(successMessage);

      // Update state to trigger success message
      setFormData({
        fullName: '',
        size: '',
        toppings: [],
      });
    } catch (validationError) {
      // If validation fails, update errors state
      const newErrors = {};
      validationError.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {/* Display success or failure message based on form submission */}
      {Object.keys(errors).length === 0 && (
        <div className='success'>
          Thank you for your order, {formData.fullName}! Your {formData.size} pizza{' '}
          {formData.toppings && formData.toppings.length > 0
            ? `with ${formData.toppings.length} topping${formData.toppings.length > 1 ? 's' : ''}: ${formData.toppings.join(', ')}`
            : 'with no toppings'
          } is on the way.
        </div>
      )}
      {Object.keys(errors).length > 0 && <div className='failure'>Something went wrong</div>}

      <div className='input-group'>
        <div>
          <label htmlFor='fullName'>Full Name</label>
          <br />
          <input name='fullName' value={formData.fullName} onChange={handleInputChange} placeholder='Type full name' type='text' />
          {errors.fullName && <div className='error'>{errors.fullName}</div>}
        </div>
      </div>

      <div className='input-group'>
        <div>
          <label htmlFor='size'>Size</label>
          <br />
          <select name='size' value={formData.size} onChange={handleInputChange}>
            <option value=''>----Choose Size----</option>
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
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
      <input disabled={Object.keys(errors).length > 0} type='submit' />
    </form>
  );
}
