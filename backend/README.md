# The Fluency Lab - Backend API

Backend service para análisis de sentimiento y evaluación de comunicación oral.

## 🚀 Características

- **Análisis de Sentimiento Avanzado**: Evalúa el tono de las transcripciones
- **Identificación de Tonos**: Detecta 5 tipos de tonos:
  - 😟 Dudoso
  - 😤 Agresivo
  - 🤝 Profesional
  - 😶 Pasivo
  - ⚖️ Neutral

- **Confidence Score**: Calcula un score de confianza del 0-100
- **Consejos Personalizados**: Genera recomendaciones de comunicación asertiva
- **Detección de Muletillas**: Identifica palabras de relleno
- **Análisis Estructural**: Evalúa complejidad y estructura de las frases

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start
```

## 🔧 API Endpoints

### POST /api/sentiment/analyze

Analiza una transcripción y devuelve análisis completo.

**Request Body:**
```json
{
  "transcription": "Creo que tal vez podríamos considerar esta opción...",
  "language": "es"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tone": "doubt",
    "toneDescription": "Dudoso - Muestra inseguridad y falta de convicción",
    "confidenceScore": 35,
    "confidenceLevel": "Bajo",
    "sentiment": {
      "score": 0,
      "comparative": 0,
      "positive": [],
      "negative": []
    },
    "fillerWords": {
      "found": [
        { "word": "este", "count": 2 }
      ],
      "count": 2
    },
    "structureAnalysis": {
      "sentenceCount": 1,
      "avgSentenceLength": 8.0,
      "complexity": "Baja",
      "usesQuestions": false,
      "questionCount": 0
    },
    "advice": {
      "primary": [
        "💡 Elimina palabras como 'quizás' o 'tal vez'. Usa afirmaciones directas.",
        "🎯 Reemplaza 'creo que' por 'estoy seguro que' o 'mi análisis indica'.",
        "💪 Usa verbos en presente y modo indicativo para sonar más decisivo."
      ],
      "summary": "Tu comunicación muestra un 35% de confianza. Trabaja en ser más directo..."
    },
    "metrics": {
      "wordCount": 8,
      "sentenceCount": 1,
      "avgWordsPerSentence": 8.0
    }
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "The Fluency Lab Backend is running"
}
```

## 🧪 Tecnologías

- **Node.js** + **Express**: Framework del servidor
- **Natural**: Procesamiento de lenguaje natural
- **Sentiment**: Análisis de sentimiento
- **CORS**: Manejo de peticiones cross-origin

## 📊 Tipos de Análisis

### 1. Análisis de Tono
Identifica el tono dominante basándose en patrones lingüísticos:
- **Dudoso**: "quizás", "tal vez", "creo que"
- **Agresivo**: "debes", "tienes que", "obviamente"
- **Pasivo**: "disculpa", "perdón", "solo quería"
- **Profesional**: "propongo", "considero", "recomiendo"

### 2. Confidence Score
Calcula un score de 0-100 basado en:
- Tono identificado
- Cantidad de muletillas
- Estructura de las frases
- Claridad del mensaje

### 3. Consejos de Comunicación Asertiva
Genera recomendaciones específicas para:
- Eliminar inseguridad
- Reducir agresividad
- Aumentar asertividad
- Mejorar profesionalismo

## 🌍 Soporte de Idiomas

- Español (es)
- Inglés (en)

## 🛠️ Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# Ejecutar tests
npm test
```

## 📝 Notas

Este backend está diseñado para evaluar más que palabras - analiza la confianza, el tono y la efectividad de la comunicación oral para ayudar a los usuarios a mejorar sus habilidades de comunicación profesional.
