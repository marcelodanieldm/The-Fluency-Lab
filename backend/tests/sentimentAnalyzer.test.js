const SentimentAnalyzer = require('../services/sentimentAnalyzer');

describe('SentimentAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  describe('Análisis de Tono', () => {
    test('Debe detectar tono dudoso', async () => {
      const text = 'Quizás podríamos tal vez considerar esta opción, no estoy seguro';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.tone).toBe('doubt');
      expect(result.confidenceScore).toBeLessThan(50);
    });

    test('Debe detectar tono agresivo', async () => {
      const text = 'Debes hacer esto ahora. Obviamente no entiendes el problema.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.tone).toBe('aggressive');
    });

    test('Debe detectar tono pasivo', async () => {
      const text = 'Disculpa, solo quería comentar que, si no es molestia, por favor...';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.tone).toBe('passive');
      expect(result.confidenceScore).toBeLessThan(60);
    });

    test('Debe detectar tono profesional', async () => {
      const text = 'Propongo implementar esta solución basándome en el análisis de datos.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.tone).toBe('professional');
      expect(result.confidenceScore).toBeGreaterThan(60);
    });
  });

  describe('Confidence Score', () => {
    test('Score debe estar entre 0 y 100', async () => {
      const text = 'Este es un texto de prueba normal.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(100);
    });

    test('Tono profesional debe tener score alto', async () => {
      const text = 'Recomiendo esta estrategia basándome en los resultados obtenidos.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.confidenceScore).toBeGreaterThan(50);
    });
  });

  describe('Detección de Muletillas', () => {
    test('Debe detectar muletillas en español', async () => {
      const text = 'Este, pues bueno, o sea que entonces necesitamos eh resolver esto.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.fillerWords.count).toBeGreaterThan(0);
      expect(result.fillerWords.found.length).toBeGreaterThan(0);
    });

    test('Debe detectar muletillas en inglés', async () => {
      const text = 'Like, you know, um, we need to, like, solve this problem.';
      const result = await analyzer.analyze(text, 'en');
      
      expect(result.fillerWords.count).toBeGreaterThan(0);
    });
  });

  describe('Análisis Estructural', () => {
    test('Debe calcular métricas correctamente', async () => {
      const text = 'Primera oración. Segunda oración más larga con más palabras. Tercera.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.metrics.wordCount).toBeGreaterThan(0);
      expect(result.metrics.sentenceCount).toBe(3);
      expect(result.structureAnalysis.sentenceCount).toBe(3);
    });

    test('Debe detectar preguntas', async () => {
      const text = '¿Cómo podemos resolver esto? ¿Hay alguna solución?';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.structureAnalysis.usesQuestions).toBe(true);
      expect(result.structureAnalysis.questionCount).toBe(2);
    });
  });

  describe('Consejos Personalizados', () => {
    test('Debe generar consejos para tono dudoso', async () => {
      const text = 'Tal vez quizás podríamos pensar en esto...';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.advice.primary).toBeDefined();
      expect(result.advice.primary.length).toBeGreaterThan(0);
      expect(result.advice.summary).toBeDefined();
    });

    test('Debe generar consejos específicos según el score', async () => {
      const lowConfidenceText = 'Eh, pues, quizás, no sé...';
      const highConfidenceText = 'Propongo implementar esta solución eficiente.';
      
      const lowResult = await analyzer.analyze(lowConfidenceText, 'es');
      const highResult = await analyzer.analyze(highConfidenceText, 'es');
      
      expect(lowResult.advice.primary.length).toBeGreaterThanOrEqual(2);
      expect(highResult.advice.primary.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Soporte Multiidioma', () => {
    test('Debe funcionar en español', async () => {
      const text = 'Propongo esta solución basándome en los datos.';
      const result = await analyzer.analyze(text, 'es');
      
      expect(result.tone).toBeDefined();
      expect(result.advice.primary[0]).toContain('💡');
    });

    test('Debe funcionar en inglés', async () => {
      const text = 'I propose this solution based on the data analysis.';
      const result = await analyzer.analyze(text, 'en');
      
      expect(result.tone).toBeDefined();
      expect(result.advice.primary[0]).toContain('💡');
    });
  });
});
