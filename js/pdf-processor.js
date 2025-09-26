// Processador de PDFs - Baseado nas funções Python
class PDFProcessor {
    constructor() {
        this.pdfjsLib = window['pdfjsLib'];
    }

    // Função para extrair o número da prancha do nome do arquivo - Baseado em extrair_numero_prancha
    extrairNumeroPrancha(nomeArquivo) {
        // Remove a extensão e possíveis sufixos como "_assinado"
        const nomeSemExt = nomeArquivo.replace(/\.pdf$/, '').replace('_assinado', '');
        
        // Procura por padrões como _01_07 ou -01-07 no nome
        const padroes = [
            /[_\-](\d{2})[_\-](\d{2})(?:\..*)?$/,
            /[_\-](\d{2})[_\-](\d{3})(?:\..*)?$/,
            /[_\-](\d{3})[_\-](\d{3})(?:\..*)?$/
        ];
        
        for (const padrao of padroes) {
            const correspondencia = nomeSemExt.match(padrao);
            if (correspondencia) {
                return `${correspondencia[1]} ${correspondencia[2]}`;
            }
        }
        
        return null;
    }

    // Função para verificar se o arquivo está assinado pelo nome - Baseado em verificar_assinatura_nome
    verificarAssinaturaNome(nomeArquivo) {
        return nomeArquivo.toLowerCase().includes('assinado');
    }

    // Função para extrair o código do projeto do nome do arquivo - Baseado em extrair_codigo_projeto
    extrairCodigoProjeto(nomeArquivo) {
        const padrao = /PRJ-([A-Z]+)-/;
        const correspondencia = nomeArquivo.match(padrao);
        return correspondencia ? correspondencia[1] : null;
    }

    // Processar arquivo PDF - Baseado no processamento principal do Python
    async processarPDF(file, palavrasChave, opcoes) {
        const {
            checkFilename = true,
            checkSheetNumber = true,
            checkProjeto = true
        } = opcoes;

        // Extrair informações do nome do arquivo
        const nomeArquivo = file.name.replace('.pdf', '');
        const assinadoPeloNome = this.verificarAssinaturaNome(file.name);
        const nomeSemAssinado = nomeArquivo.replace('_assinado', '');
        const numeroPrancha = this.extrairNumeroPrancha(nomeArquivo);
        const codigoProjeto = this.extrairCodigoProjeto(file.name);
        const descricaoProjeto = MAPEAMENTO_PROJETOS[codigoProjeto] || 'Desconhecido';

        // Inicializar resultados - Baseado na estrutura do Python
        const dadosCarimbo = [];
        let nomeArquivoEncontrado = false;
        let pranchaEncontrada = false;
        let projetoEncontrado = false;

        try {
            // Carregar PDF usando pdf.js - Similar ao PyPDF2
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await this.pdfjsLib.getDocument(arrayBuffer).promise;
            
            // Processar cada página - Similar ao loop de páginas do Python
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
                for (const palavra of PALAVRAS_CHAVE_ENGENHEIROS) {
                    if (textoExtraido.includes(palavra) && !dadosCarimbo.includes(palavra)) {
                        dadosCarimbo.push(palavra);
                    }
                }
                
                // Verificar palavras-chave adicionais do projeto
                for (const palavra of palavrasChave) {
                    if (textoExtraido.includes(palavra) && !dadosCarimbo.includes(palavra)) {
                        dadosCarimbo.push(palavra);
                    }
                }
            }
        } catch (error) {
            throw new Error(`Erro ao processar PDF ${file.name}: ${error.message}`);
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
    }

    // Processar múltiplos PDFs - Similar ao loop principal do Python
    async processarMultiplosPDFs(files, palavrasChaveAdicionais, opcoes, onProgress) {
        const resultados = {};
        const todasPalavrasChave = [...PALAVRAS_CHAVE_ENGENHEIROS, ...palavrasChaveAdicionais];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Chamar callback de progresso - Similar à barra de progresso do Streamlit
            if (onProgress) {
                onProgress(i, files.length, file.name);
            }

            try {
                resultados[file.name] = await this.processarPDF(file, todasPalavrasChave, opcoes);
            } catch (error) {
                console.error(error);
                // Manter estrutura similar ao tratamento de erro do Python
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
                    nome_arquivo: file.name.replace('.pdf', '')
                };
            }

            // Pequeno delay para não sobrecarregar o navegador
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return resultados;
    }
}