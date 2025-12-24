# 🚀 Quick Start - Skill Tree Feature

## ⚡ Inicio Rápido en 3 Pasos

### 1️⃣ Instalar Dependencias (si no lo has hecho)
```bash
cd backend
npm install
```
✅ **Dependencias instaladas correctamente**

---

### 2️⃣ Iniciar el Backend
```bash
npm run dev
```
Deberías ver:
```
🚀 Server running on http://localhost:3000
```

---

### 3️⃣ Abrir el Frontend
1. Abre `frontend/index.html` en tu navegador
2. O usa **Live Server** en VS Code

---

## 🎮 Probar el Skill Tree

### Método 1: Simulación Rápida (Recomendado)

1. **Ingresa cualquier texto** en español:
```
Hola equipo, propongo implementar esta solución efectiva.
```

2. **Click "ANALIZAR COMUNICACIÓN"**

3. **Scroll down** - verás el Skill Tree automáticamente

4. **Click "🎮 Simulate Session"** varias veces para ver el árbol en acción

5. **Observa las animaciones**:
   - ✅ Nodos completándose en verde
   - 🔓 Nuevas semanas desbloqueándose en naranja
   - 📊 Stats actualizándose
   - 📜 Historial creciendo

---

### Método 2: Prueba Manual

1. **Click en Week 1** (nodo naranja)
2. Acepta el prompt: "Start a practice session?"
3. Ingresa un score: `85`
4. Observa:
   - ✅ Week 1 se completa (verde)
   - 🔓 Week 2 se desbloquea (naranja)
   - 📊 Stats se actualizan
   - 🎉 Alert de éxito

---

## 🎯 Lo Que Deberías Ver

### Estado Inicial:
```
✅ Week 1: UNLOCKED (naranja brillante)
⚫ Week 2-4: LOCKED (gris desaturado)
⚫ Achievement: LOCKED
📊 Stats: 0/4, 0 XP, 0%
```

### Después de 1 Sesión (Score > 80):
```
✅ Week 1: COMPLETED (verde brillante) ← ✨ Animación de rotación
🔓 Week 2: UNLOCKED (naranja brillante) ← ✨ Se desbloquea
⚫ Week 3-4: LOCKED
⚫ Achievement: LOCKED
📊 Stats: 1/4, +127 XP, 25%
📜 History: 1 entrada
```

### Sprint Completo:
```
✅ Week 1-4: COMPLETED (todos verdes)
👑 Achievement: UNLOCKED ← ✨ Animación especial
📊 Stats: 4/4, ~500 XP, 100%
📜 History: 4+ entradas
🎨 Todas las conexiones verdes brillantes
```

---

## 🎨 Efectos Visuales a Buscar

### ✨ Animaciones:
- [x] **Pulso constante** en nodos desbloqueados
- [x] **Rotación 360°** al completar nodo
- [x] **Explosión de partículas** al completar
- [x] **Resplandor verde** intenso en completados
- [x] **Conexiones pulsantes** entre nodos activos
- [x] **Badge parpadeante** en status
- [x] **Hover scale** en nodos interactivos
- [x] **Slide in** de entradas de historial

### 🎨 Colores:
- [x] Verde neón (#39ff14) para completados
- [x] Naranja neón (#ff9500) para desbloqueados
- [x] Gris oscuro para bloqueados
- [x] Púrpura neón para headers

---

## 🐛 Troubleshooting

### ❌ Skill Tree no aparece
**Solución**: 
1. Verifica que el backend esté corriendo
2. Ingresa una transcripción válida
3. El Skill Tree aparece automáticamente después del Learning Path

### ❌ Botones no funcionan
**Solución**:
1. Abre DevTools Console (F12)
2. Busca errores en JavaScript
3. Verifica que `app.js` esté cargado correctamente

### ❌ Animaciones no se ven
**Solución**:
1. Verifica que `styles.css` esté cargado
2. Inspecciona elemento y revisa clases aplicadas
3. Prueba en otro navegador (Chrome/Edge recomendado)

### ❌ Nodos no responden a clicks
**Solución**:
1. Verifica que el nodo esté en estado UNLOCKED (naranja)
2. Los nodos LOCKED (gris) no son clickeables
3. Los nodos COMPLETED (verde) solo muestran info

---

## 📱 Prueba Responsive

1. Abre DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Prueba diferentes tamaños:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
4. Verifica que nodos se adapten correctamente

---

## 🎯 Checklist de Funcionalidad

Verifica que todo funcione:

- [ ] ✅ Skill Tree aparece después de análisis
- [ ] 🔓 Week 1 está desbloqueada inicialmente
- [ ] 📊 Stats se muestran correctamente
- [ ] 🎮 "Simulate Session" funciona
- [ ] 🔄 "Reset Progress" funciona
- [ ] 🖱️ Click en nodos funciona
- [ ] 📜 Historial se actualiza
- [ ] 🎨 Animaciones se reproducen
- [ ] 📱 Responsive funciona
- [ ] 🔗 Conexiones SVG se dibujan

---

## 📚 Documentación Adicional

Para más detalles, consulta:

1. **SKILL_TREE_GUIDE.md**: Documentación técnica completa
2. **TESTING_GUIDE.md**: Guía exhaustiva de testing
3. **SKILL_TREE_VISUAL.md**: Referencia visual del árbol
4. **SKILL_TREE_IMPLEMENTATION.md**: Resumen de implementación

---

## 🎉 ¡Listo para Usar!

El Skill Tree está **100% funcional**. Solo necesitas:

1. ✅ Backend corriendo
2. ✅ Frontend abierto
3. ✅ Analizar una transcripción
4. ✅ ¡Disfrutar del árbol de habilidades!

---

**Pro Tip**: Usa "🎮 Simulate Session" varias veces seguidas para ver todas las animaciones rápidamente.

**¡Happy Gaming! 🌳✨**
