// Aplicação Principal - Foco na correção das abas
class PDFAnalyzerApp {
    constructor() {
        this.pdfProcessor = new PDFProcessor();
        this.excelGenerator = new ExcelGenerator();
        this.uploadedFiles = [];
        this.resultados = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDefaultKeywords();
        this.populateStaticData();
        this.setupFileUpload();
        
        // Garantir que a aba correta esteja visível
        this.showTab('analisador');
    }

    setupEventListeners() {
        // Configurar abas - CORREÇÃO PRINCIPAL
        this.setupTabs();
        
        // Configurar upload de arquivos
        this.setupFileUploadHandlers();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.getAttribute('data-tab');
                this.showTab(targetTab);
            });
        });
    }

    // Função corrigida para mostrar abas
    // Função corrigida para mostrar abas
    showTab(tabName) {
        console.log('Tentando mostrar aba:', tabName);
        
        // Esconder todas as abas
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            pane.style.display = 'none';
            pane.style.opacity = '0';
        });

        // Remover active de todos os botões
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar aba selecionada
        const targetPane = document.getElementById(tabName);
        if (targetPane) {
            targetPane.classList.add('active');
            targetPane.style.display = 'block';
            
            // Usar setTimeout para garantir que o display:block seja aplicado antes da transição
            setTimeout(() => {
                targetPane.style.opacity = '1';
            }, 10);
            
            console.log('Aba encontrada e ativada:', tabName);
        } else {
            console.error('Aba não encontrada:', tabName);
        }

        // Ativar botão selecionado
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Forçar redesenho para garantir que as transições funcionem
        if (targetPane) {
            targetPane.offsetHeight; // Trigger reflow
        }
    }

    setupFileUploadHandlers() {
        const fileInput = document.getElementById('pdfUpload');
        const uploadArea = document.getElementById('fileUploadArea');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileDrop(e);
        });
    }

    handleFileSelect(event) {
        this.handleFiles(event.target.files);
    }

    handleFileDrop(event) {
        const files = event.dataTransfer.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        this.uploadedFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );
        
        if (this.uploadedFiles.length === 0 && files.length > 0) {
            this.showError('Por favor, selecione arquivos PDF válidos.');
            return;
        }

        this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span>${this.formatFileSize(file.size)}</span>
            `;
            fileList.appendChild(fileItem);
        });
    }

    loadDefaultKeywords() {
        const keywordsInput = document.getElementById('keywordsInput');
        keywordsInput.value = PALAVRAS_CHAVE_PADRAO.join('\n');
    }

    populateStaticData() {
        this.populateEngineersData();
        this.populateProjectsData();
    }

    populateEngineersData() {
        const engineersDiv = document.getElementById('engenheiros');
        const engineersTable = document.getElementById('engineersTable');
        
        let engineersHTML = '';
        let tableHTML = '';
        
        for (const [engenheiro, creas] of Object.entries(ENGENHEIROS_CREAS_FIXOS)) {
            engineersHTML += `<div class="engineer-item"><strong>${engenheiro}</strong>: ${creas.join(', ')}</div>`;
            tableHTML += `
                <tr>
                    <td>${engenheiro}</td>
                    <td>${creas.join(', ')}</td>
                </tr>
            `;
        }
        
        if (engineersDiv) engineersDiv.innerHTML = engineersHTML;
        if (engineersTable) engineersTable.innerHTML = tableHTML;
    }

    populateProjectsData() {
        const projectsDiv = document.getElementById('projetos');
        const projectsTable = document.getElementById('projectsTable');
        
        let projectsHTML = '';
        let tableHTML = '';
        
        for (const [codigo, descricao] of Object.entries(MAPEAMENTO_PROJETOS)) {
            projectsHTML += `<div class="project-item"><strong>${codigo}</strong>: ${descricao}</div>`;
            tableHTML += `
                <tr>
                    <td>${codigo}</td>
                    <td>${descricao}</td>
                </tr>
            `;
        }
        
        if (projectsDiv) projectsDiv.innerHTML = projectsHTML;
        if (projectsTable) projectsTable.innerHTML = tableHTML;
    }

    async iniciarAnalise() {
        if (this.uploadedFiles.length === 0) {
            this.showError('Por favor, selecione pelo menos um arquivo PDF.');
            return;
        }

        this.showProgressArea();
        
        const keywordsInput = document.getElementById('keywordsInput');
        const palavrasChaveAdicionais = keywordsInput.value.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        const opcoes = {
            checkFilename: document.getElementById('checkFilename').checked,
            checkSheetNumber: document.getElementById('checkSheetNumber').checked,
            checkProjeto: document.getElementById('checkProjeto').checked
        };
        
        try {
            this.resultados = await this.pdfProcessor.processarMultiplosPDFs(
                this.uploadedFiles,
                palavrasChaveAdicionais,
                opcoes,
                (current, total, fileName) => this.updateProgress(current, total, fileName)
            );
            
            this.hideProgressArea();
            this.mostrarResultados();
            this.showSuccess('Análise concluída com sucesso! ✅');
            
        } catch (error) {
            this.hideProgressArea();
            this.showError('Erro durante a análise: ' + error.message);
        }
    }

    mostrarResultados() {
        const resultsArea = document.getElementById('resultsArea');
        if (resultsArea) {
            resultsArea.classList.remove('hidden');
            
            this.preencherTabelaResultados();
            this.atualizarEstatisticas();
            this.mostrarEngenheirosEncontrados();
            this.mostrarDetalhamentoProjetos();
            
            // Scroll para os resultados
            resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    preencherTabelaResultados() {
        const tbody = document.getElementById('resultsBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        for (const [fileName, dados] of Object.entries(this.resultados)) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${dados.numero_prancha || 'Não identificado'}</td>
                <td>${dados.codigo_projeto || 'Não identificado'}</td>
                <td>${dados.descricao_projeto}</td>
                <td>${dados.dados_carimbo.length > 0 ? dados.dados_carimbo.join(', ') : 'Nenhuma'}</td>
                <td class="${dados.nome_arquivo_encontrado ? 'success' : 'error'}">
                    ${dados.nome_arquivo_encontrado ? 'Sim' : 'Não'}
                </td>
                <td class="${dados.prancha_encontrada ? 'success' : 'error'}">
                    ${dados.prancha_encontrada ? 'Sim' : 'Não'}
                </td>
                <td class="${dados.assinado_pelo_nome ? 'success' : 'error'}">
                    ${dados.assinado_pelo_nome ? 'Sim' : 'Não'}
                </td>
                <td class="${dados.projeto_encontrado ? 'success' : 'error'}">
                    ${dados.projeto_encontrado ? 'Sim' : 'Não'}
                </td>
            `;
            
            tbody.appendChild(row);
        }
    }

    atualizarEstatisticas() {
        const results = Object.values(this.resultados);
        
        const elements = {
            totalFiles: document.getElementById('totalFiles'),
            filesWithName: document.getElementById('filesWithName'),
            filesWithSheet: document.getElementById('filesWithSheet'),
            filesSigned: document.getElementById('filesSigned'),
            projectsFound: document.getElementById('projectsFound')
        };
        
        if (elements.totalFiles) elements.totalFiles.textContent = results.length;
        if (elements.filesWithName) elements.filesWithName.textContent = results.filter(d => d.nome_arquivo_encontrado).length;
        if (elements.filesWithSheet) elements.filesWithSheet.textContent = results.filter(d => d.prancha_encontrada).length;
        if (elements.filesSigned) elements.filesSigned.textContent = results.filter(d => d.assinado_pelo_nome).length;
        if (elements.projectsFound) elements.projectsFound.textContent = results.filter(d => d.projeto_encontrado).length;
    }

    mostrarEngenheirosEncontrados() {
        const container = document.getElementById('engineersFound');
        if (!container) return;
        
        const engenheirosEncontrados = {};
        
        for (const dados of Object.values(this.resultados)) {
            for (const palavra of dados.dados_carimbo) {
                for (const [engenheiro, creas] of Object.entries(ENGENHEIROS_CREAS_FIXOS)) {
                    if (palavra === engenheiro || creas.includes(palavra)) {
                        engenheirosEncontrados[engenheiro] = (engenheirosEncontrados[engenheiro] || 0) + 1;
                    }
                }
            }
        }
        
        if (Object.keys(engenheirosEncontrados).length === 0) {
            container.innerHTML = '<div class="found-item">Nenhum engenheiro encontrado nos arquivos analisados</div>';
            return;
        }
        
        let html = '';
        for (const [engenheiro, count] of Object.entries(engenheirosEncontrados)) {
            html += `
                <div class="found-item">
                    <strong>${engenheiro}</strong>: encontrado em ${count} arquivo(s)
                </div>
            `;
        }
        container.innerHTML = html;
    }

    mostrarDetalhamentoProjetos() {
        const container = document.getElementById('projectsDetails');
        if (!container) return;
        
        const projetosEncontrados = {};
        
        for (const dados of Object.values(this.resultados)) {
            const codigo = dados.codigo_projeto;
            const descricao = dados.descricao_projeto;
            if (codigo && descricao !== 'Desconhecido') {
                const chave = `${codigo} - ${descricao}`;
                projetosEncontrados[chave] = (projetosEncontrados[chave] || 0) + 1;
            }
        }
        
        if (Object.keys(projetosEncontrados).length === 0) {
            container.innerHTML = '<div class="found-item">Nenhum projeto identificado nos arquivos analisados</div>';
            return;
        }
        
        let html = '';
        for (const [projeto, count] of Object.entries(projetosEncontrados)) {
            html += `
                <div class="found-item">
                    <strong>${projeto}</strong>: ${count} arquivo(s)
                </div>
            `;
        }
        container.innerHTML = html;
    }

    baixarExcel() {
        if (Object.keys(this.resultados).length === 0) {
            this.showError('Nenhum resultado disponível para download.');
            return;
        }

        const success = this.excelGenerator.baixarExcel(this.resultados, "resultados_analise.xlsx");
        if (!success) {
            this.showError('Erro ao gerar arquivo Excel.');
        }
    }

    // Utilitários de interface
    showProgressArea() {
        this.hideElement('instructions');
        this.hideElement('resultsArea');
        this.showElement('progressArea');
    }

    hideProgressArea() {
        this.hideElement('progressArea');
    }

    updateProgress(current, total, fileName) {
        const progress = ((current + 1) / total) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const fileProgress = document.getElementById('fileProgress');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        if (fileProgress) fileProgress.textContent = `Processando: ${fileName}`;
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) element.classList.remove('hidden');
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    }

    showError(message) {
        alert('Erro: ' + message);
    }

    showSuccess(message) {
        console.log('Sucesso: ' + message);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Funções globais para interface com o HTML
function toggleExpand(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('show');
    }
}

function iniciarAnalise() {
    if (window.pdfAnalyzerApp) {
        window.pdfAnalyzerApp.iniciarAnalise();
    }
}

function baixarExcel() {
    if (window.pdfAnalyzerApp) {
        window.pdfAnalyzerApp.baixarExcel();
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.pdfAnalyzerApp = new PDFAnalyzerApp();
    
    // Debug: Verificar se as abas estão funcionando
    console.log('Aplicação inicializada. Abas devem estar funcionando.');
});