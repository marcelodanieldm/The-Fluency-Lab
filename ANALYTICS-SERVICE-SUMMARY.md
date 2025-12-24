# 📊 Data Analytics Service - Sistema de Detección de Brechas de Contenido

## 🎯 Objetivo
Actuar como **Data Scientist** analizando reportes de auditoría para detectar patrones de errores y generar automáticamente notificaciones para los stakeholders cuando se identifiquen brechas de contenido.

## ✅ Funcionalidad Implementada

### 1. **Tracking de Phrasal Verbs Técnicos**
- **29 phrasal verbs técnicos** rastreados en tiempo real
- Ejemplos: `look into`, `break down`, `set up`, `roll back`, `scale up/down`, `shut down`, `boot up`, `log in`, `figure out`, `work out`
- Detección con **word boundaries** para evitar falsos positivos
- Contexto técnico requerido (system, server, database, code, project, issue, problem, solution)

### 2. **Análisis de Patrones B2**
- Monitoreo específico de usuarios nivel **B2**
- Cálculo de **tasa de fallos** agregada
- **Umbral del 80%** para activar notificaciones
- **Muestra mínima**: 10 auditorías para significancia estadística

### 3. **Notificaciones Automáticas para Stakeholders**
Cuando el **80%+ de usuarios B2** fallan con phrasal verbs, el sistema genera automáticamente:

```javascript
{
  id: "content_gap_phrasal_verbs_1234567890",
  type: "content_gap_suggestion",
  severity: "high", // o "critical" si >90%
  title: "🚨 Significant Content Gap Detected: B2 Phrasal Verbs",
  summary: "80% of B2 users are struggling with technical phrasal verbs",
  
  analysis: {
    affected_level: "B2",
    gap_type: "phrasal_verbs",
    failure_rate: 80.0,
    sample_size: 25,
    users_affected: 20
  },
  
  recommendation: {
    action: "Create dedicated Technical Phrasal Verbs module",
    priority: "high",
    suggested_content: [
      "Technical Phrasal Verbs Masterclass (look into, break down, roll back)",
      "Interactive exercises with IT crisis scenarios",
      "Flashcard deck with 50+ technical phrasal verbs",
      "Practice conversations under pressure",
      "Video lessons: 'Why Senior Devs Love Phrasal Verbs'"
    ],
    estimated_impact: "20 users (80% of B2 cohort) would benefit immediately",
    target_outcomes: [
      "Increase B2 phrasal verb usage by 40%",
      "Reduce failure rate from 80%+ to <30%",
      "Improve overall fluency scores by 15-20%",
      "Accelerate B2→C1 progression"
    ]
  },
  
  target_audience: ["admin", "content_creator", "partner"],
  call_to_action: "Review analytics dashboard and approve module creation"
}
```

### 4. **Integración en Crisis Coach**
El sistema se activa automáticamente durante cada respuesta del usuario:

```javascript
// Crisis Coach procesa respuesta del usuario
↓
// Linguistic Auditor analiza la respuesta
↓
// Data Analytics registra uso de phrasal verbs
dataAnalytics.recordPhrasalVerbUsage(userId, level, response, audit)
↓
// Verifica si se excede el umbral B2
const gap = dataAnalytics.analyzeB2PhrasalVerbGap()
↓
// Si ≥80% fallan → Genera notificación
if (gap.threshold_exceeded) {
  const notification = dataAnalytics.generateStakeholderNotification(gap)
}
```

## 🔗 API Endpoints Disponibles

### **Notificaciones**
```http
GET  /api/analytics/notifications
GET  /api/analytics/notifications/:role  
POST /api/analytics/notifications/:id/acknowledge
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "count": 2,
  "notifications": [
    {
      "id": "content_gap_phrasal_verbs_1234567890",
      "severity": "high",
      "title": "🚨 Significant Content Gap Detected: B2 Phrasal Verbs",
      "summary": "80% of B2 users are struggling...",
      "recommendation": { ... }
    }
  ]
}
```

### **Análisis**
```http
GET  /api/analytics/stats
GET  /api/analytics/phrasal-verb-gap
GET  /api/analytics/technical-verb-gap
GET  /api/analytics/false-friend-patterns
GET  /api/analytics/hesitation-patterns
GET  /api/analytics/weekly-insights
```

**Estadísticas globales:**
```json
{
  "success": true,
  "stats": {
    "total_audits": 150,
    "b2_phrasal_verb_failure_rate": 80.0,
    "active_notifications": 3,
    "critical_notifications": 1,
    "technical_phrasal_verbs_tracked": 29,
    "failure_threshold": "80%"
  }
}
```

### **Usuario Específico**
```http
GET  /api/analytics/user/:userId/patterns
```

### **Admin**
```http
DELETE /api/analytics/notifications/:id
POST   /api/analytics/reset  (testing only)
```

## 📈 Flujo de Datos

