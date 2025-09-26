// Configurações fixas do sistema - Baseado no código Python
window.ENGENHEIROS_CREAS_FIXOS = {
    "RODRIGO DAMASCENO NASCIMENTO": ["0920192912", "092019291-2"],
    "JÂNIO RIBEIRO LOPES": ["0912111810", "091211181-0"],
    "FLAVIO SORDI": ["2201136580"],
    "RITHELLY LOBATO": ["A278773-3", "A2787733"],
    "SALOMÃO": ["0401863549", "040186354-9"]
};

window.MAPEAMENTO_PROJETOS = {
    "ECX": "PROJETO ELÉTRICO DE CLIMATIZAÇÃO",
    "ILUX": "PROJETO DE ILUMINAÇÃO EXTERNA",
    "CFTV": "PROJETO DE CFTV",
    "CAB": "PROJETO DE CABEAMENTO",
    "SOM": "PROJETO DE SONORIZAÇÃO",
    "SUB": "PROJETO DE SUBESTAÇÃO",
    "SPDA": "PROJETO DE SPDA",
    "TEF": "PROJETO DE TELEFONIA",
    "ALI": "PROJETO ELÉTRICO DE BAIXA",
    "TUG": "PROJETO ELÉTRICO DE TOMADAS",
    "ILU": "PROJETO ELÉTRICO DE ILUMINAÇÃO",
    "EME": "PROJETO ELÉTRICO DE EMERGÊNCIA",
    "FOT": "PROJETO ELÉTRICO FOTOVOLTAICO",
    "LEV": "LEVANTAMENTO TOPOGRÁFICO",
    "EST": "ESTRUTURA DE CONCRETO ARMADO",
    "FUN": "ESTRUTURA DE CONCRETO ARMADO", 
    "EMT": "ESTRUTURA METÁLICA",
    "DRE": "PROJETO DE DRENAGEM",
    "PAV": "PROJETO DE PAVIMENTAÇÃO",
    "REG": "PROJETO DE REDE DE ESGOTO",
    "TER": "PROJETO DE TERRAPLENAGEM",
    "CANT": "PROJETO DE CANTEIRO DE OBRAS",
    "HID": "PROJETO DE INSTALAÇÕES HIDRÁULICAS",
    "IRRI": "PROJETO DE IRRIGAÇÃO",
    "SAN": "PROJETO DE INSTALAÇÕES SANITÁRIAS",
    "PLU": "PROJETO DE SISTEMA DE REDES DE ÁGUAS",
    "INC": "PROJETO DE PREVENÇÃO E COMBATE A INCÊNDIO",
    "GLP": "PROJETO DE INSTALAÇÕES DE GASES GLP",
    "CLI": "PROJETO DE INSTALAÇÕES DE GASES GLP",
    "EXA": "PROJETO DE EXAUSTÃO"
};

window.PALAVRAS_CHAVE_PADRAO = [
    "IPER",
    "CONSTRUÇÃO DA SEDE DO INSTITUTO DE PREVIDÊNCIA DO ESTADO",
    "DE RORAIMA - IPER",
    "AGOSTO",
    "2025",
    "RUA",
    "CC-22",
    "LOTE: 712 - REM.", 
    "LAURA MOREIRA",
    "69318-105",
    "BOA VISTA",
    "RR",
    "2.220,32",
    "2.654,11",
    "SAUDE",
    "SAÚDE"
];

// Criar lista FIXA de palavras-chave dos engenheiros (sempre serão pesquisadas)
window.PALAVRAS_CHAVE_ENGENHEIROS = (() => {
    const palavras = [];
    for (const [engenheiro, creas] of Object.entries(window.ENGENHEIROS_CREAS_FIXOS)) {
        palavras.push(engenheiro);
        palavras.push(...creas);
    }
    return palavras;
})();

console.log('✅ Configurações carregadas:', {
    engenheiros: Object.keys(window.ENGENHEIROS_CREAS_FIXOS).length,
    projetos: Object.keys(window.MAPEAMENTO_PROJETOS).length,
    palavrasChave: window.PALAVRAS_CHAVE_ENGENHEIROS.length
});


