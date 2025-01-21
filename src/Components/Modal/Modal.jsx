import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // Importar uuid
import "./Modal.css";

const EditModal = ({ video, categories, onSave, onClose, onDelete }) => {
  const [updatedVideo, setUpdatedVideo] = useState({});

  // Sincronizar el estado cuando el video cambia
  useEffect(() => {
    setUpdatedVideo(
      video || { id: uuidv4(), title: "", category: "", url: "" } // Asignar un ID único si es un nuevo video
    );
  }, [video]);

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedVideo((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(updatedVideo); // Llamamos directamente a onSave desde props
    onClose(); // Cerramos el modal
  };

  // Función para manejar la eliminación del video
  const handleDelete = () => {
    if (video && onDelete) {
      onDelete(video.id); // Llamamos a la función onDelete pasando el ID del video a eliminar
      onClose(); // Cerramos el modal después de eliminar
    }
  };

  return (
    <div className="modal" style={{ display: video ? "flex" : "none" }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>{video?.id ? "Editar Card" : "Crear Nuevo Video"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Título del video */}
          <input
            type="text"
            name="title"
            placeholder="Título del video"
            value={updatedVideo?.title || ""}
            onChange={handleChange}
            required
          />

          {/* Selección de categoría */}
          <select
            name="category"
            value={updatedVideo?.category || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* URL del video */}
          <input
            type="text"
            name="url"
            placeholder="URL del video"
            value={updatedVideo?.url || ""}
            onChange={handleChange}
            required
          />

          <div className="modal-buttons">
            <button type="submit">Guardar</button>
            <button
              type="button"
              onClick={() => {
                setUpdatedVideo(video || { id: uuidv4(), title: "", category: "", url: "" });
              }}
            >
              Limpiar
            </button>
            {video?.id && (
              <button type="button" onClick={handleDelete} className="delete-btn">
                Eliminar Video
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;

