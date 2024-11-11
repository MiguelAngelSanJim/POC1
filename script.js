// Referencias a los elementos de la interfaz
const video = document.getElementById("webcam");
const canvas = document.getElementById("captured-image");
const captureBtn = document.getElementById("capture-btn");
const resultDiv = document.getElementById("result");
const slider = document.getElementById("slider");

// Variable para almacenar el modelo de IA
let model, webcam;

// Cargar el modelo de Teachable Machine
async function loadModel() {
  resultDiv.textContent = "Cargando modelo de IA...";
  try {
    model = await tmImage.load('./model.json', './metadata.json');
    resultDiv.textContent = "Modelo de IA cargado.";
  } catch (error) {
    console.error("Error al cargar el modelo de IA:", error);
    resultDiv.textContent = "Error al cargar el modelo de IA. Verifique la consola.";
  }
}

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
  let sliderValue = 0;
  
  // Animar el slider durante los 3 segundos
  const sliderInterval = setInterval(() => {
    if (sliderValue < 100) {
      sliderValue += 1;
      slider.value = sliderValue;
    }
  }, 30);

  setTimeout(() => {
    clearInterval(sliderInterval);
    captureImage();
    if (model) {
      processImage();
    } else {
      resultDiv.textContent = "El modelo de IA no está cargado.";
    }
  }, 3000);
}

// Procesar la imagen capturada con el modelo de Teachable Machine
async function processImage() {
  if (!model) {
    resultDiv.textContent = "El modelo de IA no está cargado.";
    return;
  }

  resultDiv.textContent = "Procesando imagen con IA...";

  try {
    const predictions = await model.predict(canvas);
    displayPredictions(predictions);
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    resultDiv.textContent = "Error al procesar la imagen con IA.";
  }
}

// Función para mostrar las predicciones de la IA en el HTML
function displayPredictions(predictions) {
  let topPrediction = predictions[0];
  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].probability.toFixed(2) > topPrediction.probability.toFixed(2)) {
      topPrediction = predictions[i];
    }
  }
  resultDiv.textContent = `Predicción: ${topPrediction.className}, Confianza: ${topPrediction.probability.toFixed(2)}`;
}

// Función para reiniciar el flujo y permitir nueva captura
function reset() {
  resultDiv.textContent = "";
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Evento para el botón de captura
captureBtn.addEventListener("click", () => {
  reset();
  startTimer();
});

// Evento para el slider
slider.addEventListener("input", (event) => {
  console.log("Valor del slider:", event.target.value);
});
