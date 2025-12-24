# The Fluency Lab - Frontend Dashboard

Dashboard cyberpunk para análisis de habilidades de comunicación con Soft Skills Radar Chart.

## 🎨 Características de Diseño

### Dark Mode Cyberpunk
- Fondo oscuro (#0a0e27) con efecto Matrix Rain
- Colores neón: Pink, Cyan, Green, Purple, Orange
- Efectos glow y animaciones suaves
- Bordes brillantes con transiciones

### Soft Skills Radar Chart
Visualización de 5 dimensiones:
- 🎯 **Persuasión**: Capacidad de convencer con confianza
- 💻 **Claridad Técnica**: Precisión sin muletillas
- ❤️ **Empatía**: Conexión y comprensión
- 🤝 **Resolución de Conflictos**: Mediación y soluciones
- ⚡ **Brevedad**: Comunicación concisa

### Métricas en Tiempo Real
- Confidence Score (0-100)
- Tono detectado con emoji
- Análisis de sentimiento
- Contador de muletillas
- Estadísticas de texto

## 🚀 Cómo Usar

1. Asegúrate de que el backend esté corriendo:
```bash
cd backend
npm install
npm run dev
```

2. Abre el frontend:
```bash
cd frontend
# Simplemente abre index.html en tu navegador
# O usa un servidor local:
npx http-server -p 8080
```

3. Introduce una transcripción y haz clic en **ANALIZAR**

## 🎮 Atajos de Teclado

- `Ctrl/Cmd + Enter`: Analizar transcripción

## 🎨 Paleta de Colores Neón

- **Pink**: #ff006e - Principales botones y títulos
- **Cyan**: #00f5ff - Headers y acentos
- **Green**: #39ff14 - Estados activos
- **Purple**: #bf00ff - Métricas importantes
- **Orange**: #ff9500 - Consejos y alertas
- **Yellow**: #ffff00 - Advertencias

## 📊 Componentes del Dashboard

### Input Terminal
Área de entrada con estilo terminal de comando para introducir transcripciones.

### Metrics Grid
Grid de 4 tarjetas con:
- Confidence Score con barra de progreso
- Tono detectado con emoji animado
- Métricas de texto
- Análisis de sentimiento

### Radar Chart
Gráfico radar de 5 ejes con Chart.js mostrando las soft skills en tiempo real.

### Advice Section
Consejos personalizados de comunicación asertiva con animaciones de entrada.

### Filler Words
Muestra las muletillas detectadas como tags con contador.

## 🎭 Efectos Especiales

- Matrix Rain background (caracteres cayendo)
- Glow effects en bordes y textos
- Animaciones de hover en tarjetas
- Transiciones suaves
- Loading spinner personalizado

## 🔧 Tecnologías

- HTML5 semántico
- CSS3 con animaciones y efectos
- Vanilla JavaScript (ES6+)
- Chart.js para radar chart
- Fetch API para llamadas al backend

## 📱 Responsive

El dashboard es completamente responsive y se adapta a:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)

## 🎯 API Backend

El frontend consume el endpoint:
```
POST http://localhost:3000/api/sentiment/analyze
```

Con el body:
```json
{
  "transcription": "Tu texto aquí",
  "language": "es"
}
```

## 🚀 Próximas Mejoras

- [ ] Historial de análisis
- [ ] Comparación entre múltiples análisis
- [ ] Export a PDF
- [ ] Temas personalizables
- [ ] Análisis de voz en tiempo real
- [ ] Gamificación con logros
