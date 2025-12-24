# 🧪 Testing Guide - Skill Tree

## Quick Start Testing

### 1️⃣ Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Server running on http://localhost:3000
```

---

### 2️⃣ Abrir el Frontend

1. Navega a la carpeta `frontend`
2. Abre `index.html` en tu navegador
3. O usa Live Server si tienes VS Code

---

### 3️⃣ Probar el Skill Tree

#### Opción A: Con Análisis Real

1. **Ingresa una transcripción en español**:
```
Hola equipo, propongo que implementemos esta solución. 
Es efectiva y nos ahorrará tiempo. ¿Qué opinan?
```

2. **Click en "ANALIZAR COMUNICACIÓN"**

3. **Scroll down** hasta ver el Skill Tree (aparece automáticamente)

4. **Observa**:
   - Week 1 debe estar en estado UNLOCKED (naranja)
   - Weeks 2-4 deben estar LOCKED (gris)
   - Stats: 0/4, 0 XP, 0%

---

#### Opción B: Simulación Rápida (Recomendado)

1. **Salta al Skill Tree** (si ya hiciste una prueba antes, o usa la Opción A primero)

2. **Click en "🎮 Simulate Session"**
   - Genera automáticamente un score aleatorio (60-100)
   - Procesa el resultado
   - Actualiza el UI

3. **Repite 3-4 veces** para completar todas las semanas

4. **Observa las animaciones**:
   - ✅ Nodos completados se iluminan en verde
   - 🔓 Siguiente semana se desbloquea en naranja
   - 📊 Stats se actualizan en tiempo real
   - 📜 Historial muestra cada sesión

---

### 4️⃣ Probar Interacciones

#### Test 1: Click en Nodo Bloqueado
```
1. Click en Week 2 (cuando está LOCKED)
2. Resultado esperado: 
   Alert → "🔒 This week is locked. Complete previous weeks first!"
```

#### Test 2: Click en Nodo Desbloqueado
```
1. Click en Week 1 (cuando está UNLOCKED)
2. Resultado esperado:
   Confirm → "Start a practice session for Conflict Resolution?"
3. Acepta
4. Prompt → "Enter your score (0-100):"
5. Ingresa: 85
6. Resultado esperado:
   Alert → "🎉 MISSION COMPLETE!
            Score: 85/100
            XP Gained: +127
            ✨ Next week unlocked!"
```

#### Test 3: Score Bajo (< 81)
```
1. Click en Week 1
2. Acepta práctica
3. Ingresa: 75
4. Resultado esperado:
   Alert → "⚠️ MISSION FAILED
            Score: 75/100
            You need 81+ to unlock the next level.
            Try again!"
5. Week 1 permanece UNLOCKED
6. Puedes reintentar
```

#### Test 4: Completar Sprint Completo
```
1. Completa Week 1 (score > 80)
2. Completa Week 2 (score > 80)
3. Completa Week 3 (score > 80)
4. Completa Week 4 (score > 80)
5. Resultado esperado:
   - 👑 Achievement node se desbloquea
   - Todas las conexiones se iluminan en verde
   - Stats: 4/4, XP total, 100%
```

#### Test 5: Reset Progress
```
1. Click en "🔄 Reset Progress"
2. Confirm → "🔄 Reset all progress? This cannot be undone."
3. Acepta
4. Resultado esperado:
   - Todos los nodos vuelven a estado inicial
   - Week 1 → UNLOCKED
   - Weeks 2-4 → LOCKED
   - Stats: 0/4, 0 XP, 0%
   - Historial se limpia