```
Usuario completa escenario de crisis
           ↓
Linguistic Auditor analiza respuesta
           ↓
Data Analytics registra patrones
  • Phrasal verbs usados/ausentes
  • Contexto técnico detectado
  • Nivel del usuario (B2)
           ↓
Análisis agregado por nivel
  • Total B2: 25 usuarios
  • Usuarios fallando: 20
  • Tasa de fallos: 80%
           ↓
Verificación de umbral (80%)
           ↓
✅ UMBRAL EXCEDIDO
           ↓
Notificación generada automáticamente
  • ID único
  • Severidad: high/critical
  • Recomendaciones específicas
  • 5 módulos sugeridos
  • Impacto estimado
  • Call-to-action
           ↓
Stakeholders reciben notificación
  • Admins
  • Content Creators
  • Partners
           ↓
Revisión y aprobación
           ↓
Creación de módulo Phrasal Verbs
```

## 🧪 Test Script

El script `backend/test-analytics.js` valida:

1. ✅ **Inicialización del sistema**
   - 29 phrasal verbs técnicos rastreados
   - Umbral del 80%
   - Muestra mínima de 10 auditorías

2. ✅ **Simulación de 25 usuarios B2**
   - 20 sin phrasal verbs (80%)
   - 5 con phrasal verbs (20%)

3. ✅ **Análisis de patrones**
   - Tasa de fallos calculada: 80.0%
   - Umbral excedido: SÍ 🚨

4. ✅ **Generación de notificación**
   - ID único generado
   - Severidad: HIGH
   - 5 módulos sugeridos
   - Impacto cuantificado

5. ✅ **Acknowledgment de notificación**
   - Marcada como revisada
   - Usuario y timestamp registrados

6. ✅ **Estadísticas globales**
   - 2 notificaciones activas
   - 80% failure rate B2
   - 29 phrasal verbs tracked

7. ✅ **Reporte semanal**
   - Período de 7 días
   - Brechas de contenido detectadas
   - Recomendaciones generadas

8. ✅ **Filtrado por rol**
   - Content Creators: 1
   - Admins: 1
   - Partners: 1

**Resultado del test:**
```
✅ ALL TESTS COMPLETED SUCCESSFULLY

📊 KEY FINDINGS:
   • 80% of B2 users lack technical phrasal verbs
   • Threshold (80%) EXCEEDED ⚠️
   • 2 stakeholder notifications generated
   • System is tracking 29 technical phrasal verbs
```

## 📂 Archivos Creados

1. **`backend/services/dataAnalytics.js`** (695 líneas)
   - Servicio principal de análisis
   - Tracking de phrasal verbs
   - Análisis de patrones B2
   - Generación de notificaciones
   - Gestión de notificaciones

2. **`backend/routes/analytics.js`** (450 líneas)
   - 12 endpoints REST
   - Notificaciones para stakeholders
   - Análisis e insights
   - Filtros por rol
   - Admin tools

3. **`backend/services/crisisCoach.js`** (modificado)
   - Import de dataAnalytics
   - Integración en `processCrisisResponse()`
   - Tracking automático de phrasal verbs
   - Verificación de umbrales

4. **`backend/server.js`** (modificado)
   - Import de analytics routes
   - Endpoint `/api/analytics/*` con autenticación

5. **`backend/test-analytics.js`** (270 líneas)
   - Test completo del sistema
   - Simulación de 25 usuarios B2
   - Validación de umbral 80%
   - Verificación de notificaciones

6. **`backend/debug-phrasal.js`** (debugging helper)
   - Script de depuración
   - Prueba de detección de phrasal verbs

## 🎯 Próximos Pasos para Stakeholders

1. **Revisar notificaciones** en el dashboard de analytics
2. **Aprobar creación de módulo** Phrasal Verbs Masterclass
3. **Asignar al equipo de contenido** para desarrollo
4. **Estimar 2 semanas** de desarrollo
5. **Desplegar módulo** y monitorear mejoras
6. **Medir impacto:**
   - Reducción de failure rate de 80% → <30%
   - Aumento en uso de phrasal verbs en 40%
   - Mejora de fluency scores en 15-20%
   - Aceleración de progresión B2→C1

## 🔒 Seguridad

- Todos los endpoints requieren autenticación
- Filtrado por roles (admin, content_creator, partner)
- Acknowledgment tracking por usuario
- Admin-only endpoints para reset/delete

## 🚀 Producción

Para producción, reemplazar:
- In-memory Maps → Database (PostgreSQL/MongoDB)
- Agregar paginación en endpoints
- Implementar cache con Redis
- Dashboard frontend para stakeholders
- Email notifications cuando se genera alerta
- Slack/Teams integration para notificaciones

## 📊 Métricas de Éxito

El sistema proporciona:
- ✅ Detección automática de brechas de contenido
- ✅ Notificaciones proactivas a stakeholders
- ✅ Recomendaciones específicas y accionables
- ✅ Cuantificación de impacto esperado
- ✅ Priorización basada en datos
- ✅ Tracking de acknowledgment
- ✅ Reportes semanales automatizados

---

**Commit:** `feat: Add Data Analytics Service with phrasal verb pattern detection`  
**Fecha:** 2025-12-24  
**Estado:** ✅ Completo e integrado
