/**
 * LEARNING PATH ENGINE
 * Data Science model para generar rutas de aprendizaje dinámicas
 * basadas en análisis de soft skills
 */

class LearningPathEngine {
  constructor() {
    // Base de datos de lecciones catalogadas por skill
    this.lessonsCatalog = {
      persuasion: [
        {
          id: 'PERS-001',
          title: 'Negotiating Deadlines',
          description: 'Técnicas avanzadas para negociar plazos con stakeholders',
          difficulty: 'intermediate',
          duration: '45 min',
          priority: 'high',
          skills: ['persuasion', 'conflictResolution'],
          requiredLevel: 30,
          topics: ['negotiation', 'deadline management', 'assertive communication']
        },
        {
          id: 'PERS-002',
          title: 'Stakeholder Management',
          description: 'Gestión efectiva de expectativas y comunicación con stakeholders',
          difficulty: 'advanced',
          duration: '60 min',
          priority: 'high',
          skills: ['persuasion', 'empathy'],
          requiredLevel: 25,
          topics: ['stakeholder relations', 'expectation management', 'influence']
        },
        {
          id: 'PERS-003',
          title: 'Pitch Perfect: Selling Your Ideas',
          description: 'Cómo presentar ideas con impacto y convicción',
          difficulty: 'intermediate',
          duration: '50 min',
          priority: 'medium',
          skills: ['persuasion', 'technicalClarity'],
          requiredLevel: 20,
          topics: ['presentation', 'storytelling', 'confidence building']
        },
        {
          id: 'PERS-004',
          title: 'Influencing Without Authority',
          description: 'Técnicas de persuasión lateral en organizaciones',
          difficulty: 'advanced',
          duration: '55 min',
          priority: 'medium',
          skills: ['persuasion', 'empathy', 'conflictResolution'],
          requiredLevel: 35,
          topics: ['lateral influence', 'organizational dynamics', 'soft power']
        }
      ],
      technicalClarity: [
        {
          id: 'TECH-001',
          title: 'Eliminating Filler Words',
          description: 'Estrategias para hablar con claridad sin muletillas',
          difficulty: 'beginner',
          duration: '30 min',
          priority: 'high',
          skills: ['technicalClarity', 'brevity'],
          requiredLevel: 0,
          topics: ['speech clarity', 'filler elimination', 'mindful speaking']
        },
        {
          id: 'TECH-002',
          title: 'Technical Documentation Best Practices',
          description: 'Comunicación técnica clara y estructurada',
          difficulty: 'intermediate',
          duration: '45 min',
          priority: 'medium',
          skills: ['technicalClarity', 'brevity'],
          requiredLevel: 25,
          topics: ['documentation', 'technical writing', 'structure']
        },
        {
          id: 'TECH-003',
          title: 'Explaining Complex Concepts Simply',
          description: 'Simplificación de ideas técnicas para audiencias diversas',
          difficulty: 'intermediate',
          duration: '50 min',
          priority: 'high',
          skills: ['technicalClarity', 'empathy'],
          requiredLevel: 30,
          topics: ['simplification', 'audience awareness', 'analogies']
        },
        {
          id: 'TECH-004',
          title: 'Structured Thinking Framework',
          description: 'Frameworks para organizar información técnica',
          difficulty: 'advanced',
          duration: '60 min',
          priority: 'medium',
          skills: ['technicalClarity'],
          requiredLevel: 40,
          topics: ['frameworks', 'logical structure', 'pyramid principle']
        }
      ],
      empathy: [
        {
          id: 'EMPA-001',
          title: 'Active Listening Masterclass',
          description: 'Técnicas de escucha activa para mejor conexión',
          difficulty: 'beginner',
          duration: '35 min',
          priority: 'high',
          skills: ['empathy', 'conflictResolution'],
          requiredLevel: 0,
          topics: ['active listening', 'empathy building', 'connection']
        },
        {
          id: 'EMPA-002',
          title: 'Emotional Intelligence in Business',
          description: 'Inteligencia emocional aplicada al entorno profesional',
          difficulty: 'intermediate',
          duration: '55 min',
          priority: 'high',
          skills: ['empathy', 'conflictResolution'],
          requiredLevel: 25,
          topics: ['emotional intelligence', 'self-awareness', 'social skills']
        },
        {
          id: 'EMPA-003',
          title: 'Cross-Cultural Communication',
          description: 'Comunicación efectiva en entornos multiculturales',
          difficulty: 'advanced',
          duration: '60 min',
          priority: 'medium',
          skills: ['empathy', 'persuasion'],
          requiredLevel: 35,
          topics: ['cultural awareness', 'diversity', 'global communication']
        },
        {
          id: 'EMPA-004',
          title: 'Giving and Receiving Feedback',
          description: 'Feedback constructivo con empatía y asertividad',
          difficulty: 'intermediate',
          duration: '40 min',
          priority: 'medium',
          skills: ['empathy', 'conflictResolution'],
          requiredLevel: 30,
          topics: ['feedback', 'constructive criticism', 'growth mindset']
        }
      ],
      conflictResolution: [
        {
          id: 'CONF-001',
          title: 'Difficult Conversations Framework',
          description: 'Cómo manejar conversaciones difíciles con profesionalismo',
          difficulty: 'intermediate',
          duration: '50 min',
          priority: 'high',
          skills: ['conflictResolution', 'empathy'],
          requiredLevel: 25,
          topics: ['difficult conversations', 'conflict management', 'resolution strategies']
        },
        {
          id: 'CONF-002',
          title: 'Mediation and Negotiation Skills',
          description: 'Técnicas de mediación en conflictos laborales',
          difficulty: 'advanced',
          duration: '65 min',
          priority: 'high',
          skills: ['conflictResolution', 'persuasion'],
          requiredLevel: 35,
          topics: ['mediation', 'negotiation', 'win-win solutions']
        },
        {
          id: 'CONF-003',
          title: 'De-escalation Techniques',
          description: 'Estrategias para desescalar situaciones tensas',
          difficulty: 'intermediate',
          duration: '40 min',
          priority: 'medium',
          skills: ['conflictResolution', 'empathy'],
          requiredLevel: 20,
          topics: ['de-escalation', 'tension management', 'calm communication']
        },
        {
          id: 'CONF-004',
          title: 'Building Consensus in Teams',
          description: 'Construir consenso y alinear equipos diversos',
          difficulty: 'advanced',
          duration: '55 min',
          priority: 'medium',
          skills: ['conflictResolution', 'persuasion', 'empathy'],
          requiredLevel: 40,
          topics: ['consensus building', 'team alignment', 'collaborative decision-making']
        }
      ],
      brevity: [
        {
          id: 'BREV-001',
          title: 'The Art of Concise Communication',
          description: 'Comunicar más con menos palabras',
          difficulty: 'beginner',
          duration: '30 min',
          priority: 'high',
          skills: ['brevity', 'technicalClarity'],
          requiredLevel: 0,
          topics: ['conciseness', 'editing', 'clarity']
        },
        {
          id: 'BREV-002',
          title: 'Executive Summary Writing',
          description: 'Crear resúmenes ejecutivos impactantes',
          difficulty: 'intermediate',
          duration: '45 min',
          priority: 'medium',
          skills: ['brevity', 'persuasion'],
          requiredLevel: 30,
          topics: ['executive communication', 'synthesis', 'key messages']
        },
        {
          id: 'BREV-003',
          title: 'Elevator Pitch Mastery',
          description: 'Perfeccionar tu pitch de 30 segundos',
          difficulty: 'intermediate',
          duration: '35 min',
          priority: 'high',
          skills: ['brevity', 'persuasion'],
          requiredLevel: 25,
          topics: ['elevator pitch', 'quick communication', 'impact']
        },
        {
          id: 'BREV-004',
          title: 'Meeting Efficiency Strategies',
          description: 'Comunicación efectiva en reuniones breves',
          difficulty: 'intermediate',
          duration: '40 min',
          priority: 'medium',
          skills: ['brevity', 'technicalClarity'],
          requiredLevel: 20,
          topics: ['meeting efficiency', 'time management', 'focused communication']
        }
      ]
    };
  }

