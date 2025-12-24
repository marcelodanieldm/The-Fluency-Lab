# 🌳 The Fluency Lab - Complete Project

## 🎯 Overview

**The Fluency Lab** es una plataforma de análisis de comunicación con gamificación integrada. Hackea tus habilidades de comunicación a través de análisis de sentimiento, evaluación de soft skills, rutas de aprendizaje personalizadas, y un **Skill Tree** interactivo para trackear tu progreso.

---

## ✨ Features

### 🧠 Core Analysis Engine
- **Sentiment Analysis**: Evaluación de tono en 5 categorías
- **Confidence Score**: Medición de seguridad (0-100)
- **Soft Skills Radar**: 5 dimensiones de habilidades blandas
- **English Level Evaluation**: CEFR (B1-C2) assessment
- **Filler Words Detection**: Identificación de muletillas

### 📚 Learning System
- **Dynamic Learning Path**: Recomendaciones personalizadas basadas en AI
- **20+ Cataloged Lessons**: Contenido estructurado por skill
- **Weekly Plans**: Plan de 5 lecciones prioritarias
- **Monthly Goals**: Objetivos de mejora con milestones
- **Impact Estimation**: Proyección de mejora por lección

### 🎮 **NEW: Skill Tree Gamification**
- **4 Week Sprint**: Progresión semanal estructurada
- **Sequential Unlocking**: Desbloqueo progresivo de semanas
- **XP System**: Puntos de experiencia por logros
- **Session History**: Tracking completo de sesiones
- **Visual Feedback**: Animaciones y efectos en tiempo real
- **Achievement System**: Logro final al completar sprint

---

## 🌳 Skill Tree

El **Skill Tree** es el sistema de gamificación que transforma el aprendizaje en una experiencia tipo videojuego:

### Estados de Nodos:
- 🔒 **LOCKED**: Bloqueado (gris, desaturado)
- 🔓 **UNLOCKED**: Disponible (naranja neón, pulso)
- ✅ **COMPLETED**: Completado (verde neón, animaciones)

### Mecánicas:
- **Umbral de éxito**: 81/100 para pasar
- **Desbloqueo secuencial**: Completa Week 1 → Desbloquea Week 2
- **XP Formula**: `XP = Score × 1.5`
- **Reintentos ilimitados**: Puedes volver a intentar sesiones fallidas

### Semanas:
1. **Week 1**: Conflict Resolution ⚔️
2. **Week 2**: Technical Clarity 💡
3. **Week 3**: Persuasion 🎯
4. **Week 4**: Empathy ❤️
5. **Final**: Communication Expert 👑

**[Ver documentación completa →](SKILL_TREE_GUIDE.md)**

---

## 🚀 Quick Start

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Iniciar Backend
```bash
npm run dev
```
```
🚀 Server running on http://localhost:3000
```

### 3. Abrir Frontend
- Abre `frontend/index.html` en tu navegador
- O usa Live Server en VS Code

### 4. Probar Skill Tree
1. Ingresa una transcripción en español
2. Click "ANALIZAR COMUNICACIÓN"
3. Scroll down hasta el Skill Tree
4. Click "🎮 Simulate Session" para testing rápido

**[Ver guía de inicio completa →](QUICK_START.md)**

---

## 📁 Project Structure

```
The-Fluency-Lab/
│
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/
│   │   ├── sentimentAnalysis.js  # API endpoint principal
│   │   └── learningPath.js       # Learning path endpoint
│   ├── services/
│   │   ├── sentimentAnalyzer.js      # Motor de análisis
│   │   ├── learningPathEngine.js     # Sistema de recomendaciones
│   │   └── englishLevelEvaluator.js  # Evaluador CEFR
│   └── package.json
│
├── frontend/
│   ├── index.html               # Dashboard principal
│   ├── styles.css               # Estilos cyberpunk dark mode
│   └── app.js                   # Lógica del frontend + Skill Tree
│
└── Documentation/
    ├── QUICK_START.md                  # ⚡ Inicio rápido
    ├── SKILL_TREE_GUIDE.md             # 📚 Guía completa del Skill Tree
    ├── SKILL_TREE_VISUAL.md            # 🎨 Referencia visual
    ├── SKILL_TREE_IMPLEMENTATION.md    # 🛠️ Detalles técnicos
    └── TESTING_GUIDE.md                # 🧪 Guía de testing
```

