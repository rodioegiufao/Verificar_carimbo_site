// js/main.js - Arquivo de inicialização
console.log('🚀 Inicializando aplicação...');

// Configurar PDF.js antes de tudo
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado');
    
    // Inicializar a aplicação
    window.pdfAnalyzerApp = new PDFAnalyzerApp();
    console.log('✅ Aplicação inicializada');
    
    // Debug: testar se as variáveis estão acessíveis
    console.log('Engenheiros:', window.ENGENHEIROS_CREAS_FIXOS);
    console.log('Projetos:', window.MAPEAMENTO_PROJETOS);
    console.log('Palavras-chave:', window.PALAVRAS_CHAVE_ENGENHEIROS);
});