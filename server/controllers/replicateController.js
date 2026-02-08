const createPrediction = async (req, res) => {
  try {
    const { model, version, input } = req.body;

    const replicateBody = {
      input
    };

    if (version) {
      replicateBody.version = version;
    } else if (model) {
      replicateBody.version = model;
    } else {
      return res.status(400).json({ 
        error: "Debe proporcionar 'model' o 'version'" 
      });
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replicateBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error de Replicate:", error);
      return res
        .status(response.status)
        .json({ error: error.detail || "Error al crear la predicción" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error creando predicción en Replicate:", error);
    res.status(500).json({ error: "Error al comunicarse con Replicate" });
  }
};

const getPrediction = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Error al obtener el estado de la predicción" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error obteniendo predicción de Replicate:", error);
    res.status(500).json({ error: "Error al comunicarse con Replicate" });
  }
};

module.exports = {
  createPrediction,
  getPrediction,
};