---

## 🎨 Design System

### Paleta Cyberpunk
```css
🟢 Verde Neón:   #39ff14  (Completed, Success)
🟠 Naranja Neón: #ff9500  (Unlocked, Available)
🔵 Cyan Neón:    #00f5ff  (Stats, Highlights)
🟣 Púrpura Neón: #bf00ff  (Headers, Borders)
🔴 Rosa Neón:    #ff006e  (Failed, Errors)
🟡 Amarillo Neón:#ffff00  (Warnings)
```

### Efectos Visuales
- Matrix Rain background
- Glow effects con CSS filters
- Smooth animations (60fps)
- Responsive design (mobile-first)
- Hover interactions
- Particle burst effects

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + Express 4.18.2
- **Natural** 6.7.0 - NLP processing
- **Sentiment** 5.0.2 - Sentiment analysis
- **CORS** enabled

### Frontend
- **Vanilla JavaScript** ES6+
- **Chart.js** 4.4.0 - Radar charts
- **CSS3** - Animaciones y efectos
- **SVG** - Conexiones del Skill Tree

### Standards
- **CEFR** Framework (English evaluation)
- **Academic Word List** (AWL)
- **Soft Skills Framework** (5 dimensions)

---

## 📊 API Reference

### POST /api/sentiment/analyze

**Request:**
```json
{
  "transcription": "Propongo implementar esta solución efectiva",
  "language": "es",
  "userProfile": {
    "name": "User",
    "level": "intermediate"
  }
}
```

**Response:**
```json
{
  "tone": "professional",
  "confidenceScore": 85,
  "softSkills": {
    "persuasion": 85,
    "technicalClarity": 78,
    "empathy": 72,
    "conflictResolution": 80,
    "brevity": 75
  },
  "learningPath": {
    "weeklyPlan": [...],
    "monthlyGoals": [...],
    "recommendations": [...]
  },
  "englishLevel": { ... } // Solo si language='en'
}
```

---

## 🎮 Skill Tree Usage

### Para Usuarios:

1. **Analiza tu transcripción** (español o inglés)
2. **Scroll hasta Skill Tree** (aparece automáticamente)
3. **Click en Week 1** (naranja) para empezar
4. **Completa sesiones** con score > 80
5. **Desbloquea semanas** progresivamente
6. **Alcanza el logro final** 👑

### Para Testing:

- **"🎮 Simulate Session"**: Testing rápido (score aleatorio)
- **"🔄 Reset Progress"**: Reiniciar árbol completo

---

## 📈 Progress Tracking

El Skill Tree incluye:

- **Stats en tiempo real**: Completed, XP, Success Rate
- **Session History**: Últimas 10 sesiones con timestamps
- **Visual feedback**: Animaciones por cada acción
- **Achievement unlocking**: Logro final al completar 4 semanas

