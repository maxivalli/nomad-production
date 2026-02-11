/**
 * flyerGenerator.js
 * Estilo: NOMAD CORE - MAXIMUM TITLE IMPACT
 */

const generateSlug = (title) => {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

const drawCanvas = async (item, productImg, logoImg, overlayImg, width, height, prefix) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const isStory = height > width;

  // 1. CAPA BASE
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // 2. IMAGEN DEL PRODUCTO
  if (isStory) {
    const ratio = Math.max(width / productImg.width, height / productImg.height);
    const imgW = productImg.width * ratio;
    const imgH = productImg.height * ratio;
    ctx.drawImage(productImg, (width - imgW) / 2, (height - imgH) / 2, imgW, imgH);
  } else {
    const imgAreaTop = 150; 
    const imgAreaBottom = height - 300; // Más espacio para el título gigante
    const availableH = imgAreaBottom - imgAreaTop;
    const availableW = width * 0.95;
    const ratio = Math.min(availableW / productImg.width, availableH / productImg.height);
    const imgW = productImg.width * ratio;
    const imgH = productImg.height * ratio;
    ctx.drawImage(productImg, (width - imgW) / 2, imgAreaTop + (availableH - imgH) / 2, imgW, imgH);
  }

  // 3. CAPA TEXTURA OVERLAY
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.45; 
  ctx.drawImage(overlayImg, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;

  // 4. DIBUJAR LOGO (Alineado a la izquierda según tu último ajuste)
  const logoW = 300;
  const logoH = 100;
  const logoX = (width - logoW) / 15;
  const logoY = height * 0.05; 
  ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

  // 5. TÍTULO BICOLOR (PROTAGONISMO TOTAL)
  const words = item.title.toUpperCase().split(" ");
  const firstWord = words[0];
  const restOfTitle = words.slice(1).join(" ");
  
  let fontSize = isStory ? 140 : 130; // Tamaño base masivo
  const maxWidth = width - 60; // Casi al borde
  const textY = height - (height * 0.15); // Un poco más arriba para que respire

  const setFont = (size) => {
    ctx.font = `italic 900 ${size}px Arial Black, sans-serif`;
  };

  setFont(fontSize);
  
  // Sombra profunda para destacar sobre la foto
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;

  const w1 = ctx.measureText(firstWord).width;
  const w2 = restOfTitle ? ctx.measureText(restOfTitle).width : 0;
  const totalW = w1 + (restOfTitle ? 35 : 0) + w2;

  // Lógica: Si es más de una palabra, preferimos 2 líneas para mantener el tamaño GIGANTE
  if (restOfTitle && (totalW > maxWidth || words.length >= 2)) {
    // Mantener fontSize alto para impacto
    let displayFS = Math.min(fontSize, 120); 
    setFont(displayFS);

    // Ajuste fino si la palabra más larga desborda
    let longestWordW = Math.max(ctx.measureText(firstWord).width, ctx.measureText(restOfTitle).width);
    while (longestWordW > maxWidth && displayFS > 60) {
      displayFS -= 5;
      setFont(displayFS);
      longestWordW = Math.max(ctx.measureText(firstWord).width, ctx.measureText(restOfTitle).width);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    // Interlineado apretado para look moderno
    ctx.fillText(firstWord, width / 2, textY - (displayFS * 0.35));
    ctx.fillStyle = "#DC2626";
    ctx.fillText(restOfTitle, width / 2, textY + (displayFS * 0.65));
  } else {
    // Título de una sola palabra: Ocupar todo el ancho posible
    let singleFS = fontSize + 20; // Aún más grande si es solo una palabra
    setFont(singleFS);
    while (ctx.measureText(firstWord).width > maxWidth) {
      singleFS -= 5;
      setFont(singleFS);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(firstWord, width / 2, textY);
  }

  // Reset de sombras para el slogan
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 6. SLOGAN (Base)
  ctx.textAlign = "center";
  ctx.font = "bold 16px monospace"; // Un punto más grande para balancear el título
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.letterSpacing = "14px";
  ctx.fillText("UNBOUND BY TERRITORY", width / 2, height - (height * 0.05));

  // 7. DESCARGA
  const filename = `${prefix}_${generateSlug(item.title)}.png`;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve({ success: true });
    }, "image/png", 1.0);
  });
};

export const generateProductFlyer = async (item, optimizeUrl) => {
  try {
    const [logoImg, overlayImg] = await Promise.all([
      loadImage("/nomadflyer.png"),
      loadImage("/overlay.png")
    ]);
    
    const firstImage = Array.isArray(item.img) ? item.img[0] : item.img;
    const productImageUrl = optimizeUrl ? optimizeUrl(firstImage) : firstImage;
    const productImg = await loadImage(productImageUrl);

    await drawCanvas(item, productImg, logoImg, overlayImg, 1080, 1350, "feed");
    await drawCanvas(item, productImg, logoImg, overlayImg, 1080, 1920, "story");

    return { success: true };
  } catch (error) {
    console.error("Error Flyer:", error);
  }
};

export default generateProductFlyer;