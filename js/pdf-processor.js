// Processador de PDFs - Baseado nas funções Python
class PDFProcessor {
    constructor() {
        this.pdfjsLib = window['pdfjsLib'];
        // Configurar o worker se não estiver configurado
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    // CORREÇÃO: Adicionar validação de arquivo
    validarArquivoPDF(file) {
        if (!file) {
            throw new Error('Arquivo não selecionado');
        }
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            throw new Error('O arquivo não é um PDF válido');
        }
        return true;
    }

    // Função para extrair o número da prancha do nome do arquivo
    extrairNumeroPrancha(nomeArquivo) {
        try {
            // Remove a extensão e possíveis sufixos como "_assinado"
            const nomeSemExt = nomeArquivo.replace(/\.pdf$/i, '').replace(/_assinado/i, '');
            
            // Procura por padrões como _01_07 ou -01-07 no nome
            const padroes = [
                /[_\-](\d{2})[_\-](\d{2})/,
                /[_\-](\d{2})[_\-](\d{3})/,
                /[_\-](\d{3})[_\-](\d{3})/
            ];
            
            for (const padrao of padroes) {
                const correspondencia = nomeSemExt.match(padrao);
                if (correspondencia) {
                    return `${correspondencia[1]} ${correspondencia[2]}`;
                }
            }
        } catch (error) {
            console.error('Erro ao extrair número da prancha:', error);
        }
        
        return null;
    }

    // Função para verificar se o arquivo está assinado pelo nome
    verificarAssinaturaNome(nomeArquivo) {
        return nomeArquivo.toLowerCase().includes('assinado');
    }

    // Função para extrair o código do projeto do nome do arquivo
    extrairCodigoProjeto(nomeArquivo) {
        try {
            const padrao = /PRJ-([A-Z]+)-/i;
            const correspondencia = nomeArquivo.match(padrao);
            return correspondencia ? correspondencia[1] : null;
        } catch (error) {
            console.error('Erro ao extrair código do projeto:', error);
            return null;
        }
    }

    // CORREÇÃO: Processar arquivo PDF com melhor tratamento de erro
    async processarPDF(file, palavrasChave, opcoes) {
        try {
            // Validar arquivo
            this.validarArquivoPDF(file);

            const {
                checkFilename = true,
                checkSheetNumber = true,
                checkProjeto = true
            } = opcoes;

            // Extrair informações do nome do arquivo
            const nomeArquivo = file.name.replace(/\.pdf$/i, '');
            const assinadoPeloNome = this.verificarAssinaturaNome(file.name);
            const nomeSemAssinado = nomeArquivo.replace(/_assinado/i, '');
            const numeroPrancha = this.extrairNumeroPrancha(file.name);
            const codigoProjeto = this.extrairCodigoProjeto(file.name);
            const descricaoProjeto = window.MAPEAMENTO_PROJETOS[codigoProjeto] || 'Desconhecido';

            // Inicializar resultados
            const dadosCarimbo = [];
            let nomeArquivoEncontrado = false;
            let pranchaEncontrada = false;
            let projetoEncontrado = false;

            // Carregar PDF usando pdf.js
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await this.pdfjsLib.getDocument(arrayBuffer).promise;
            
            // Processar cada página
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const textoExtraido = textContent.items.map(item => item.str).join(' ').replace(/\n/g, ' ');
                
                // Verificar se o nome do arquivo está no texto da página
                if (checkFilename && nomeSemAssinado && textoExtraido.includes(nomeSemAssinado)) {
                    nomeArquivoEncontrado = true;
                }
                
                // Verificar se o número da prancha está no texto
                if (checkSheetNumber && numeroPrancha) {
                    const variacoesPrancha = [
                        numeroPrancha,
                        numeroPrancha.replace(' ', '_'),
                        numeroPrancha.replace(' ', '-')
                    ];
                    if (variacoesPrancha.some(variacao => textoExtraido.includes(variacao))) {
                        pranchaEncontrada = true;
                    }
                }
                
                // Verificar se a descrição do projeto está no texto
                if (checkProjeto && codigoProjeto && descricaoProjeto !== 'Desconhecido') {
                    if (textoExtraido.includes(descricaoProjeto)) {
                        projetoEncontrado = true;
                    }
                }
                
                // Verificar palavras-chave FIXAS dos engenheiros
                if (window.PALAVRAS_CHAVE_ENGENHEIROS) {
                    for (const palavra of window.PALAVRAS_CHAVE_ENGENHEIROS) {
                        if (textoExtraido.includes(palavra) && !dadosCarimbo.includes(palavra)) {
                            dadosCarimbo.push(palavra);
                        }
                    }
                }
                
                // Verificar palavras-chave adicionais do projeto
                for (const palavra of palavrasChave) {
                    if (textoExtraido.includes(palavra) && !dadosCarimbo.includes(palavra)) {
                        dadosCarimbo.push(palavra);
                    }
                }
            }

            // Retornar estrutura idêntica ao Python
            return {
                dados_carimbo: dadosCarimbo,
                nome_arquivo_encontrado: nomeArquivoEncontrado,
                prancha_encontrada: pranchaEncontrada,
                assinado_pelo_nome: assinadoPeloNome,
                projeto_encontrado: projetoEncontrado,
                codigo_projeto: codigoProjeto,
                descricao_projeto: descricaoProjeto,
                numero_prancha: numeroPrancha,
                nome_arquivo: nomeArquivo
            };

        } catch (error) {
            console.error(`Erro ao processar PDF ${file.name}:`, error);
            throw new Error(`Erro ao processar PDF ${file.name}: ${error.message}`);
        }
    }

    // CORREÇÃO: Processar múltiplos PDFs com melhor tratamento
    async processarMultiplosPDFs(files, palavrasChaveAdicionais, opcoes, onProgress) {
        const resultados = {};
        
        // Verificar se há arquivos
        if (!files || files.length === 0) {
            throw new Error('Nenhum arquivo PDF selecionado');
        }

        const todasPalavrasChave = [
            ...(window.PALAVRAS_CHAVE_ENGENHEIROS || []), 
            ...palavrasChaveAdicionais
        ];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Chamar callback de progresso
            if (onProgress) {
                onProgress(i, files.length, file.name);
            }

            try {
                resultados[file.name] = await this.processarPDF(file, todasPalavrasChave, opcoes);
                console.log(`✅ PDF processado: ${file.name}`);
            } catch (error) {
                console.error(`❌ Erro no PDF ${file.name}:`, error);
                
                // Estrutura de erro consistente
                resultados[file.name] = {
                    error: error.message,
                    dados_carimbo: [],
                    nome_arquivo_encontrado: false,
                    prancha_encontrada: false,
                    assinado_pelo_nome: false,
                    projeto_encontrado: false,
                    codigo_projeto: null,
                    descricao_projeto: 'Erro no processamento',
                    numero_prancha: null,
                    nome_arquivo: file.name.replace(/\.pdf$/i, '')
                };
            }

            // Pequeno delay para não sobrecarregar o navegador
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return resultados;
    }
}
