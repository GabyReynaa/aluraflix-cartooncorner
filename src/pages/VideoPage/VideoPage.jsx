import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditModal from "../../Components/Modal/Modal"; // Asegúrate de tener este componente
import "./VideoPage.css";

const VideoPage = () => {
  const { category } = useParams();
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [favorites, setFavorites] = useState([]); // Guardamos los favoritos
  const [editVideoId, setEditVideoId] = useState(null); // Para controlar el modal de edición
  const [categories, setCategories] = useState([]); // Para manejar las categorías
  const [error, setError] = useState(null); // Para manejar los errores de API
  const navigate = useNavigate();

  // Función para alternar el estado de favorito
  const handleFavoriteToggle = (videoId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.includes(videoId)
        ? prevFavorites.filter((id) => id !== videoId)
        : [...prevFavorites, videoId];

      // Guardar los nuevos favoritos en localStorage
      localStorage.setItem("favorites", JSON.stringify(newFavorites));

      return newFavorites;
    });
  };

  // Función para borrar un video
  const handleDelete = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:3000/videos/${videoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al borrar el video");
      }

      setCategoryVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error("Error al borrar el video:", error);
      setError("Error al eliminar el video. Intenta nuevamente.");
    }
  };

  // Función para abrir el modal de edición
  const handleEdit = (videoId) => {
    setEditVideoId(videoId); // Mostrar el modal
  };

  // Función para guardar un video editado o nuevo
  const handleSave = async (updatedVideo) => {
    try {
      const response = await fetch(
        `http://localhost:3000/videos/${updatedVideo.id || ""}`,
        {
          method: updatedVideo.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVideo),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar el video");
      }

      const savedVideo = await response.json();

      setCategoryVideos((prevVideos) => {
        if (updatedVideo.id) {
          // Actualizar video existente
          return prevVideos.map((video) =>
            video.id === savedVideo.id ? savedVideo : video
          );
        } else {
          // Agregar nuevo video
          return [...prevVideos, savedVideo];
        }
      });
      navigate(`/videos/${savedVideo.category}`);
    } catch (error) {
      console.error("Error al guardar el video:", error);
      setError("Error al guardar el video. Intenta nuevamente.");
    }
  };

  // Cargar los videos de la categoría seleccionada
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:3000/videos");
        const data = await response.json();

        const filteredVideos = data.filter(
          (video) => video.category.toLowerCase() === category.toLowerCase()
        );
        setCategoryVideos(filteredVideos);
      } catch (error) {
        console.error("Error al obtener los videos:", error);
        setError("Error al cargar los videos. Intenta nuevamente.");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/videos");
        const data = await response.json();

        const uniqueCategories = [...new Set(data.map((video) => video.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
        setError("Error al cargar las categorías. Intenta nuevamente.");
      }
    };

    fetchVideos();
    fetchCategories();

    // Cargar los favoritos desde localStorage al montar el componente
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, [category]);

  return (
    <div className="video-page">
      <h2 className="video-page__title">Videos de la categoría: {category}</h2>

      {/* Mostrar error si hay algún problema con la carga */}
      {error && <div className="error-message">{error}</div>}

      <div className="video-page__gallery">
        {categoryVideos.length > 0 ? (
          categoryVideos.map((video) => (
            <div key={video.id} className="video-page__card">
              <iframe
                className="video-page__video"
                width="300"
                height="300"
                src={video.url}
                title={video.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h3>{video.title}</h3>
              <button
                className="view-full-video-btn"
                onClick={() => navigate(`/videoPlayer/${video.id}`)}
              >
                Ver Video Completo
              </button>
              <img
                src={favorites.includes(video.id) ? "/images/Corazónrelleno.png" : "/images/Corazón.png"}
                alt="favorite"
                onClick={() => handleFavoriteToggle(video.id)}
                className="favorite-icon"
              />
              <button onClick={() => handleEdit(video.id)} className="edit-btn">
                Editar Card
              </button>
              <button onClick={() => handleDelete(video.id)} className="delete-btn">
                Borrar
              </button>
            </div>
          ))
        ) : (
          <p>No hay videos disponibles para esta categoría</p>
        )}
      </div>

      {editVideoId && (
        <EditModal
          video={categoryVideos.find((video) => video.id === editVideoId)}
          categories={categories} // Aquí pasamos las categorías al modal
          onSave={handleSave}
          onClose={() => setEditVideoId(null)}
          onDelete={handleDelete} // Pasamos la función handleDelete al modal
        />
      )}
    </div>
  );
};

export default VideoPage;

