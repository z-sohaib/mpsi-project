import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Demande de Réparation - ESI" },
    {
      name: "description",
      content: "Formulaire de demande de réparation pour matériel informatique",
    },
  ];
};

export default function Repair() {
  // State for form data and modal
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    type: "",
    ref: "",
  });
  const [showModal, setShowModal] = useState(false);

  // Handle all input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Handle form submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowModal(true);
  }

  return (
    <div className="relative min-h-screen font-sans bg-white overflow-hidden">
      {/* Top half blue background */}
      <div className="absolute top-0 left-0 w-full h-[48%] bg-[#007bff] z-0" />

      {/* Man Illustration - enlarged and shifted right */}
      <img
        src="/illus.png"
        alt="Illustration"
        className="absolute bottom-0  h-72 left-10 w-[500px] md:w-[540px] z-0"
      />

      {/* Curve - bottom right behind form */}
      <img
        src="/curve.png"
        alt="curve"
        className="absolute bottom-0 -right-8 z-0 w-40 h-64"
      />

      {/* Top-left welcome content */}
      <div className="absolute top-4 left-7 text-white max-w-md z-10">
        <img src="/esi.png" alt="ESI Logo" className="w-20 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Bienvenue au Service Maintenance</h1>
        <p className=" w-96 text-sm font-thin leading-relaxed">
        Un problème technique ? Signalez-le ici et bénéficiez d'une prise en charge rapide 
        avec suivi en temps réel de votre demande !
        </p>
      </div>

      {/* Form */}
      <div className="relative z-10 flex justify-end items-center min-h-screen  pr-6">
        <div className="relative bg-white shadow-2xl rounded-2xl p-4 w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-[#007bff] text-center mb-8">
            Demande de réparation
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Inputs */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nom déposant (e)</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Veuillez entrer votre nom"
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Veuillez entrer votre email"
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Type matériel</label>
            <input
              type="text"
              required
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Ordinateur"
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Marque et référence</label>
            <input
              type="text"
              name="ref"
              required
              value={formData.ref}
              onChange={handleInputChange}
              placeholder="DELL Inspiron 15"
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>
        </div>

        {/* Right Column - Description (now required) */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1 text-black">
            Description de la panne *
          </label>
          <textarea
            name="description"
            rows={10}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Décrivez en détail la panne que vous rencontrez..."
            className="w-full h-[92%] px-4 py-2 bg-white text-black border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            required
          />
          <p className="text-xs  font-light text-gray-500 mt-1">Ce champ est obligatoire* </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="text-center mt-4">
        <button
          type="submit"
          className="bg-[#007bff] hover:bg-[#005fd3] text-white font-semibold px-6 py-2 rounded-md shadow-md"
        >
          Envoyer demande
        </button>
      </div>
    </form>
        </div>
      </div>

      {/* Success Modal Popup */}
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-xl shadow-lg p-3 max-w-md w-full text-center animate-[fadeIn_0.3s_ease-out_forwards]">
      {/* Check icon */}
      <div className="flex justify-center mb-6">
        <img 
          src="/check.png" 
          alt="Success checkmark" 
          className="w-20 h-20 animate-[bounceIn_0.5s]" 
        />
      </div>
      
      {/* Title with gradient text */}
      <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
        Demande envoyée avec succès
      </h2>
      
      {/* Content with better spacing and styling */}
      <div className="space-y-4 mb-6">
        <p className="text-gray-600">
          Vous serez informé par email : <br />
          <span className="font-semibold text-gray-800">{formData.email}</span>
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
          <p className="text-gray-700">
            <span className="font-bold text-gray-800">Nom:</span> {formData.name}
          </p>
          <p className="text-gray-700">
            <span className="font-bold text-gray-800">Description:</span> {formData.description || "Aucune description fournie"}
          </p>
          <p className="text-gray-700">
            <span className="font-bold text-gray-800">Type:</span> {formData.type}
          </p>
          <p className="text-gray-700">
            <span className="font-bold text-gray-800">Référence:</span> {formData.ref}
          </p>
        </div>
      </div>
      
      {/* OK button with better styling */}
      <button
        onClick={() => setShowModal(false)}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
      >
        OK
      </button>
    </div>
  </div>
)}
    </div>
  );
}