---

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test
```

### Manual Testing
Ver guía completa: **[TESTING_GUIDE.md](TESTING_GUIDE.md)**

Checklist rápido:
- [ ] Backend corriendo en :3000
- [ ] Frontend abre sin errores
- [ ] Análisis de transcripción funciona
- [ ] Skill Tree aparece automáticamente
- [ ] Nodos responden a clicks
- [ ] Animaciones se reproducen
- [ ] Stats se actualizan correctamente

---

## 📚 Documentation

### Core Guides
1. **[QUICK_START.md](QUICK_START.md)** - ⚡ Inicio en 3 pasos
2. **[SKILL_TREE_GUIDE.md](SKILL_TREE_GUIDE.md)** - 📚 Manual completo del Skill Tree
3. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - 🧪 Guía exhaustiva de testing

### Reference
4. **[SKILL_TREE_VISUAL.md](SKILL_TREE_VISUAL.md)** - 🎨 Diagramas visuales del árbol
5. **[SKILL_TREE_IMPLEMENTATION.md](SKILL_TREE_IMPLEMENTATION.md)** - 🛠️ Detalles técnicos

### Backend
6. **[backend/README.md](backend/README.md)** - 📡 API documentation

---

## 🎯 Use Cases

### 1. **Profesionales**
Mejora tu comunicación en reuniones, presentaciones y negociaciones.

### 2. **Estudiantes**
Desarrolla habilidades de comunicación académica y profesional.

### 3. **Non-native English Speakers**
Evalúa tu nivel de inglés (B1-C2) y recibe feedback específico.

### 4. **Team Leaders**
Fortalece habilidades de resolución de conflictos y empatía.

### 5. **Developers**
Mejora claridad técnica al explicar conceptos complejos.

---

## 🚧 Roadmap

### Implemented ✅
- [x] Sentiment analysis engine
- [x] Soft Skills Radar Chart
- [x] Learning Path recommendations
- [x] English Level Evaluator (CEFR)
- [x] **Skill Tree Gamification**
- [x] Session tracking & history
- [x] XP system
- [x] Visual animations

### Planned 🔮
- [ ] User authentication
- [ ] Progress persistence (localStorage/DB)
- [ ] Leaderboards
- [ ] Additional achievements
- [ ] Sound effects
- [ ] Multi-language support (full)
- [ ] Mobile app

---

## 🤝 Contributing

El proyecto está listo para contribuciones:

1. Fork el repositorio
2. Crea tu feature branch: `git checkout -b feature/amazing-feature`
3. Commit tus cambios: `git commit -m 'Add amazing feature'`
4. Push al branch: `git push origin feature/amazing-feature`
5. Abre un Pull Request

---

## 📄 License

Este proyecto está bajo la Licencia MIT.

---

## 👥 Credits

### Development Team:
- **Senior Backend Developer** - Sentiment Analysis & Learning Path Engine
- **UX/UI Designer** - Cyberpunk Dark Mode Dashboard
- **Data Scientist** - Dynamic Learning Path Algorithm
- **Senior Frontend Developer** - **Skill Tree Gamification System**

### Technologies:
- Natural NLP Library
- Sentiment Analysis Library
- Chart.js
- CEFR Framework
- Academic Word List (AWL)

---

## 🎉 What's New in v2.0

### 🌳 Skill Tree Feature (December 2025)

El sistema de gamificación más esperado ya está aquí:

- ✅ **4 Week Sprint System**
- ✅ **XP & Achievement Tracking**
- ✅ **8 Smooth CSS Animations**
- ✅ **Session History with Timestamps**
- ✅ **Sequential Unlocking Mechanics**
- ✅ **Visual Feedback on Every Action**

**[Ver release notes completo →](SKILL_TREE_IMPLEMENTATION.md)**

---

## 📞 Support

¿Tienes preguntas? ¿Encontraste un bug?

- 📧 Email: support@thefluencylab.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/the-fluency-lab/issues)
- 📚 Docs: Revisa las guías en este repositorio

---

## 🌟 Features Showcase

### Sentiment Analysis
![Sentiment Analysis](docs/images/sentiment-analysis.png)

### Soft Skills Radar
![Radar Chart](docs/images/radar-chart.png)

### Learning Path
![Learning Path](docs/images/learning-path.png)

### **🌳 Skill Tree** (New!)
![Skill Tree](docs/images/skill-tree.png)

---

**Made with ❤️ and ⚡ by The Fluency Lab Team**

**Hack Your Communication Skills! 🚀**

---

_Last updated: December 24, 2025_  
_Version: 2.0.0 - Skill Tree Release_
