import React, { useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";

interface NewFormProps {
  userId: string; // user ID from auth context or state
  username: string; // username from auth context or state
  onSuccess?: () => void; // callback to notify parent (e.g., close dialog)
}

const NewForm: React.FC<NewFormProps> = ({ userId, username, onSuccess }) => {
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    feedback: "",
    rating: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Include userId and username in the request body
      const res = await axios.post(
        "http://localhost:3000/api/reviews",
        { ...formData, userId, username },
        { withCredentials: true }
      );

      console.log("Review submitted:", res.data);

      // Reset form
      setFormData({ websiteName: "", websiteUrl: "", feedback: "", rating: 1 });

      // Notify parent (e.g., to close dialog)
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="websiteUrl"
        value={formData.websiteUrl}
        onChange={handleChange}
        placeholder="Website URL"
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        name="websiteName"
        value={formData.websiteName}
        onChange={handleChange}
        placeholder="Website Name"
        className="border p-2 rounded"
        required
      />
      <textarea
        name="feedback"
        value={formData.feedback}
        onChange={handleChange}
        placeholder="Any notes or feedback"
        className="border p-2 rounded"
      />
      <select
        name="rating"
        value={formData.rating}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num} Star{num > 1 ? "s" : ""}
          </option>
        ))}
      </select>
      <Button type="submit">Add Review</Button>
    </form>
  );
};

export default NewForm;
