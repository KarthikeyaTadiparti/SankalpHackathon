import React from "react";
import { Button } from "./ui/button";

interface NewFormProps {
  formData: { link: string; name: string; feedback: string };
  setFormData: React.Dispatch<React.SetStateAction<{ link: string; name: string; feedback: string }>>;
  onSubmit: (formData: { link: string; name: string; feedback: string }) => void;
}

const NewForm: React.FC<NewFormProps> = ({ formData, setFormData, onSubmit }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="link"
        value={formData.link}
        onChange={handleChange}
        placeholder="Website URL"
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Website Name"
        className="border p-2 rounded"
      />
      <textarea
        name="feedback"
        value={formData.feedback}
        onChange={handleChange}
        placeholder="Any notes or feedback"
        className="border p-2 rounded"
      />
      <Button type="submit">
        Add Website
      </Button>
    </form>
  );
};

export default NewForm;