  /**
   * Genera una ruta de aprendizaje personalizada basada en soft skills
   * @param {Object} softSkills - Scores de las 5 soft skills (0-100)
   * @param {Object} userProfile - Perfil del usuario (opcional)
   * @returns {Object} - Ruta de aprendizaje con lecciones priorizadas
   */
  generateLearningPath(softSkills, userProfile = {}) {
    // 1. Identificar áreas de mejora (scores bajos)
    const weakAreas = this.identifyWeakAreas(softSkills);
    
    // 2. Identificar fortalezas (scores altos)
    const strengths = this.identifyStrengths(softSkills);
    
    // 3. Calcular prioridades de aprendizaje
    const priorities = this.calculatePriorities(weakAreas, strengths, userProfile);
    
    // 4. Seleccionar lecciones apropiadas
    const weeklyPlan = this.selectLessons(priorities, softSkills, 5); // Top 5 lecciones
    const monthlyGoals = this.generateMonthlyGoals(weakAreas, softSkills);
    
    // 5. Generar recomendaciones personalizadas
    const recommendations = this.generateRecommendations(weakAreas, strengths);
    
    return {
      profile: {
        currentLevel: this.calculateOverallLevel(softSkills),
        strengths,
        weakAreas,
        priorities
      },
      weeklyPlan,
      monthlyGoals,
      recommendations,
      estimatedProgress: this.estimateProgress(softSkills, weeklyPlan)
    };
  }

