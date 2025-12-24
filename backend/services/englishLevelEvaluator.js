/**
 * ENGLISH LEVEL EVALUATOR
 * Evalúa el nivel de inglés (B1 a C2) basado en Lexical Density
 * y complejidad de estructuras gramaticales
 */

const natural = require('natural');

class EnglishLevelEvaluator {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    
    // Palabras comunes (no cuentan para lexical diversity)
    this.commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
      'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did',
      'am', 'very', 'where', 'much', 'before', 'through', 'another', 'too', 'own'
    ]);

    // Conectores avanzados por nivel
    this.advancedConnectors = {
      B2: ['however', 'moreover', 'furthermore', 'therefore', 'consequently', 'nevertheless'],
      C1: ['nonetheless', 'whereby', 'whereas', 'henceforth', 'notwithstanding', 'albeit'],
      C2: ['insofar', 'heretofore', 'inasmuch', 'vis-à-vis', 'ergo', 'ipso facto']
    };

    // Estructuras gramaticales complejas
    this.complexPatterns = {
      // Cláusulas relativas
      relativeClauses: /\b(which|that|who|whom|whose|where|when)\b/gi,
      
      // Verbos modales avanzados
      advancedModals: /\b(ought to|would rather|had better|would have|should have|could have|might have)\b/gi,
      
      // Voz pasiva
      passiveVoice: /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
      
      // Condicionales complejos
      conditionals: /\b(if|unless|provided that|as long as|in case|whether)\b/gi,
      
      // Subjuntivo
      subjunctive: /\b(suggest|recommend|insist|demand|require)\s+that\b/gi,
      
      // Gerundios e infinitivos complejos
      complexVerbs: /\b(avoid|consider|enjoy|finish|keep|mind|practice|suggest)\s+\w+ing\b/gi
    };

    // Vocabulario académico/avanzado (Academic Word List subset)
    this.academicVocabulary = new Set([
      'analyze', 'approach', 'assess', 'concept', 'constitute', 'context', 'create',
      'data', 'define', 'derive', 'distribute', 'economy', 'environment', 'establish',
      'estimate', 'evaluate', 'evident', 'factor', 'function', 'identify', 'indicate',
      'individual', 'interpret', 'involve', 'issue', 'labor', 'legal', 'major', 'method',
      'occur', 'percent', 'period', 'policy', 'principle', 'proceed', 'process', 'require',
      'research', 'respond', 'role', 'section', 'significant', 'similar', 'source', 'specific',
      'structure', 'theory', 'vary', 'achieve', 'acquire', 'administrate', 'affect', 'appropriate',
      'aspect', 'assist', 'assume', 'authority', 'available', 'benefit', 'category', 'chapter',
      'commission', 'community', 'complex', 'compute', 'conclude', 'conduct', 'consequent',
      'consist', 'constant', 'constitute', 'contract', 'contribute', 'convention', 'coordinate'
    ]);
  }

  /**
   * Evalúa el nivel de inglés del texto
   * @param {string} text - Texto en inglés a evaluar
   * @returns {Object} - Evaluación completa con nivel CEFR y recomendaciones
   */
  evaluate(text) {
    if (!text || text.trim().length === 0) {
      return this.getDefaultEvaluation();
    }

    // 1. Análisis léxico
    const lexicalAnalysis = this.analyzeLexicalDensity(text);
    
    // 2. Análisis de complejidad gramatical
    const grammaticalComplexity = this.analyzeGrammaticalComplexity(text);
    
    // 3. Análisis de estructura de oraciones
    const sentenceStructure = this.analyzeSentenceStructure(text);
    
    // 4. Determinar nivel CEFR
    const cefrLevel = this.determineCEFRLevel(
      lexicalAnalysis,
      grammaticalComplexity,
      sentenceStructure
    );
    
    // 5. Generar ejercicios recomendados
    const exercises = this.generateExercises(cefrLevel, sentenceStructure, grammaticalComplexity);
    
    // 6. Generar feedback específico
    const feedback = this.generateFeedback(cefrLevel, lexicalAnalysis, grammaticalComplexity);

    return {
      cefrLevel: cefrLevel.level,
      cefrDescription: cefrLevel.description,
      score: cefrLevel.score,
      lexicalAnalysis,
      grammaticalComplexity,
      sentenceStructure,
      exercises,
      feedback,
      strengths: this.identifyStrengths(lexicalAnalysis, grammaticalComplexity),
      weaknesses: this.identifyWeaknesses(lexicalAnalysis, grammaticalComplexity, sentenceStructure)
    };
  }

  /**
   * Analiza la densidad léxica (Lexical Density)
   * Formula: (Unique Content Words / Total Words) * 100
   */
  analyzeLexicalDensity(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const totalWords = words.length;

    // Filtrar palabras de contenido (excluir palabras comunes)
    const contentWords = words.filter(word => !this.commonWords.has(word) && word.length > 2);
    const uniqueContentWords = new Set(contentWords);

    // Calcular lexical density
    const lexicalDensity = (contentWords.length / totalWords) * 100;
    const lexicalDiversity = (uniqueContentWords.size / contentWords.length) * 100;

    // Detectar vocabulario académico
    const academicWords = contentWords.filter(word => this.academicVocabulary.has(word));
    const academicWordPercentage = (academicWords.length / contentWords.length) * 100;

    // Calcular promedio de longitud de palabras (indicador de sofisticación)
    const avgWordLength = contentWords.reduce((sum, word) => sum + word.length, 0) / contentWords.length;

    return {
      totalWords,
      contentWords: contentWords.length,
      uniqueWords: uniqueContentWords.size,
      lexicalDensity: Math.round(lexicalDensity * 10) / 10,
      lexicalDiversity: Math.round(lexicalDiversity * 10) / 10,
      academicWords: academicWords.length,
      academicPercentage: Math.round(academicWordPercentage * 10) / 10,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      sophisticationScore: this.calculateSophisticationScore(
        lexicalDensity,
        lexicalDiversity,
        academicWordPercentage,
        avgWordLength
      )
    };
  }

  /**
   * Calcula score de sofisticación léxica
   */
  calculateSophisticationScore(density, diversity, academic, avgLength) {
    let score = 0;

    // Lexical Density (peso: 30%)
    if (density >= 60) score += 30;
    else if (density >= 50) score += 25;
    else if (density >= 40) score += 20;
    else score += 10;

    // Lexical Diversity (peso: 30%)
    if (diversity >= 80) score += 30;
    else if (diversity >= 70) score += 25;
    else if (diversity >= 60) score += 20;
    else score += 10;

    // Academic Vocabulary (peso: 25%)
    if (academic >= 15) score += 25;
    else if (academic >= 10) score += 20;
    else if (academic >= 5) score += 15;
    else score += 5;

    // Average Word Length (peso: 15%)
    if (avgLength >= 6) score += 15;
    else if (avgLength >= 5) score += 12;
    else if (avgLength >= 4.5) score += 8;
    else score += 5;

    return Math.round(score);
  }

  /**
   * Analiza la complejidad gramatical
   */
  analyzeGrammaticalComplexity(text) {
    const complexity = {
      relativeClauses: 0,
      advancedModals: 0,
      passiveVoice: 0,
      conditionals: 0,
      subjunctive: 0,
      complexVerbs: 0
    };

    // Contar cada patrón
    for (const [pattern, regex] of Object.entries(this.complexPatterns)) {
      const matches = text.match(regex);
      complexity[pattern] = matches ? matches.length : 0;
    }

    // Detectar conectores avanzados
    const connectors = this.detectAdvancedConnectors(text);

    // Calcular score de complejidad
    const complexityScore = this.calculateComplexityScore(complexity, connectors);

    return {
      ...complexity,
      connectors,
      totalComplexStructures: Object.values(complexity).reduce((sum, val) => sum + val, 0),
      complexityScore,
      level: this.getComplexityLevel(complexityScore)
    };
  }

  /**
   * Detecta conectores avanzados
   */
  detectAdvancedConnectors(text) {
    const lowercaseText = text.toLowerCase();
    const found = {
      B2: [],
      C1: [],
      C2: []
    };

    for (const [level, connectors] of Object.entries(this.advancedConnectors)) {
      connectors.forEach(connector => {
        if (lowercaseText.includes(connector)) {
          found[level].push(connector);
        }
      });
    }

    return {
      B2: found.B2,
      C1: found.C1,
      C2: found.C2,
      total: found.B2.length + found.C1.length + found.C2.length
    };
  }

  /**
   * Calcula score de complejidad gramatical
   */
  calculateComplexityScore(complexity, connectors) {
    let score = 0;

    // Cada estructura compleja suma puntos
    score += complexity.relativeClauses * 3;
    score += complexity.advancedModals * 4;
    score += complexity.passiveVoice * 3;
    score += complexity.conditionals * 3;
    score += complexity.subjunctive * 5;
    score += complexity.complexVerbs * 4;

    // Conectores avanzados
    score += connectors.B2.length * 5;
    score += connectors.C1.length * 8;
    score += connectors.C2.length * 12;

    // Normalizar a 0-100
    return Math.min(100, score);
  }

  /**
   * Obtiene nivel de complejidad
   */
  getComplexityLevel(score) {
    if (score >= 80) return 'C2';
    if (score >= 60) return 'C1';
    if (score >= 40) return 'B2';
    return 'B1';
  }

  /**
   * Analiza estructura de oraciones (detecta frases simples S+V+O)
   */
  analyzeSentenceStructure(text) {
    const sentences = this.sentenceTokenizer.tokenize(text);
    
    let simpleStructures = 0;
    let complexStructures = 0;
    let compoundStructures = 0;

    const avgWordsPerSentence = this.tokenizer.tokenize(text).length / sentences.length;

    sentences.forEach(sentence => {
      const wordCount = this.tokenizer.tokenize(sentence).length;
      
      // Heurística: oraciones muy cortas suelen ser simples (S+V+O)
      if (wordCount <= 8) {
        // Verificar si tiene estructura simple básica
        if (!this.hasComplexStructure(sentence)) {
          simpleStructures++;
        }
      } else if (wordCount <= 15) {
        compoundStructures++;
      } else {
        complexStructures++;
      }
    });

    const simplePercentage = (simpleStructures / sentences.length) * 100;

    return {
      totalSentences: sentences.length,
      simpleStructures,
      compoundStructures,
      complexStructures,
      simplePercentage: Math.round(simplePercentage * 10) / 10,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      isPredomSimple: simplePercentage > 60 // Más del 60% son simples
    };
  }

  /**
   * Verifica si una oración tiene estructura compleja
   */
  hasComplexStructure(sentence) {
    const complexIndicators = [
      /\b(which|that|who|whom|whose)\b/i,
      /\b(although|though|whereas|while|since)\b/i,
      /\b(if|unless|provided|whether)\b/i,
      /[,;:]/, // Puntuación compleja
      /\b(not only|but also|either|neither)\b/i
    ];

    return complexIndicators.some(pattern => pattern.test(sentence));
  }

  /**
   * Determina el nivel CEFR final
   */
  determineCEFRLevel(lexical, grammatical, structure) {
    let score = 0;

    // Lexical Sophistication (40% del peso)
    score += lexical.sophisticationScore * 0.4;

    // Grammatical Complexity (40% del peso)
    score += grammatical.complexityScore * 0.4;

    // Sentence Structure (20% del peso)
    const structureScore = structure.isPredomSimple ? 10 : 
                          (100 - structure.simplePercentage);
    score += structureScore * 0.2;

    // Si predominan estructuras simples, limitar a B1
    if (structure.isPredomSimple && structure.simplePercentage > 70) {
      return {
        level: 'B1',
        description: 'Intermediate - Simple sentence structures dominate',
        score: Math.min(score, 40),
        reason: 'Predominantly simple S+V+O structures detected'
      };
    }

    // Determinar nivel basado en score final
    let level, description;
    
    if (score >= 80) {
      level = 'C2';
      description = 'Proficiency - Advanced vocabulary and complex structures';
    } else if (score >= 65) {
      level = 'C1';
      description = 'Advanced - Sophisticated language with varied structures';
    } else if (score >= 50) {
      level = 'B2';
      description = 'Upper Intermediate - Good vocabulary and some complex structures';
    } else {
      level = 'B1';
      description = 'Intermediate - Basic structures with limited complexity';
    }

    return {
      level,
      description,
      score: Math.round(score),
      reason: this.getScoreReason(lexical, grammatical, structure)
    };
  }

  /**
   * Genera razón del score
   */
  getScoreReason(lexical, grammatical, structure) {
    const reasons = [];

    if (lexical.sophisticationScore >= 70) {
      reasons.push('strong vocabulary diversity');
    } else if (lexical.sophisticationScore < 40) {
      reasons.push('limited vocabulary range');
    }

    if (grammatical.complexityScore >= 60) {
      reasons.push('effective use of complex grammar');
    } else if (grammatical.complexityScore < 30) {
      reasons.push('basic grammatical structures');
    }

    if (structure.isPredomSimple) {
      reasons.push('predominantly simple sentence structures');
    } else if (structure.complexStructures > structure.simpleStructures) {
      reasons.push('sophisticated sentence construction');
    }

    return reasons.join(', ');
  }

  /**
   * Genera ejercicios recomendados basados en el nivel
   */
  generateExercises(cefrLevel, structure, grammatical) {
    const exercises = [];

    // Para B1 con estructuras simples, recomendar conectores complejos
    if (cefrLevel.level === 'B1' && structure.isPredomSimple) {
      exercises.push({
        id: 'CONN-B1-001',
        title: 'Complex Connectors: However, Nonetheless, Therefore',
        description: 'Master advanced connectors to link ideas more sophisticatedly',
        focus: 'connectors',
        difficulty: 'B1-B2',
        priority: 'high',
        exercises: [
          'Practice using "however" to contrast ideas: "The project was challenging; however, we completed it on time."',
          'Use "nonetheless" for emphasis: "The budget was tight; nonetheless, we achieved excellent results."',
          'Apply "therefore" for logical conclusions: "Sales increased by 30%; therefore, we expanded the team."',
          'Try "moreover" to add information: "The product is innovative; moreover, it\'s cost-effective."'
        ],
        estimatedTime: '30 min',
        goal: 'Reduce simple sentence percentage from ' + structure.simplePercentage + '% to below 50%'
      });
    }

    // Ejercicios según deficiencias detectadas
    if (grammatical.relativeClauses < 2) {
      exercises.push({
        id: 'GRAM-REL-001',
        title: 'Relative Clauses: Which, That, Who',
        description: 'Add detail and sophistication with relative clauses',
        focus: 'relative-clauses',
        difficulty: cefrLevel.level === 'B1' ? 'B1-B2' : 'B2-C1',
        priority: 'medium',
        exercises: [
          'Combine sentences: "The report was comprehensive. It was written by Sarah." → "The report, which was written by Sarah, was comprehensive."',
          'Practice defining clauses: "Employees who demonstrate initiative are promoted quickly."',
          'Use non-defining clauses: "Our CEO, who has 20 years of experience, will speak tomorrow."'
        ],
        estimatedTime: '25 min',
        goal: 'Incorporate at least 2-3 relative clauses per paragraph'
      });
    }

    if (grammatical.passiveVoice < 1 && cefrLevel.level !== 'B1') {
      exercises.push({
        id: 'GRAM-PASS-001',
        title: 'Passive Voice for Formal Writing',
        description: 'Use passive constructions for academic and professional contexts',
        focus: 'passive-voice',
        difficulty: 'B2-C1',
        priority: 'medium',
        exercises: [
          'Transform active to passive: "The team completed the project" → "The project was completed by the team"',
          'Use passive for processes: "The data is analyzed using advanced algorithms"',
          'Academic style: "It has been demonstrated that..."'
        ],
        estimatedTime: '20 min',
        goal: 'Use passive voice appropriately in formal contexts'
      });
    }

    if (cefrLevel.level === 'B2' || cefrLevel.level === 'B1') {
      exercises.push({
        id: 'VOCAB-ADV-001',
        title: 'Academic Vocabulary Building',
        description: 'Expand your vocabulary with academic and professional terms',
        focus: 'vocabulary',
        difficulty: 'B2-C1',
        priority: 'high',
        exercises: [
          'Learn 5 academic words daily: analyze, establish, demonstrate, indicate, contribute',
          'Replace common words: "show" → "demonstrate", "give" → "provide", "make" → "create"',
          'Use collocations: "conduct research", "implement strategies", "achieve objectives"'
        ],
        estimatedTime: '15 min/day',
        goal: 'Increase academic vocabulary usage to 10%+'
      });
    }

    if (grammatical.conditionals < 1) {
      exercises.push({
        id: 'GRAM-COND-001',
        title: 'Conditional Structures',
        description: 'Express hypotheticals and conditions with sophistication',
        focus: 'conditionals',
        difficulty: 'B2-C1',
        priority: 'medium',
        exercises: [
          'First conditional: "If we increase marketing, we will gain more clients"',
          'Second conditional: "If I were the manager, I would implement these changes"',
          'Third conditional: "If we had invested earlier, we would have seen better returns"',
          'Mixed conditionals: "If she had studied harder, she would be a doctor now"'
        ],
        estimatedTime: '30 min',
        goal: 'Master all conditional types for complex hypothetical reasoning'
      });
    }

    return exercises;
  }

  /**
   * Genera feedback específico
   */
  generateFeedback(cefrLevel, lexical, grammatical) {
    const feedback = [];

    // Feedback léxico
    if (lexical.lexicalDensity < 40) {
      feedback.push({
        type: 'lexical',
        message: '📚 Your vocabulary range needs expansion. Currently ' + lexical.lexicalDensity + '% lexical density.',
        suggestion: 'Read more advanced texts and note down new vocabulary. Aim for 50%+ lexical density.'
      });
    } else if (lexical.lexicalDensity >= 50) {
      feedback.push({
        type: 'lexical',
        message: '✨ Good vocabulary diversity (' + lexical.lexicalDensity + '%)! Keep expanding your range.',
        suggestion: 'Continue reading and using varied vocabulary in your communication.'
      });
    }

    // Feedback gramatical
    if (grammatical.complexityScore < 30) {
      feedback.push({
        type: 'grammatical',
        message: '📝 Your grammar is mostly basic. Complexity score: ' + grammatical.complexityScore + '/100.',
        suggestion: 'Practice using relative clauses, passive voice, and advanced connectors.'
      });
    } else if (grammatical.complexityScore >= 60) {
      feedback.push({
        type: 'grammatical',
        message: '🎯 Excellent grammatical complexity! Score: ' + grammatical.complexityScore + '/100.',
        suggestion: 'Maintain this level and explore more advanced structures like subjunctive mood.'
      });
    }

    // Feedback de nivel general
    feedback.push({
      type: 'overall',
      message: `Your current CEFR level is ${cefrLevel.level} (${cefrLevel.description})`,
      suggestion: cefrLevel.level === 'B1' 
        ? 'Focus on expanding vocabulary and using complex connectors to reach B2.'
        : cefrLevel.level === 'B2'
        ? 'Work on advanced grammar structures and academic vocabulary to reach C1.'
        : 'Excellent! Continue refining your language for C2 proficiency.'
    });

    return feedback;
  }

  /**
   * Identifica fortalezas
   */
  identifyStrengths(lexical, grammatical) {
    const strengths = [];

    if (lexical.lexicalDiversity >= 70) {
      strengths.push('Strong vocabulary diversity');
    }
    if (lexical.academicPercentage >= 10) {
      strengths.push('Good use of academic vocabulary');
    }
    if (grammatical.complexityScore >= 50) {
      strengths.push('Competent use of complex grammar');
    }
    if (grammatical.connectors.total >= 2) {
      strengths.push('Effective use of advanced connectors');
    }

    return strengths.length > 0 ? strengths : ['Basic communication skills'];
  }

  /**
   * Identifica debilidades
   */
  identifyWeaknesses(lexical, grammatical, structure) {
    const weaknesses = [];

    if (structure.isPredomSimple) {
      weaknesses.push('Predominantly simple sentence structures (S+V+O)');
    }
    if (lexical.lexicalDensity < 40) {
      weaknesses.push('Limited vocabulary range');
    }
    if (grammatical.complexityScore < 30) {
      weaknesses.push('Basic grammatical structures only');
    }
    if (grammatical.connectors.total === 0) {
      weaknesses.push('Lack of advanced connectors');
    }
    if (lexical.academicPercentage < 5) {
      weaknesses.push('Limited academic vocabulary');
    }

    return weaknesses.length > 0 ? weaknesses : ['Continue developing all language skills'];
  }

  /**
   * Retorna evaluación por defecto
   */
  getDefaultEvaluation() {
    return {
      cefrLevel: 'N/A',
      cefrDescription: 'Insufficient text for evaluation',
      score: 0,
      lexicalAnalysis: {},
      grammaticalComplexity: {},
      sentenceStructure: {},
      exercises: [],
      feedback: [],
      strengths: [],
      weaknesses: []
    };
  }
}

module.exports = EnglishLevelEvaluator;
