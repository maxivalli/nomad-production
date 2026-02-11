/**
 * flyerGenerator.js - NOMAD CORE 
 * Versión Limpia: Inter Black Impact
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
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const isStory = height > width;

  // 1. FONDO
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
    const imgAreaBottom = height - 350; 
    const availableH = imgAreaBottom - imgAreaTop;
    const ratio = Math.min((width * 0.95) / productImg.width, availableH / productImg.height);
    const imgW = productImg.width * ratio;
    const imgH = productImg.height * ratio;
    ctx.drawImage(productImg, (width - imgW) / 2, imgAreaTop + (availableH - imgH) / 2, imgW, imgH);
  }

  // 3. TEXTURA OVERLAY
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.45; 
  ctx.drawImage(overlayImg, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;

  // 4. LOGO
  const logoW = 300;
  const logoH = 100;
  ctx.drawImage(logoImg, width * 0.05, height * 0.05, logoW, logoH);

  // 5. TÍTULO (SÓLIDO Y MASIVO)
  const words = item.title.toUpperCase().split(" ");
  const firstWord = words[0];
  const restOfTitle = words.slice(1).join(" ");
  
  let fontSize = isStory ? 170 : 150; 
  const maxWidth = width * 0.94;
  const textY = height - (height * 0.18); 

  const setFont = (size) => {
    // Forzamos Inter 900. Si no carga, Impact es un buen fallback brutalista
    ctx.font = `italic 900 ${size}px "Inter", "Impact", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
  };

  const drawSolidText = (text, x, y, color) => {
    ctx.save();
    ctx.fillStyle = color;
    
    // Sombra para despegar del fondo
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;

    // Dibujamos el texto dos veces en la misma posición. 
    // Esto en Canvas ayuda a que los bordes se vean más "densos" sin usar stroke.
    ctx.fillText(text, x, y);
    ctx.shadowColor = "transparent"; // La segunda capa sin sombra para no ensuciar
    ctx.fillText(text, x, y);
    
    ctx.restore();
  };

  setFont(fontSize);

  if (restOfTitle) {
    let displayFS = fontSize;
    setFont(displayFS);

    let longestWordW = Math.max(ctx.measureText(firstWord).width, ctx.measureText(restOfTitle).width);
    while (longestWordW > maxWidth && displayFS > 40) {
      displayFS -= 5;
      setFont(displayFS);
      longestWordW = Math.max(ctx.measureText(firstWord).width, ctx.measureText(restOfTitle).width);
    }

    const lineSpacing = displayFS * 0.9; 
    drawSolidText(firstWord, width / 2, textY - (lineSpacing / 2), "#FFFFFF");
    drawSolidText(restOfTitle, width / 2, textY + (lineSpacing / 2), "#DC2626");
  } else {
    let singleFS = fontSize + 50;
    setFont(singleFS);
    while (ctx.measureText(firstWord).width > maxWidth) {
      singleFS -= 5;
      setFont(singleFS);
    }
    drawSolidText(firstWord, width / 2, textY, "#FFFFFF");
  }

  // 6. SLOGAN
  ctx.font = "bold 18px monospace"; 
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.letterSpacing = "15px";
  ctx.fillText("UNBOUND BY TERRITORY", width / 2, height - (height * 0.06));

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

// Agregamos 'selectedImg' como tercer parámetro
export const generateProductFlyer = async (item, optimizeUrl, selectedImg = null) => {
  try {
    await document.fonts.load('900 italic 100px Inter');
    
    const [logoImg, overlayImg] = await Promise.all([
      loadImage("/nomadflyer.png"),
      loadImage("/overlay.png")
    ]);
    
    // LÓGICA DE SELECCIÓN:
    // Si viene selectedImg del modal, usamos esa. 
    // Si no (fallback), usamos la primera del item.
    const baseImage = selectedImg || (Array.isArray(item.img) ? item.img[0] : item.img);
    
    const productImageUrl = optimizeUrl ? optimizeUrl(baseImage) : baseImage;
    const productImg = await loadImage(productImageUrl);

    await drawCanvas(item, productImg, logoImg, overlayImg, 1080, 1350, "feed");
    await drawCanvas(item, productImg, logoImg, overlayImg, 1080, 1920, "story");

    return { success: true };
  } catch (error) {
    console.error("Error Flyer Generator:", error);
    return { success: false, error };
  }
};

export default generateProductFlyer;