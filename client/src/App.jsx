import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to hold form data
  const [formData, setFormData] = useState({
    fullName: '',
    contactNo: '',
    dob: '',
    age: '',
    aadharNo: '',
  });

  // State to hold the file for upload
  const [idProofFile, setIdProofFile] = useState(null);

  // State for messages and validation feedback
  const [message, setMessage] = useState('');
  const [ocrData, setOcrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle changes in text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleFileChange = (e) => {
    setIdProofFile(e.target.files[0]);
  };

  // Handle OCR validation button click
  const handleOcrValidation = async () => {
    if (!idProofFile) {
      setMessage('Please select a file to validate.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('id_proof', idProofFile);

    setIsLoading(true);
    setMessage('Validating document...');
    setOcrData(null);

    try {
      const response = await axios.post('http://localhost:5001/api/ocr-validate', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update state with data extracted by the backend OCR
      setOcrData(response.data.data);
      setMessage(`Validation Successful! Name: ${response.data.data.name}, Aadhar: ${response.data.data.aadhar}`);
    } catch (error) {
      console.error('Error during OCR validation:', error);
      setMessage('OCR validation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setMessage('Registering user...');

    // A simple validation check
    if (formData.aadharNo.length !== 12) {
        setMessage('Aadhar number must be 12 digits.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/register', formData);
      setMessage(response.data.message);
      // Optionally clear the form
      setFormData({ fullName: '', contactNo: '', dob: '', age: '', aadharNo: '' });
      setIdProofFile(null);
      setOcrData(null);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>User Registration Portal</h1>
      <form onSubmit={handleSubmit} className="registration-form">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="contactNo"
          placeholder="Contact Number"
          value={formData.contactNo}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="aadharNo"
          placeholder="12-Digit Aadhar Number"
          maxLength="12"
          value={formData.aadharNo}
          onChange={handleInputChange}
          required
        />
        <div className="file-upload-section">
          <label htmlFor="id_proof">Upload Aadhar/PAN Card Photo</label>
          <input
            type="file"
            name="id_proof"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            required
          />
          <button type="button" onClick={handleOcrValidation} disabled={isLoading || !idProofFile} className="validate-btn">
            {isLoading ? 'Checking...' : 'Check Validation'}
          </button>
        </div>

        <button type="submit" disabled={isLoading} className="register-btn">
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;