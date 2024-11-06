// Referencias a los elementos de la interfaz
const video = document.getElementById("webcam");
const canvas = document.getElementById("captured-image");
const captureBtn = document.getElementById("capture-btn");
const resultDiv = document.getElementById("result");
const slider = document.getElementById("slider");

// Variable para almacenar el modelo de IA
let net = null;

// Cargar el modelo de IA desde la carpeta local
async function loadModel() {
  resultDiv.textContent = "Cargando modelo de IA...";
  try {
    // Cargar el modelo desde el archivo JSON local
    net = await tf.loadGraphModel('model/pose_model.json');
    resultDiv.textContent = "Modelo de IA cargado.";
  } catch (error) {
    console.error("Error al cargar el modelo de IA:", error);
    resultDiv.textContent = "Error al cargar el modelo de IA. Verifique la consola.";
  }
}

// Llamar a la función para cargar el modelo
loadModel();

// Acceso a la webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error al acceder a la webcam:", err);
    alert("No se pudo acceder a la webcam.");
  });

// Función para capturar la imagen de la webcam y mostrarla en el canvas
function captureImage() {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
}

// Función que inicia el temporizador de 3 segundos para capturar la imagen
function startTimer() {
  resultDiv.textContent = "Capturando imagen en 3 segundos...";
  
  setTimeout(() => {
    captureImage();
    if (net) { // Verifica que el modelo esté cargado antes de procesar la imagen
      processImage();
    } else {
      resultDiv.textContent = "El modelo de IA no está cargado.";
    }
  }, 3000);
}

// Procesar la imagen capturada con TensorFlow.js
async function processImage() {
  if (!net) {
    resultDiv.textContent = "El modelo de IA no está cargado.";
    return;
  }
  
  resultDiv.textContent = "Procesando imagen con IA...";
  
  // Convertir el canvas en un tensor para TensorFlow.js
  const inputImage = tf.browser.fromPixels(canvas);
  
  try {
    // Realizar la predicción con el modelo (por ejemplo, pose estimation)
    const predictions = await net.executeAsync(inputImage.expandDims(0));
  
    // Dibujar resultados en el canvas
    drawKeypoints(predictions);
  
    resultDiv.textContent = "Procesamiento completado. Pose detectada.";
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    resultDiv.textContent = "Error al procesar la imagen con IA.";
  } finally {
    // Limpiar el tensor de la imagen para liberar memoria
    inputImage.dispose();
  }
}

// Función para dibujar puntos clave en el canvas
function drawKeypoints(predictions) {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar
  context.drawImage(video, 0, 0, canvas.width, canvas.height); // Redibujar la imagen capturada
  
  context.fillStyle = "red";
  context.strokeStyle = "red";
  
  // Recorrer las predicciones (keypoints) y dibujarlas en el canvas
  predictions.forEach(keypoint => {
    const scoreThreshold = 0.5; // Umbral de confianza (ajusta según necesites)
    if (keypoint.score > scoreThreshold) {
      const { y, x } = keypoint.position;
      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fill();
    }
  });
}

// Función para reiniciar el flujo y permitir nueva captura
function reset() {
  resultDiv.textContent = "";
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
}

// Evento para el botón de captura
captureBtn.addEventListener("click", () => {
  reset();
  startTimer();
});

// Evento para el slider (puedes usar este valor en IA real)
slider.addEventListener("input", (event) => {
  console.log("Valor del slider:", event.target.value);
});