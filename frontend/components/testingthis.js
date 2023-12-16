const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === 'checkbox'
          ? checked
            ? [...prevData[name], value]
            : prevData[name].filter((item) => item !== value)
          : value,
    }));
  
    // Dynamic validation for full name (assuming 'fullName' is the field name)
    if (name === 'fullName') {
      const fullNameError =
        value.trim().length < 3 ? 'Full name must be at least 3 characters' : undefined;
      setErrors((prevErrors) => ({
        ...prevErrors,
        fullName: fullNameError,
      }));
    }
  };