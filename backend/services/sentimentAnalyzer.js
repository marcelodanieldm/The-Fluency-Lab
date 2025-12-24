const natural = require('natural');
const Sentiment = require('sentiment');
const EnglishLevelEvaluator = require('./englishLevelEvaluator');
const ErrorPatternAnalyzer = require('./errorPatternAnalyzer');

class SentimentAnalyzer {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.englishEvaluator = new EnglishLevelEvaluator();
    this.errorAnalyzer = ErrorPatternAnalyzer;
  }

  /**
   * Analiza la transcripción y devuelve tono, confidence score y consejos
   * @param {string} transcription - Texto a analizar
   * @param {string} language - Idioma del texto ('es' o 'en')
   * @returns {Object} - Resultado del análisis
   */
  async analyze(transcription, language = 'es') {
    // 1. Análisis de sentimiento base
    const sentimentScore = this.sentiment.analyze(transcription);
    
    // 2. Identificar el tono
    const tone = this.identifyTone(transcription, sentimentScore, language);
    
    // 3. Calcular confidence score
    const confidenceScore = this.calculateConfidenceScore(transcription, tone);
    
    // 4. Generar consejos de comunicación asertiva
    const advice = this.generateAdvice(tone, confidenceScore, language);
    
    // 5. Detectar palabras de relleno y muletillas
    const fillerWords = this.detectFillerWords(transcription, language);
    
    // 6. Analizar estructura de las frases
    const structureAnalysis = this.analyzeStructure(transcription);

    // 7. Calcular Soft Skills para Radar Chart
    const softSkills = this.calculateSoftSkills(transcription, tone, confidenceScore, structureAnalysis, fillerWords);

    // 8. Evaluar nivel de inglés (solo para idioma inglés)
    let englishLevel = null;
    if (language === 'en') {
      englishLevel = this.englishEvaluator.evaluate(transcription);
    }

    // 9. Analizar patrones de errores (solo para inglés)
    let errorAnalysis = null;
    if (language === 'en') {
      errorAnalysis = this.errorAnalyzer.analyzeText(transcription, language);
      
      // Track errors para análisis semanal
      const userId = 'current_user'; // En producción, obtener del contexto
      const sessionId = Date.now();
      this.errorAnalyzer.trackErrors(userId, errorAnalysis.errors, sessionId);
    }

    return {
      tone: tone.type,
      toneDescription: tone.description,
      confidenceScore: confidenceScore.score,
      confidenceLevel: confidenceScore.level,
      sentiment: {
        score: sentimentScore.score,
        comparative: sentimentScore.comparative,
        positive: sentimentScore.positive,
        negative: sentimentScore.negative
      },
      fillerWords,
      structureAnalysis,
      softSkills,
      englishLevel,
      errorAnalysis,
      advice,
      metrics: {
        wordCount: this.tokenizer.tokenize(transcription).length,
        sentenceCount: transcription.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        avgWordsPerSentence: this.calculateAvgWordsPerSentence(transcription)
      }
    };
  }

  /**
   * Identifica el tono del mensaje
   */
  identifyTone(text, sentimentScore, language) {
    const lowercaseText = text.toLowerCase();
    
    // Patrones para español e inglés
    const patterns = {
      es: {
        doubt: ['quizás', 'tal vez', 'no estoy seguro', 'creo que', 'puede ser', 'supongo', 'a lo mejor'],
        aggressive: ['debes', 'tienes que', 'obviamente', 'siempre', 'nunca', 'no entiendes'],
        passive: ['disculpa', 'perdón', 'solo quería', 'si no es molestia', 'por favor', 'gracias por'],
        professional: ['considero', 'propongo', 'sugiero', 'recomiendo', 'según', 'basándome en']
      },
      en: {
        doubt: ['maybe', 'perhaps', 'i think', 'not sure', 'possibly', 'i guess', 'might be'],
        aggressive: ['must', 'should', 'obviously', 'always', 'never', 'you don\'t understand'],
        passive: ['sorry', 'excuse me', 'just wanted', 'if you don\'t mind', 'please', 'thank you'],
        professional: ['i believe', 'i propose', 'i suggest', 'i recommend', 'according to', 'based on']
      }
    };

    const lang = patterns[language] || patterns.es;
    
    // Contar coincidencias de patrones
    const scores = {
      doubt: this.countPatterns(lowercaseText, lang.doubt),
      aggressive: this.countPatterns(lowercaseText, lang.aggressive),
      passive: this.countPatterns(lowercaseText, lang.passive),
      professional: this.countPatterns(lowercaseText, lang.professional)
    };

    // Ajustar con el análisis de sentimiento
    if (sentimentScore.score < -3) scores.aggressive += 2;
    if (sentimentScore.score > 3) scores.professional += 1;

    // Determinar el tono dominante
    const dominantTone = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const toneDescriptions = {
      es: {
        doubt: 'Dudoso - Muestra inseguridad y falta de convicción',
        aggressive: 'Agresivo - Tono confrontacional y dominante',
        passive: 'Pasivo - Excesivamente apologético y sumiso',
        professional: 'Profesional - Asertivo y seguro sin ser agresivo'
      },
      en: {
        doubt: 'Doubtful - Shows insecurity and lack of conviction',
        aggressive: 'Aggressive - Confrontational and dominating tone',
        passive: 'Passive - Overly apologetic and submissive',
        professional: 'Professional - Assertive and confident without being aggressive'
      }
    };

    // Si no hay patrones claros, usar neutral
    if (Math.max(...Object.values(scores)) === 0) {
      return {
        type: 'neutral',
        description: language === 'es' 
          ? 'Neutral - Tono equilibrado sin características distintivas'
          : 'Neutral - Balanced tone without distinctive characteristics',
        score: scores
      };
    }

    return {
      type: dominantTone,
      description: toneDescriptions[language][dominantTone],
      score: scores
    };
  }

  /**
   * Cuenta cuántos patrones aparecen en el texto
   */
  countPatterns(text, patterns) {
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Calcula el score de confianza (0-100)
   */
  calculateConfidenceScore(text, tone) {
    let score = 50; // Base score

    // Ajustar según el tono
    const toneAdjustments = {
      professional: 25,
      doubt: -20,
      aggressive: -10,
      passive: -15,
      neutral: 0
    };

    score += toneAdjustments[tone.type] || 0;

    // Penalizar por muletillas excesivas
    const fillerCount = this.detectFillerWords(text).count;
    score -= Math.min(fillerCount * 2, 20);

    // Bonus por estructura clara
    const words = this.tokenizer.tokenize(text);
    if (words.length > 10 && words.length < 100) {
      score += 5;
    }

    // Asegurar que esté entre 0 y 100
    score = Math.max(0, Math.min(100, score));

    // Determinar nivel
    let level;
    if (score >= 80) level = 'Muy Alto';
    else if (score >= 60) level = 'Alto';
    else if (score >= 40) level = 'Medio';
    else if (score >= 20) level = 'Bajo';
    else level = 'Muy Bajo';

    return { score: Math.round(score), level };
  }

  /**
   * Genera consejos personalizados de comunicación asertiva
   */
  generateAdvice(tone, confidenceScore, language) {
    const adviceDatabase = {
      es: {
        doubt: [
          '💡 Elimina palabras como "quizás" o "tal vez". Usa afirmaciones directas.',
          '🎯 Reemplaza "creo que" por "estoy seguro que" o "mi análisis indica".',
          '💪 Usa verbos en presente y modo indicativo para sonar más decisivo.',
          '📊 Apoya tus ideas con datos o ejemplos concretos para reforzar tu mensaje.'
        ],
        aggressive: [
          '🤝 Reemplaza "debes" por "te recomiendo" o "podríamos considerar".',
          '😊 Evita palabras absolutas como "siempre" o "nunca".',
          '👂 Incluye frases que muestren empatía: "entiendo tu punto, y también..."',
          '🎭 Usa un tono colaborativo: "trabajemos juntos en" en lugar de órdenes directas.'
        ],
        passive: [
          '🚀 Reduce el uso de disculpas innecesarias. Tu opinión es valiosa.',
          '💼 Cambia "solo quería" por "quiero" o "necesito".',
          '⚡ Sé más directo: "Propongo esto" en lugar de "Si no les molesta, quizás..."',
          '🎯 Elimina justificaciones excesivas. Presenta tu idea con confianza.'
        ],
        professional: [
          '✨ Excelente comunicación. Mantén este nivel de asertividad.',
          '🌟 Tu tono es claro y respetuoso. Sigue así.',
          '📈 Para perfeccionar, varía tu vocabulario técnico cuando sea posible.',
          '🎓 Considera añadir más contexto cuando presentes ideas complejas.'
        ],
        neutral: [
          '📝 Tu comunicación es equilibrada. Para destacar más, añade energía.',
          '💬 Considera ser más específico en tus propuestas.',
          '🎤 Añade tu opinión personal para mostrar mayor compromiso.',
          '🔍 Define claramente tus objetivos al comunicar.'
        ]
      },
      en: {
        doubt: [
          '💡 Remove words like "maybe" or "perhaps". Use direct statements.',
          '🎯 Replace "I think" with "I\'m confident that" or "my analysis shows".',
          '💪 Use present tense and indicative mood to sound more decisive.',
          '📊 Support your ideas with data or concrete examples to reinforce your message.'
        ],
        aggressive: [
          '🤝 Replace "must" with "I recommend" or "we could consider".',
          '😊 Avoid absolute words like "always" or "never".',
          '👂 Include phrases showing empathy: "I understand your point, and also..."',
          '🎭 Use a collaborative tone: "let\'s work together on" instead of direct orders.'
        ],
        passive: [
          '🚀 Reduce unnecessary apologies. Your opinion is valuable.',
          '💼 Change "just wanted" to "want" or "need".',
          '⚡ Be more direct: "I propose this" instead of "If you don\'t mind, maybe..."',
          '🎯 Eliminate excessive justifications. Present your idea with confidence.'
        ],
        professional: [
          '✨ Excellent communication. Maintain this level of assertiveness.',
          '🌟 Your tone is clear and respectful. Keep it up.',
          '📈 To perfect it, vary your technical vocabulary when possible.',
          '🎓 Consider adding more context when presenting complex ideas.'
        ],
        neutral: [
          '📝 Your communication is balanced. To stand out more, add energy.',
          '💬 Consider being more specific in your proposals.',
          '🎤 Add your personal opinion to show greater commitment.',
          '🔍 Clearly define your objectives when communicating.'
        ]
      }
    };

    const lang = adviceDatabase[language] || adviceDatabase.es;
    const toneAdvice = lang[tone.type] || lang.neutral;

    // Seleccionar consejos basados en el confidence score
    const selectedAdvice = [];
    
    if (confidenceScore.score < 60) {
      selectedAdvice.push(...toneAdvice.slice(0, 3));
    } else {
      selectedAdvice.push(...toneAdvice.slice(0, 2));
    }

    return {
      primary: selectedAdvice,
      summary: this.generateSummary(tone.type, confidenceScore.score, language)
    };
  }

  /**
   * Genera un resumen personalizado
   */
  generateSummary(toneType, score, language) {
    const summaries = {
      es: {
        high: `Tu comunicación muestra un ${score}% de confianza. Continúa expresándote con claridad y asertividad.`,
        medium: `Tu comunicación muestra un ${score}% de confianza. Con algunos ajustes, puedes sonar más seguro y profesional.`,
        low: `Tu comunicación muestra un ${score}% de confianza. Trabaja en ser más directo y eliminar muletillas para proyectar mayor seguridad.`
      },
      en: {
        high: `Your communication shows ${score}% confidence. Continue expressing yourself with clarity and assertiveness.`,
        medium: `Your communication shows ${score}% confidence. With some adjustments, you can sound more confident and professional.`,
        low: `Your communication shows ${score}% confidence. Work on being more direct and eliminating fillers to project greater confidence.`
      }
    };

    const level = score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
    return summaries[language][level];
  }

  /**
   * Detecta palabras de relleno y muletillas
   */
  detectFillerWords(text, language = 'es') {
    const fillers = {
      es: ['este', 'eh', 'um', 'ah', 'pues', 'bueno', 'entonces', 'o sea', 'como que', 'tipo'],
      en: ['uh', 'um', 'like', 'you know', 'so', 'well', 'basically', 'actually', 'literally']
    };

    const lang = fillers[language] || fillers.es;
    const lowercaseText = text.toLowerCase();
    const found = [];

    lang.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        found.push({ word: filler, count: matches.length });
      }
    });

    return {
      found,
      count: found.reduce((sum, item) => sum + item.count, 0)
    };
  }

  /**
   * Analiza la estructura de las frases
   */
  analyzeStructure(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text);

    // Calcular longitud promedio de oraciones
    const avgSentenceLength = words.length / sentences.length;

    // Detectar si usa preguntas
    const questionCount = (text.match(/\?/g) || []).length;

    // Determinar complejidad
    let complexity;
    if (avgSentenceLength > 20) complexity = 'Alta';
    else if (avgSentenceLength > 10) complexity = 'Media';
    else complexity = 'Baja';

    return {
      sentenceCount: sentences.length,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      complexity,
      usesQuestions: questionCount > 0,
      questionCount
    };
  }

  /**
   * Calcula promedio de palabras por oración
   */
  calculateAvgWordsPerSentence(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text);
    return sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0;
  }

  /**
   * Calcula los 5 Soft Skills para el Radar Chart
   * Cada skill tiene un valor de 0-100
   */
  calculateSoftSkills(text, tone, confidenceScore, structureAnalysis, fillerWords) {
    return {
      persuasion: this.calculatePersuasion(text, tone, confidenceScore),
      technicalClarity: this.calculateTechnicalClarity(text, structureAnalysis, fillerWords),
      empathy: this.calculateEmpathy(text, tone),
      conflictResolution: this.calculateConflictResolution(text, tone),
      brevity: this.calculateBrevity(text, structureAnalysis)
    };
  }

  /**
   * Persuasión: Capacidad de convencer con confianza y autoridad
   */
  calculatePersuasion(text, tone, confidenceScore) {
    let score = confidenceScore.score * 0.5; // Base en confianza

    const lowercaseText = text.toLowerCase();

    // Palabras que aumentan persuasión
    const persuasiveWords = [
      'recomiendo', 'sugiero', 'demuestra', 'evidencia', 'comprobado',
      'garantizo', 'aseguro', 'resultados', 'efectivo', 'beneficios',
      'ventajas', 'mejora', 'solución', 'éxito', 'lograr'
    ];

    // Contar palabras persuasivas
    const persuasiveCount = persuasiveWords.reduce((count, word) => {
      return count + (lowercaseText.split(word).length - 1);
    }, 0);

    score += persuasiveCount * 8;

    // Bonus por tono profesional o agresivo (puede ser persuasivo)
    if (tone.type === 'professional') score += 20;
    if (tone.type === 'aggressive') score += 10;

    // Penalización por tono dudoso o pasivo
    if (tone.type === 'doubt') score -= 25;
    if (tone.type === 'passive') score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Claridad Técnica: Precisión y estructura clara sin muletillas
   */
  calculateTechnicalClarity(text, structureAnalysis, fillerWords) {
    let score = 70; // Base

    // Penalizar muletillas fuertemente
    score -= fillerWords.count * 3;

    // Bonus por complejidad apropiada
    if (structureAnalysis.complexity === 'Media') score += 10;
    if (structureAnalysis.complexity === 'Baja') score += 5;
    if (structureAnalysis.complexity === 'Alta') score -= 5;

    // Bonus por oraciones bien estructuradas
    if (structureAnalysis.avgSentenceLength >= 8 && structureAnalysis.avgSentenceLength <= 20) {
      score += 15;
    }

    // Detectar términos técnicos
    const technicalTerms = [
      'implementar', 'optimizar', 'analizar', 'configurar', 'metodología',
      'proceso', 'sistema', 'estrategia', 'algoritmo', 'protocolo',
      'framework', 'arquitectura', 'infraestructura', 'rendimiento'
    ];

    const lowercaseText = text.toLowerCase();
    const technicalCount = technicalTerms.reduce((count, term) => {
      return count + (lowercaseText.split(term).length - 1);
    }, 0);

    score += technicalCount * 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Empatía: Capacidad de conectar y mostrar comprensión
   */
  calculateEmpathy(text, tone) {
    let score = 40; // Base neutral

    const lowercaseText = text.toLowerCase();

    // Palabras empáticas
    const empatheticWords = [
      'entiendo', 'comprendo', 'aprecio', 'valoro', 'respeto',
      'considero', 'reconozco', 'agradezco', 'escucho', 'comparto',
      'apoyo', 'ayudar', 'colaborar', 'juntos', 'equipo'
    ];

    const empatheticCount = empatheticWords.reduce((count, word) => {
      return count + (lowercaseText.split(word).length - 1);
    }, 0);

    score += empatheticCount * 12;

    // Bonus por tono profesional o pasivo (muestra consideración)
    if (tone.type === 'professional') score += 25;
    if (tone.type === 'passive') score += 15;

    // Penalización fuerte por tono agresivo
    if (tone.type === 'aggressive') score -= 30;

    // Detectar preguntas (muestra interés)
    const questionCount = (text.match(/\?/g) || []).length;
    score += questionCount * 8;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Resolución de Conflictos: Capacidad de mediar y encontrar soluciones
   */
  calculateConflictResolution(text, tone) {
    let score = 50; // Base neutral

    const lowercaseText = text.toLowerCase();

    // Palabras de resolución
    const resolutionWords = [
      'solución', 'resolver', 'alternativa', 'propuesta', 'acuerdo',
      'negociar', 'consenso', 'compromiso', 'equilibrio', 'mediar',
      'dialogar', 'conversar', 'encontrar', 'balance', 'armonía'
    ];

    const resolutionCount = resolutionWords.reduce((count, word) => {
      return count + (lowercaseText.split(word).length - 1);
    }, 0);

    score += resolutionCount * 10;

    // Bonus por tono profesional
    if (tone.type === 'professional') score += 30;

    // Penalización por tono agresivo o dudoso
    if (tone.type === 'aggressive') score -= 25;
    if (tone.type === 'doubt') score -= 10;

    // Bonus moderado por tono pasivo (muestra flexibilidad)
    if (tone.type === 'passive') score += 10;

    // Detectar palabras de inclusión
    const inclusionWords = ['podemos', 'ambos', 'juntos', 'colaborar', 'equipo'];
    const inclusionCount = inclusionWords.reduce((count, word) => {
      return count + (lowercaseText.split(word).length - 1);
    }, 0);

    score += inclusionCount * 8;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Brevedad: Capacidad de comunicar de forma concisa y directa
   */
  calculateBrevity(text, structureAnalysis) {
    let score = 50; // Base

    const wordCount = this.tokenizer.tokenize(text).length;

    // Óptimo: 20-80 palabras
    if (wordCount >= 20 && wordCount <= 80) {
      score += 30;
    } else if (wordCount < 20) {
      // Demasiado breve
      score += 10;
    } else if (wordCount > 80 && wordCount <= 150) {
      // Un poco largo
      score -= 10;
    } else {
      // Muy largo
      score -= 25;
    }

    // Bonus por oraciones cortas y concisas
    if (structureAnalysis.avgSentenceLength <= 15) {
      score += 15;
    }

    // Penalizar complejidad alta
    if (structureAnalysis.complexity === 'Alta') {
      score -= 15;
    }

    // Bonus por pocas oraciones pero informativas
    if (structureAnalysis.sentenceCount >= 2 && structureAnalysis.sentenceCount <= 5) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

module.exports = SentimentAnalyzer;
