# Learning Path Engine - Documentación

## 📚 Algoritmo de Ruta de Aprendizaje Dinámica

### Descripción
Motor de Data Science que genera rutas de aprendizaje personalizadas basadas en el análisis de soft skills del usuario.

## 🎯 Características del Algoritmo

### 1. Identificación de Áreas
- **Áreas Débiles**: Scores < 60 (necesitan mejora)
- **Fortalezas**: Scores ≥ 70 (pueden aprovecharse)
- **Priorización**: Basada en gaps y urgencia

### 2. Cálculo de Prioridades
```javascript
priorityScore = (100 - currentScore) + bonuses
```

**Bonuses:**
- Critical (score < 30): +20
- High (score < 50): +10
- Role-based adjustments: +15

**Ejemplo:**
- Usuario con buen inglés (Technical Clarity: 75)
- Bajo Persuasion Score (35)
- → Sistema prioriza "Negotiating Deadlines" y "Stakeholder Management"

### 3. Catálogo de Lecciones

#### 📊 Estructura
```javascript
{
  id: 'PERS-001',
  title: 'Negotiating Deadlines',
  difficulty: 'intermediate',
  duration: '45 min',
  priority: 'high',
  skills: ['persuasion', 'conflictResolution'],
  requiredLevel: 30,
  topics: ['negotiation', 'deadline management']
}
```

#### 🎓 20+ Lecciones Catalogadas

**Persuasión (4 lecciones)**
- Negotiating Deadlines
- Stakeholder Management
- Pitch Perfect
- Influencing Without Authority

**Claridad Técnica (4 lecciones)**
- Eliminating Filler Words
- Technical Documentation
- Explaining Complex Concepts
- Structured Thinking

**Empatía (4 lecciones)**
- Active Listening
- Emotional Intelligence
- Cross-Cultural Communication
- Giving Feedback

**Resolución de Conflictos (4 lecciones)**
- Difficult Conversations
- Mediation Skills
- De-escalation Techniques
- Building Consensus

**Brevedad (4 lecciones)**
- Concise Communication
- Executive Summary Writing
- Elevator Pitch
- Meeting Efficiency

## 🧮 Algoritmos de Selección

### Cálculo de Relevancia
```javascript
relevance = priorityScore + 
            difficultyBonus + 
            priorityBonus
```

**Factores:**
- Prioridad del skill (0-100)
- Dificultad apropiada (+10)
- Urgencia de la lección (+5 a +15)

### Estimación de Impacto
```javascript
impact = baseImpact × scoreMultiplier
```

**Multiplicadores:**
- Score < 50: ×1.5
- Score 50-70: ×1.2
- Score > 70: ×1.0

## 📅 Plan Semanal

### Generación
1. Analizar soft skills actuales
2. Identificar top 3 áreas débiles
3. Seleccionar 5 lecciones más relevantes
4. Ordenar por prioridad y relevancia
5. Estimar impacto de cada lección

### Ejemplo de Output
```json
{
  "weeklyPlan": [
    {
      "weekOrder": 1,
      "title": "Negotiating Deadlines",
      "targetSkill": "persuasion",
      "priority": "high",
      "estimatedImpact": {
        "estimatedGain": "+12",
        "projectedScore": 47
      }
    }
  ]
}
```

## 🎯 Objetivos Mensuales

### Estructura
- 4 hitos semanales por skill
- Meta: +20 puntos en áreas débiles
- Progreso rastreable

```json
{
  "skill": "persuasion",
  "currentScore": 35,
  "targetScore": 55,
  "improvement": 20,
  "milestones": [
    { "week": 1, "targetScore": 40 },
    { "week": 2, "targetScore": 45 },
    { "week": 3, "targetScore": 50 },
    { "week": 4, "targetScore": 55 }
  ]
}
```

## 🤖 Recomendaciones de IA

### Tipos de Recomendaciones

**Priority** 🎯
- Basada en el área más débil
- Acción específica inmediata

**Leverage** ✨
- Basada en fortaleza principal
- Cómo aprovechar skills fuertes

**Balance** ⚖️
- Para usuarios con múltiples áreas débiles
- Consejo de enfoque y priorización

## 📈 Estimación de Progreso

```javascript
estimatedProgress = {
  current: 52,        // Promedio actual
  projected: 61,      // Después de completar plan
  improvement: +9,    // Puntos de mejora
  timeframe: '1 semana',
  confidence: 'high'
}
```

## 🔄 Personalización Dinámica

### Factores de Personalización
1. **Soft Skills Actuales**: Base del análisis
2. **Perfil de Usuario**: Role, experiencia
3. **Historial**: Lecciones previas (futuro)
4. **Preferencias**: Tiempo disponible (futuro)

### Adaptación Automática
- Si Persuasion < 40 → Prioriza lecciones beginner
- Si Technical Clarity > 70 → Sugiere lecciones advanced
- Balance automático entre múltiples skills

## 🎮 Caso de Uso Ejemplo

### Escenario
```
Usuario: Developer con buen inglés
Scores:
- Persuasion: 35 ❌
- Technical Clarity: 78 ✓
- Empathy: 45 ⚠️
- Conflict Resolution: 42 ⚠️
- Brevity: 68 ✓
```

### Algoritmo Recomienda
**Plan Semanal:**
1. 🎯 **Negotiating Deadlines** (Persuasion +12)
2. 🤝 **Stakeholder Management** (Persuasion +10)
3. ❤️ **Active Listening** (Empathy +8)
4. 🎭 **Difficult Conversations** (Conflict +8)
5. 💬 **Pitch Perfect** (Persuasion +8)

**Objetivos Mensuales:**
- Persuasion: 35 → 55 (+20)
- Empathy: 45 → 65 (+20)
- Conflict Resolution: 42 → 62 (+20)

**Recomendación IA:**
> "🎯 Enfócate en desarrollar habilidades de persuasión. Practica técnicas de negociación y presentación de ideas."

## 📊 Métricas de Éxito

- **Cobertura**: 20+ lecciones catalogadas
- **Precisión**: Relevancia > 85%
- **Personalización**: 100% adaptativo
- **Impacto Estimado**: +5 a +15 puntos por lección

## 🚀 API Endpoints

### POST /api/sentiment/analyze
Retorna análisis completo + learning path

### POST /api/learning-path/generate
Genera learning path independiente

### GET /api/learning-path/lessons/:skill
Obtiene lecciones de un skill específico

## 📝 Notas de Implementación

- Algoritmo completamente independiente
- Sin ML/AI externo (rule-based)
- Escalable a más lecciones
- Preparado para tracking de progreso
- Base para sistema de gamificación

## 🔮 Futuras Mejoras

- [ ] Machine Learning para mejores recomendaciones
- [ ] Tracking de progreso real del usuario
- [ ] Sistema de badges y logros
- [ ] Recomendaciones colaborativas
- [ ] Integración con calendario
- [ ] Notificaciones de recordatorio
