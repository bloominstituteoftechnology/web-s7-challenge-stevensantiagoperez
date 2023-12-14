import React, { useEffect, useState } from 'react'
import * as yup from "yup";

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape({
  fullName: yup
    .string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required("Full name is required"),
  size: yup
    .string()
    .matches(/^[SML]$/, validationErrors.sizeIncorrect)
    .required("Size is required"),
  toppings: yup
    .array()
    .min(1, "Select at least one topping")
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {

  const [formData, setFormData] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: type === 'checkbox' ? (checked ? [...prevData[name], value] : prevData[name].filter(item => item !== value)) : value,
      };
    });
  }

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateFormData(formData);
    setErrors(validationErrors);

    // If no validation errors, handle form submission logic
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Add your form submission logic here

      // Reset form data
      setFormData({
        fullName: '',
        size: '',
        toppings: [],
      });
    }
  }

  const validateFormData = (data) => {
    const errors = {};

    // Full Name validation
    if (!data.fullName || data.fullName.length < 3 || data.fullName.length > 20) {
      errors.fullName = data.fullName ? validationErrors.fullNameTooShort : 'Full name is required';
    }

    // Size validation
    if (!data.size || !/^[SML]$/.test(data.size)) {
      errors.size = 'Size must be S, M, or L';
    }

    // Toppings validation
    if (!data.toppings || data.toppings.length === 0) {
      errors.toppings = 'Select at least one topping';
    }

    return errors;
  }


  return (
    <form onSubmit={onSubmit} >
      <h2>Order Your Pizza</h2>
      {Object.keys(errors).length === 0 && <div className='success'>Thank you for your order!</div>}
      {Object.keys(errors).length > 0 && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
          name='fullName'
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Type full name"
          type="text" />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select name='size' value={formData.size} onChange={handleInputChange} >
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name="toppings"
              type="checkbox"
              value={topping.text}
              checked={formData.toppings.includes(topping.text)}
              onChange={handleInputChange}
            />
            {topping.text}<br />
          </label>
        ))}
        {errors.toppings && <div className='error'>{errors.toppings}</div>}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input disabled={Object.keys(errors).length > 0} type="submit" />
    </form>
  )
}
