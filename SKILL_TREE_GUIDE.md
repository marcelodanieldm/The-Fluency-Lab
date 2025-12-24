# 🌳 Skill Tree - Sprint Progress System

## Descripción General

El **Skill Tree** es un sistema gamificado de progreso que visualiza tu avance en el desarrollo de habilidades de comunicación durante un Sprint de 4 semanas. Los nodos se desbloquean progresivamente al completar sesiones con puntajes superiores a 80/100.

---

## 🎮 Características Principales

### 1. Sistema de Progresión Semanal
- **4 Semanas de Entrenamiento**: Cada nodo representa una semana del sprint
  - **Week 1**: Conflict Resolution (⚔️)
  - **Week 2**: Technical Clarity (💡)
  - **Week 3**: Persuasion (🎯)
  - **Week 4**: Empathy (❤️)
  
- **Logro Final**: Communication Expert (👑)

### 2. Estados de Nodos

#### 🔒 **LOCKED (Bloqueado)**
- Color: Gris
- Apariencia: Desaturado, sin brillo
- Estado: No disponible para práctica
- Condición: Completar la semana anterior primero

#### 🔓 **UNLOCKED (Desbloqueado)**
- Color: Naranja neón (#ff9500)
- Apariencia: Borde brillante, animación de pulso
- Estado: Disponible para iniciar sesión
- Condición: Automático al completar semana anterior

#### ✅ **COMPLETED (Completado)**
- Color: Verde neón (#39ff14)
- Apariencia: Brillo intenso, animación de rotación
- Estado: Sesión completada con éxito
- Condición: Puntaje > 80/100

---

## 🎯 Sistema de Puntuación

### Mecánicas de Progreso

1. **Umbral de Éxito**: 81/100 o superior
   - ✅ **PASS**: Desbloquea siguiente semana
   - ❌ **FAIL**: Puedes reintentar sin límite

2. **XP (Puntos de Experiencia)**
   - Fórmula: `XP = Score × 1.5`
   - Ejemplo: Score 85 → +127 XP

3. **Desbloqueo Secuencial**
   - Solo puedes avanzar linealmente
   - No puedes saltarte semanas
   - Week 1 siempre empieza desbloqueada

---

## 🎨 Animaciones y Efectos Visuales

### Efectos de Nodo

| Estado | Animación | Duración |
|--------|-----------|----------|
| **Unlocked** | Pulso naranja | 2s loop |
| **Completed** | Rotación 360° + escala | 0.8s |
| **Glow** | Resplandor radial | 2s loop |
| **Particles** | Explosión de partículas | 1s |

### Conexiones entre Nodos
- **Inactivas**: Líneas grises (#2a3f5f)
- **Activas**: Líneas verdes neón con pulso
- **Grosor**: 3px → 4px (activas)
- **Filtro**: Drop shadow para efecto de brillo

---

## 📊 Estadísticas en Tiempo Real

El panel superior muestra:

1. **Completed**: `X/4` - Nodos completados
2. **Sprint XP**: Total de puntos de experiencia acumulados
3. **Success Rate**: Porcentaje de progreso (0-100%)

---

## 🕹️ Controles Interactivos

### Botones Principales

#### 🎮 **Simulate Session**
```javascript
// Genera una sesión aleatoria (score 60-100)
// Útil para testing rápido
```

#### 🔄 **Reset Progress**
```javascript
// Reinicia todo el progreso
// Requiere confirmación del usuario
// Limpia historial y XP
```

---

## 📜 Session History

Registro de las últimas 10 sesiones con:

- **Week**: Semana de la sesión
- **Skill**: Habilidad entrenada
- **Score**: Puntaje obtenido
- **Result**: ✓ PASS / ✗ FAIL
- **Timestamp**: Fecha y hora

### Indicadores Visuales
- **✓ PASS**: Borde verde, fondo verde neón
- **✗ FAIL**: Borde rosa, fondo rosa neón

---

## 🎮 Flujo de Uso

### Escenario 1: Primera Sesión
```
1. Usuario analiza transcripción
2. Se muestra Learning Path
3. Skill Tree aparece automáticamente
4. Week 1 está UNLOCKED (naranja)
5. Click en nodo Week 1
6. Prompt: "Start a practice session for Conflict Resolution?"
7. Usuario completa sesión con score 85
8. ✅ MISSION COMPLETE
   - Week 1 → COMPLETED (verde)
   - Week 2 → UNLOCKED (naranja)
   - +127 XP agregado
9. Historial actualizado con nueva entrada
```

### Escenario 2: Fallo en Sesión
```
1. Usuario intenta Week 2 con score 75
2. ⚠️ MISSION FAILED
3. Mensaje: "You need 81+ to unlock the next level. Try again!"
4. Week 2 permanece UNLOCKED
5. Puede reintentar inmediatamente
6. Historial muestra entrada ✗ FAIL
```

### Escenario 3: Logro Final
```
1. Usuario completa Week 4 con score 90
2. ✅ Week 4 → COMPLETED
3. 👑 Final Achievement → UNLOCKED
4. Animación especial de desbloqueo
5. Todas las conexiones se iluminan en verde
6. Celebración visual con efectos de partículas
```

---

## 🛠️ Integración Técnica

### Estado del Skill Tree
```javascript
const skillTreeState = {
    weeks: [
        { week: 1, skill: 'Conflict Resolution', score: null, completed: false, unlocked: true },
        { week: 2, skill: 'Technical Clarity', score: null, completed: false, unlocked: false },
        { week: 3, skill: 'Persuasion', score: null, completed: false, unlocked: false },
        { week: 4, skill: 'Empathy', score: null, completed: false, unlocked: false }
    ],
    finalAchievement: { completed: false, unlocked: false },
    sessionHistory: [],
    totalXP: 0
};
```

### Funciones Principales

| Función | Propósito |
|---------|-----------|
| `initSkillTree()` | Inicializa el árbol y event listeners |
| `updateSkillTreeUI()` | Actualiza estados visuales de nodos |
| `drawTreeConnections()` | Dibuja líneas SVG entre nodos |
| `processSessionResult()` | Procesa score y actualiza estado |
| `simulateSession()` | Genera sesión de prueba |
| `resetSkillTree()` | Reinicia todo el progreso |

---

## 🎨 Paleta de Colores

```css
--neon-green: #39ff14   /* Completed nodes */
--neon-orange: #ff9500  /* Unlocked nodes */
--neon-purple: #bf00ff  /* Headers & borders */
--neon-cyan: #00f5ff    /* Stats & highlights */
--neon-pink: #ff006e    /* Fail indicators */
```

---

## 🌐 Responsive Design

### Desktop (>768px)
- Nodos: 200×200px
- Gap entre nodos: 60px
- Botones: Inline horizontal

### Mobile (<768px)
- Nodos: 150×150px
- Gap entre nodos: 40px
- Botones: Stacked vertical

---

## 🔮 Futuras Mejoras

- [ ] Guardar progreso en localStorage
- [ ] Integrar scores reales de análisis de sentimiento
- [ ] Achievements adicionales (badges)
- [ ] Modo multijugador (comparar con otros usuarios)
- [ ] Sonidos para eventos (unlock, complete, fail)
- [ ] Animaciones de partículas mejoradas
- [ ] Tooltips con detalles de habilidades
- [ ] Gráfico de progreso temporal

---

## 📝 Notas de Diseño

El Skill Tree está diseñado con estética **cyberpunk dark mode** para mantener consistencia con el resto de The Fluency Lab:

- Fondo oscuro con efecto Matrix Rain
- Bordes neón con glow effects
- Animaciones suaves y profesionales
- Feedback visual inmediato
- Estilo "hacking de habilidades"

---

## 🚀 Activación

El Skill Tree se muestra automáticamente cuando:
1. Usuario analiza una transcripción
2. Backend devuelve un Learning Path
3. `displayLearningPath()` ejecuta `showSkillTree()`

No requiere configuración adicional. ¡Plug and play! 🎮

---

**Desarrollado por**: Senior Frontend Developer
**Fecha**: Diciembre 2025
**Versión**: 1.0.0