```

---

### 5️⃣ Verificar Animaciones CSS

#### Animaciones a observar:

✅ **Nodo Completado**:
- Rotación 360° al completar
- Brillo verde intenso
- Explosión de partículas
- Border color cambia a verde neón

🔓 **Nodo Desbloqueado**:
- Pulso constante (2s loop)
- Brillo naranja
- Status badge parpadea
- Hover → Escala 1.1x

🔒 **Nodo Bloqueado**:
- Grayscale filter
- Opacidad 50%
- Cursor: not-allowed
- Sin animaciones

📊 **Conexiones**:
- Líneas inactivas: Gris estático
- Líneas activas: Verde con pulso
- Transición suave 0.5s

---

### 6️⃣ Test de Session History

1. **Completa 3-4 sesiones** (mix de PASS y FAIL)

2. **Verifica el historial**:
   - Scroll en la lista de historial
   - Cada entrada debe mostrar:
     - Week number
     - Skill name
     - Score
     - Result badge (✓ PASS o ✗ FAIL)
     - Timestamp

3. **Colores correctos**:
   - PASS: Borde verde, badge verde
   - FAIL: Borde rosa, badge rosa

4. **Hover effect**:
   - Entrada se mueve 5px a la derecha
   - Border se ilumina

---

### 7️⃣ Responsive Testing

#### Desktop (>768px):
```
- Nodos: 200×200px
- Achievement: 240×240px
- Gap: 60px
- Botones: Horizontal
```

#### Mobile (<768px):
```
- Nodos: 150×150px
- Achievement: 180×180px
- Gap: 40px
- Botones: Vertical stack
```

**Prueba**:
1. Abre DevTools (F12)
2. Toggle device toolbar
3. Prueba diferentes resoluciones
4. Verifica que nodos se adapten correctamente

---

### 8️⃣ Checklist de Funcionalidades

- [ ] ✅ Skill Tree aparece automáticamente después de análisis
- [ ] 🔓 Week 1 inicia desbloqueada
- [ ] 🔒 Weeks 2-4 inician bloqueadas
- [ ] 📊 Stats se actualizan correctamente
- [ ] 🎯 Score > 80 desbloquea siguiente semana
- [ ] ⚠️ Score ≤ 80 permite reintentar
- [ ] 🎮 Simulate Session funciona
- [ ] 🔄 Reset Progress funciona
- [ ] 👑 Achievement se desbloquea al completar todo
- [ ] 📜 Session History se actualiza
- [ ] 🎨 Animaciones se reproducen correctamente
- [ ] 📱 Responsive design funciona
- [ ] 🖱️ Hover effects funcionan
- [ ] 🔗 Conexiones SVG se dibujan correctamente
- [ ] 💚 Conexiones se iluminan cuando nodo anterior completa

---

### 9️⃣ Tests de Integración

#### Test con Learning Path:

1. **Backend debe estar corriendo**

2. **Ingresa transcripción válida**:
```
Hola equipo, necesito discutir el proyecto. 
Creo que deberíamos cambiar la estrategia porque 
los resultados actuales no son óptimos.
```

3. **Verifica que aparezcan**:
   - ✅ Radar Chart
   - ✅ Learning Path
   - ✅ Skill Tree (después de Learning Path)

4. **Skill Tree debe**:
   - Estar completamente funcional
   - Mostrar Week 1 desbloqueada
   - Permitir interacción inmediata

---

### 🔟 Debugging

#### Console Logs

Abre DevTools Console y verifica:

```javascript
// Al cargar página
"🚀 THE FLUENCY LAB INITIALIZED"
"// Hack Your Communication Skills"

// Al analizar transcripción
"Analyzing transcription..."

// Al completar sesión (custom logs)
console.log(skillTreeState); // Ver estado actual
```

#### Errores Comunes

❌ **Skill Tree no aparece**:
- Verifica que `displayLearningPath()` se ejecute
- Confirma que backend devuelve `learningPath`

❌ **Nodos no cambian de estado**:
- Revisa `updateSkillTreeUI()` en consola
- Verifica que `skillTreeState` se actualice

❌ **Conexiones no se dibujan**:
- Confirma que SVG existe en DOM
- Revisa `drawTreeConnections()` ejecución

❌ **Animaciones no funcionan**:
- Verifica que CSS esté cargado correctamente
- Inspecciona clases aplicadas con DevTools

---

### ✨ Expected Behavior

**Al finalizar un sprint completo**:

```
📊 Stats:
   - Completed: 4/4
   - Sprint XP: ~450-500
   - Success Rate: 100%

🌳 Skill Tree:
   - Todos los nodos: COMPLETED (verde)
   - Achievement: UNLOCKED (animación especial)
   - Todas las conexiones: Activas (verde)

📜 History:
   - 4-10 sesiones registradas
   - Mix de PASS (idealmente todos)
   - Timestamps correctos
```

---

## 🐛 Bug Report

Si encuentras algún problema, verifica:

1. **Console Errors**: F12 → Console tab
2. **Network Errors**: F12 → Network tab
3. **State Inspection**: `console.log(skillTreeState)`
4. **CSS Loading**: Inspeccionar elemento → Computed styles

---

## 🚀 Performance

El Skill Tree es lightweight:
- No API calls adicionales
- State management en memoria
- SVG rendering optimizado
- CSS animations con GPU acceleration

**Tiempo de carga**: < 100ms
**FPS de animaciones**: 60fps

---

## ✅ Success Criteria

El Skill Tree está funcionando correctamente si:

1. ✅ Se integra perfectamente con el diseño cyberpunk
2. ✅ Animaciones son fluidas y profesionales
3. ✅ Progresión es clara e intuitiva
4. ✅ Feedback visual es inmediato
5. ✅ No hay bugs en interacciones
6. ✅ Responsive design funciona en todos los dispositivos
7. ✅ Se siente como un juego motivador

---

**Happy Testing! 🎮**