  /**
   * Identifica áreas que necesitan mejora (scores < 60)
   */
  identifyWeakAreas(softSkills) {
    const areas = [];
    const threshold = 60;

    for (const [skill, score] of Object.entries(softSkills)) {
      if (score < threshold) {
        areas.push({
          skill,
          score,
          gap: threshold - score,
          priority: this.calculatePriorityLevel(score)
        });
      }
    }

    // Ordenar por prioridad (gaps más grandes primero)
    return areas.sort((a, b) => b.gap - a.gap);
  }

  /**
   * Identifica fortalezas (scores >= 70)
   */
  identifyStrengths(softSkills) {
    const strengths = [];
    const threshold = 70;

    for (const [skill, score] of Object.entries(softSkills)) {
      if (score >= threshold) {
        strengths.push({
          skill,
          score,
          level: this.getSkillLevel(score)
        });
      }
    }

    return strengths.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcula nivel de prioridad basado en el score
   */
  calculatePriorityLevel(score) {
    if (score < 30) return 'critical';
    if (score < 50) return 'high';
    if (score < 70) return 'medium';
    return 'low';
  }

  /**
   * Obtiene nivel de habilidad basado en score
   */
  getSkillLevel(score) {
    if (score >= 90) return 'expert';
    if (score >= 75) return 'advanced';
    if (score >= 60) return 'intermediate';
    if (score >= 40) return 'beginner';
    return 'novice';
  }

  /**
   * Calcula prioridades de aprendizaje considerando el contexto
   */
  calculatePriorities(weakAreas, strengths, userProfile) {
    const priorities = {};

    weakAreas.forEach(area => {
      let priorityScore = 100 - area.score; // Inversamente proporcional al score

      // Bonus si es completamente crítico
      if (area.priority === 'critical') priorityScore += 20;
      if (area.priority === 'high') priorityScore += 10;

      // Ajuste por perfil de usuario
      if (userProfile.role === 'manager' && area.skill === 'persuasion') {
        priorityScore += 15;
      }
      if (userProfile.role === 'developer' && area.skill === 'technicalClarity') {
        priorityScore += 15;
      }

      priorities[area.skill] = Math.min(100, priorityScore);
    });

    return priorities;
  }

  /**
   * Selecciona lecciones apropiadas basadas en prioridades
   */
  selectLessons(priorities, softSkills, limit = 5) {
    const selectedLessons = [];
    const skillNames = {
      persuasion: 'persuasion',
      technicalClarity: 'technicalClarity',
      empathy: 'empathy',
      conflictResolution: 'conflictResolution',
      brevity: 'brevity'
    };

    // Obtener lecciones de las áreas prioritarias
    for (const [skill, priorityScore] of Object.entries(priorities)) {
      const skillKey = skillNames[skill];
      const lessons = this.lessonsCatalog[skillKey] || [];
      const currentScore = softSkills[skill];

      lessons.forEach(lesson => {
        // Verificar si el usuario cumple el nivel requerido
        if (currentScore >= lesson.requiredLevel - 10) { // Margen de -10
          selectedLessons.push({
            ...lesson,
            targetSkill: skill,
            priorityScore,
            relevanceScore: this.calculateRelevance(lesson, currentScore, priorityScore)
          });
        }
      });
    }

    // Ordenar por relevancia y prioridad
    selectedLessons.sort((a, b) => {
      // Primero por prioridad de la lección
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Luego por relevance score
      return b.relevanceScore - a.relevanceScore;
    });

    // Retornar top N lecciones
    return selectedLessons.slice(0, limit).map((lesson, index) => ({
      ...lesson,
      weekOrder: index + 1,
      estimatedImpact: this.estimateImpact(lesson, softSkills[lesson.targetSkill])
    }));
  }

  /**
   * Calcula relevancia de una lección
   */
  calculateRelevance(lesson, currentScore, priorityScore) {
    let relevance = priorityScore;

    // Bonus por alta prioridad
    if (lesson.priority === 'high') relevance += 15;
    if (lesson.priority === 'medium') relevance += 5;

    // Ajuste por dificultad apropiada
    if (currentScore < 40 && lesson.difficulty === 'beginner') relevance += 10;
    if (currentScore >= 40 && currentScore < 70 && lesson.difficulty === 'intermediate') relevance += 10;
    if (currentScore >= 70 && lesson.difficulty === 'advanced') relevance += 10;

    return relevance;
  }

  /**
   * Estima el impacto de completar una lección
   */
  estimateImpact(lesson, currentScore) {
    const difficultyImpact = {
      beginner: 5,
      intermediate: 8,
      advanced: 12
    };

    const baseImpact = difficultyImpact[lesson.difficulty] || 5;
    
    // El impacto es mayor si el score actual es bajo
    const scoreMultiplier = currentScore < 50 ? 1.5 : currentScore < 70 ? 1.2 : 1.0;
    
    const estimatedGain = Math.round(baseImpact * scoreMultiplier);
    const projectedScore = Math.min(100, currentScore + estimatedGain);

    return {
      estimatedGain: `+${estimatedGain}`,
      projectedScore,
      timeframe: lesson.duration
    };
  }

  /**
   * Genera objetivos mensuales
   */
  generateMonthlyGoals(weakAreas, softSkills) {
    const goals = [];

    weakAreas.forEach(area => {
      const currentScore = area.score;
      const targetScore = Math.min(100, currentScore + 20); // Meta: +20 puntos

      goals.push({
        skill: area.skill,
        currentScore,
        targetScore,
        improvement: 20,
        status: 'in-progress',
        milestones: this.generateMilestones(currentScore, targetScore)
      });
    });

    return goals;
  }

  /**
   * Genera hitos intermedios
   */
  generateMilestones(current, target) {
    const milestones = [];
    const gap = target - current;
    const steps = 4; // 4 hitos por mes (uno por semana)

    for (let i = 1; i <= steps; i++) {
      milestones.push({
        week: i,
        targetScore: Math.round(current + (gap * i / steps)),
        completed: false
      });
    }

    return milestones;
  }

  /**
   * Genera recomendaciones personalizadas
   */
  generateRecommendations(weakAreas, strengths) {
    const recommendations = [];

    // Recomendaciones basadas en debilidades
    if (weakAreas.length > 0) {
      const weakest = weakAreas[0];
      
      const messages = {
        persuasion: '🎯 Enfócate en desarrollar habilidades de persuasión. Practica técnicas de negociación y presentación de ideas.',
        technicalClarity: '💻 Trabaja en claridad técnica. Elimina muletillas y estructura tus pensamientos antes de hablar.',
        empathy: '❤️ Desarrolla tu inteligencia emocional. Practica escucha activa y busca entender perspectivas diferentes.',
        conflictResolution: '🤝 Mejora tu manejo de conflictos. Aprende técnicas de mediación y comunicación no violenta.',
        brevity: '⚡ Practica la concisión. Edita tus mensajes para transmitir ideas complejas de forma breve.'
      };

      recommendations.push({
        type: 'priority',
        message: messages[weakest.skill] || 'Continúa mejorando tus habilidades de comunicación.',
        action: 'Completa las lecciones semanales recomendadas'
      });
    }

    // Recomendaciones basadas en fortalezas
    if (strengths.length > 0) {
      const strongest = strengths[0];
      
      recommendations.push({
        type: 'leverage',
        message: `✨ Aprovecha tu fortaleza en ${strongest.skill}. Úsala como base para desarrollar otras habilidades relacionadas.`,
        action: 'Considera lecciones avanzadas en esta área'
      });
    }

    // Recomendación de balance
    if (weakAreas.length > 2) {
      recommendations.push({
        type: 'balance',
        message: '⚖️ Enfócate en una o dos habilidades a la vez para ver progreso significativo.',
        action: 'Prioriza las 2 áreas más críticas este mes'
      });
    }

    return recommendations;
  }

  /**
   * Calcula nivel general del usuario
   */
  calculateOverallLevel(softSkills) {
    const scores = Object.values(softSkills);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      score: Math.round(average),
      level: this.getSkillLevel(average),
      distribution: {
        expert: scores.filter(s => s >= 90).length,
        advanced: scores.filter(s => s >= 75 && s < 90).length,
        intermediate: scores.filter(s => s >= 60 && s < 75).length,
        beginner: scores.filter(s => s >= 40 && s < 60).length,
        novice: scores.filter(s => s < 40).length
      }
    };
  }

  /**
   * Estima progreso esperado
   */
  estimateProgress(softSkills, weeklyPlan) {
    const totalImpact = weeklyPlan.reduce((sum, lesson) => {
      return sum + parseInt(lesson.estimatedImpact.estimatedGain.replace('+', ''));
    }, 0);

    const currentAvg = Object.values(softSkills).reduce((sum, score) => sum + score, 0) / 5;
    const projectedAvg = Math.min(100, currentAvg + (totalImpact / weeklyPlan.length));

    return {
      current: Math.round(currentAvg),
      projected: Math.round(projectedAvg),
      improvement: Math.round(projectedAvg - currentAvg),
      timeframe: '1 semana',
      confidence: 'high'
    };
  }
}

module.exports = LearningPathEngine;
