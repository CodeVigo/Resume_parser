// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/api";

const ProfilePage = () => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch initial profile data
  useEffect(() => {
    getProfile()
      .then((res) => {
        const { user } = res.data;
        setFormData({ name: user.name, email: user.email });
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await updateProfile(formData);
      if (res.data.success) {
        setIsEditing(false);
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("An error occurred while updating");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <label className="block mb-2 font-medium">Name</label>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        disabled={!isEditing}
        className="w-full mb-4 p-2 border rounded"
      />

      <label className="block mb-2 font-medium">Email</label>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        disabled={!isEditing}
        className="w-full mb-4 p-2 border rounded"
      />

      {isEditing ? (
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default ProfilePage;
