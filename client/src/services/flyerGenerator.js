/**
 * flyerGenerator.js - NOMAD CORE 
 * Versión: Maximizar espacio y Tipografía Masiva
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

const drawImageProp = (ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) => {
  var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih),
    nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; 
  nw *= ar; nh *= ar;
  cw = iw / (nw / w); ch = ih / (nh / h);
  cx = (iw - cw) * offsetX; cy = (ih - ch) * offsetY;
  ctx.drawImage(img, Math.max(cx, 0), Math.max(cy, 0), Math.min(cw, iw), Math.min(ch, ih), x, y, w, h);
};

const drawCanvas = async (item, img1, img2, logoImg, overlayImg, width, height, prefix) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  // 1. FONDO NEGRO
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const isStory = height > 1400;
  const margin = width * 0.06; 

  // --- LAYOUT OPTIMIZADO PARA LLENAR ESPACIO ---
  
  // CAJA 1: Arriba Izquierda
  const box1 = {
    x: margin,
    y: isStory ? 250 : 100, 
    w: width * 0.46, 
    h: isStory ? height * 0.45 : height * 0.42 
  };

  // CAJA 2: Derecha (Ahora mucho más larga hacia abajo)
  const box2 = {
    x: width * 0.56, 
    y: isStory ? 350 : 150,
    w: width * 0.38, 
    h: isStory ? height * 0.65 : height * 0.70 // Baja mucho más para no dejar huecos
  };

  // 2. DIBUJAR IMÁGENES
  if (img1) drawImageProp(ctx, img1, box1.x, box1.y, box1.w, box1.h, 0.5, 0.2); 
  if (img2) drawImageProp(ctx, img2, box2.x, box2.y, box2.w, box2.h, 0.5, 0.2);

  // 3. TEXTURA (Sutil para no lavar los negros)
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.15; 
  ctx.drawImage(overlayImg, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;

  // 4. LOGO (Arriba Derecha)
  const logoW = width * 0.22;
  const logoRatio = logoImg.height / logoImg.width;
  ctx.drawImage(logoImg, width - logoW - margin, isStory ? 100 : 50, logoW, logoW * logoRatio);

  // 5. TÍTULO (MÁS GRANDE Y APRETADO)
  const words = item.title.toUpperCase().split(" ");
  
  // Usamos un tamaño de fuente mayor
  let fontSize = isStory ? 170 : 150;
  ctx.font = `900 ${fontSize}px "Impact", "Inter", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // El texto empieza un poco antes de que termine la imagen 1 para solaparse visualmente si es necesario
  let textX = margin;
  let textY = box1.y + box1.h + 20; 

  const lineHeight = fontSize * 0.88; // Interlineado negativo/apretado para look brutalista

  words.forEach((word, index) => {
    ctx.fillStyle = (index === words.length - 1) ? "#FF0000" : "#FFFFFF";
    
    // Si la palabra es muy larga para el espacio izquierdo, reducimos fuente solo para esa línea
    let currentFS = fontSize;
    while (ctx.measureText(word).width > (width * 0.50) && currentFS > 80) {
        currentFS -= 10;
        ctx.font = `900 ${currentFS}px "Impact", "Inter", sans-serif`;
    }

    ctx.fillText(word, textX, textY);
    textY += (currentFS * 0.88);
    // Reset font for next word
    ctx.font = `900 ${fontSize}px "Impact", "Inter", sans-serif`;
  });

  // 6. WEBSITE (Alineado a la derecha, cerca de la base de la foto 2)
  ctx.font = "800 22px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "right";
  ctx.letterSpacing = "1px";
  ctx.fillText("NOMADWEAR.COM.AR", width - margin, height - 60);

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
    
    let imgSource1 = item.img[0];
    let imgSource2 = item.img[1] || item.img[0];

    const [productImg1, productImg2] = await Promise.all([
        loadImage(optimizeUrl ? optimizeUrl(imgSource1) : imgSource1),
        loadImage(optimizeUrl ? optimizeUrl(imgSource2) : imgSource2)
    ]);

    await drawCanvas(item, productImg1, productImg2, logoImg, overlayImg, 1080, 1350, "feed");
    await drawCanvas(item, productImg1, productImg2, logoImg, overlayImg, 1080, 1920, "story");

    return { success: true };
  } catch (error) {
    console.error("Error Flyer Generator:", error);
    return { success: false, error };
  }
};

export default generateProductFlyer;