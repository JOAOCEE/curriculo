const customerId = localStorage.getItem(\'customerId\') || \'guest\';

async function fetchWithCustomerId(url, options = {}) {
    const currentCustomerId = localStorage.getItem(\'customerId\') || \'guest\';
    const separator = url.includes(\'?\') ? \'&\' : \'?\';
    const urlWithCustomerId = `${url}${separator}customer_id=${currentCustomerId}`;

    if (options.method === \'POST\' || options.method === \'PUT\') {
        const body = JSON.parse(options.body || \'{} \');
        body.customer_id = currentCustomerId;
        options.body = JSON.stringify(body);
    }

    return fetch(urlWithCustomerId, options);
}

// Editor de currículo - Funcionalidades principaisfetchWithCustomerId(url, options = {}) {
    const customerId = localStorage.getItem(\'customerId\') || \'guest\';
    const separator = url.includes(\'?\') ? \'&\' : \'?\';
    const urlWithCustomerId = `${url}${separator}customer_id=${customerId}`;

    if (options.method === \'POST\' || options.method === \'PUT\') {
        const body = JSON.parse(options.body || \'{} \');
        body.customer_id = customerId;
        options.body = JSON.stringify(body);
    }

    return fetch(urlWithCustomerId, options);
}

// Editor de currículo - Funcionalidades principais
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do editor
    console.log('Editor de Currículo - Inicializado');
    
    // Configuração de eventos para campos e botões
    setupEventListeners();
    
    // Inicializar a prévia do currículo
    updateResumePreview();
    
    // Inicializar pontuação ATS
    updateATSScore();
});

// Configuração de listeners de eventos
function setupEventListeners() {
    // Atualizar prévia quando os campos de informações pessoais são altera    const personalFields = [\'nome\', \'cargo\', \'email\', \'telefone\', \'localizacao\', \'linkedin\', \'resumo-text\', \'skills\'];lFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateResumePreview);
            element.addEventListener('change', updateResumePreview);
        }
    });
    
    // Botões para adicionar seções
    const addExperienceBtn = document.getElementById('add-experience');
    if (addExperienceBtn) addExperienceBtn.addEventListener('click', addExperienceItem);
    
    const addEducationBtn = document.getElementById('add-education');
    if (addEducationBtn) addEducationBtn.addEventListener('click', addEducationItem);
    
    const addLanguageBtn = document.getElementById('add-language');
    if (addLanguageBtn) addLanguageBtn.addEventListener('click', addLanguageItem);
    
    // Botões para gerar conteúdo
    const generateSummaryBtn = document.getElementById('generate-summary');
    if (generateSummaryBtn) generateSummaryBtn.addEventListener('click', generateSummary);
    
    const generateSkillsBtn = document.getElementById('generate-skills');
    if (generateSkillsBtn) generateSkillsBtn.addEventListener('click', generateSkills);
    
    // Seleção de modelo
    document.querySelectorAll('.template-option').forEach(template => {
        template.addEventListener('click', function() {
            selectTemplate(this);
        });
    });
    
    // Configurar eventos para remover itens
    setupRemoveButtons();
    
    // Adicionar listeners para campos dinâmicos existentes
    setupDynamicFieldListeners();
}

// Configurar listeners para campos dinâmicos (experiências, educação, etc.)
function setupDynamicFieldListeners() {
    // Experiências
    document.querySelectorAll('.experience-item').forEach(item => {
        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('change', updateResumePreview);
        });
    });
    
    // Educação
    document.querySelectorAll('.education-item').forEach(item => {
        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('change', updateResumePreview);
        });
    });
    
    // Idiomas
    document.querySelectorAll('.language-item').forEach(item => {
        const inputs = item.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('change', updateResumePreview);
        });
    });
}

// Atualizar a prévia do currículo com os dados inseridos
function updateResumePreview() {
    // Atualizar informações pessoais
    const name = document.getElementById('fullName').value || 'Seu Nome';
    const jobTitle = document.getElementById('jobTitle').value || 'Cargo Pretendido';
    const email = document.getElementById('email').value || 'email@exemplo.com';
    const phone = document.getElementById('phone').value || '(00) 00000-0000';
    const location = document.getElementById('location').value || 'Cidade, Estado';
    
    document.getElementById('preview-name').textContent = name;
    document.getElementById('preview-title').textContent = jobTitle;
    document.getElementById('preview-email').textContent = email;
    document.getElementById('preview-phone').textContent = phone;
    document.getElementById('preview-location').textContent = location;
    
    // Atualizar resumo profissional
    const summary = document.getElementById('summary').value;
    document.getElementById('preview-summary').textContent = summary || 'Seu resumo profissional aparecerá aqui.';
    
    // Atualizar experiências profissionais
    updateExperiencePreview();
    
    // Atualizar formação acadêmica
    updateEducationPreview();
    
    // Atualizar habilidades
    const skills = document.getElementById('skills').value;
    if (skills) {
        const skillsList = skills.split(',').map(skill => skill.trim());
        const skillsHtml = skillsList.map(skill => `<span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">${skill}</span>`).join('');
        document.getElementById('preview-skills').innerHTML = skillsHtml;
    } else {
        document.getElementById('preview-skills').innerHTML = '<p class="text-gray-500 italic">Suas habilidades aparecerão aqui.</p>';
    }
    
    // Atualizar idiomas
    updateLanguagesPreview();
    
    // Atualizar pontuação ATS após cada mudança
    updateATSScore();
}

// Atualizar a seção de experiências na prévia
function updateExperiencePreview() {
    const experienceItems = document.querySelectorAll('.experience-item');
    let experienceHtml = '';
    
    if (experienceItems.length > 0) {
        experienceItems.forEach(item => {
            const jobTitle = item.querySelector('.job-title').value;
            const company = item.querySelector('.company').value;
            const startDate = formatDate(item.querySelector('.start-date').value);
            const isCurrentJob = item.querySelector('.current-job').checked;
            const endDate = isCurrentJob ? 'Atual' : formatDate(item.querySelector('.end-date').value);
            const description = item.querySelector('.job-description').value;
            
            if (jobTitle || company) {
                experienceHtml += `
                    <div class="mb-3">
                        <p class="font-semibold">${jobTitle || 'Cargo'}</p>
                        <p>${company || 'Empresa'} | ${startDate || 'Data Início'} - ${endDate || 'Data Fim'}</p>
                        <p class="text-gray-700">${description || 'Descrição do cargo'}</p>
                    </div>
                `;
            }
        });
    }
    
    if (experienceHtml) {
        document.getElementById('preview-experience').innerHTML = experienceHtml;
    } else {
        document.getElementById('preview-experience').innerHTML = '<p class="text-gray-500 italic">Suas experiências aparecerão aqui.</p>';
    }
}

// Atualizar a seção de formação na prévia
function updateEducationPreview() {
    const educationItems = document.querySelectorAll('.education-item');
    let educationHtml = '';
    
    if (educationItems.length > 0) {
        educationItems.forEach(item => {
            const degree = item.querySelector('.degree').value;
            const institution = item.querySelector('.institution').value;
            const startDate = formatDate(item.querySelector('.edu-start-date').value, true);
            const isCurrentEducation = item.querySelector('.current-education').checked;
            const endDate = isCurrentEducation ? 'Atual' : formatDate(item.querySelector('.edu-end-date').value, true);
            
            if (degree || institution) {
                educationHtml += `
                    <div class="mb-3">
                        <p class="font-semibold">${degree || 'Curso/Grau'}</p>
                        <p>${institution || 'Instituição'} | ${startDate || 'Data Início'} - ${endDate || 'Data Fim'}</p>
                    </div>
                `;
            }
        });
    }
    
    if (educationHtml) {
        document.getElementById('preview-education').innerHTML = educationHtml;
    } else {
        document.getElementById('preview-education').innerHTML = '<p class="text-gray-500 italic">Sua formação aparecerá aqui.</p>';
    }
}

// Atualizar a seção de idiomas na prévia
function updateLanguagesPreview() {
    const languageItems = document.querySelectorAll('.language-item');
    let languagesHtml = '';
    
    if (languageItems.length > 0) {
        languageItems.forEach(item => {
            const language = item.querySelector('.language-name').value;
            const level = item.querySelector('.language-level').value;
            
            if (language) {
                languagesHtml += `
                    <div class="mb-1">
                        <span class="font-semibold">${language}</span>: ${level}
                    </div>
                `;
            }
        });
    }
    
    if (languagesHtml) {
        document.getElementById('preview-languages').innerHTML = languagesHtml;
    } else {
        document.getElementById('preview-languages').innerHTML = '<p class="text-gray-500 italic">Seus idiomas aparecerão aqui.</p>';
    }
}

// Adicionar um novo item de experiência
function addExperienceItem() {
    const container = document.getElementById('experience-container');
    const newItem = document.createElement('div');
    newItem.className = 'experience-item border border-gray-200 rounded-md p-4 mb-4';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Cargo</label>
                <input type="text" class="job-title mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Empresa</label>
                <input type="text" class="company mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="month" class="start-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Data de Término</label>
                <input type="month" class="end-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <div class="mt-1">
                    <input type="checkbox" class="current-job" id="current-job-${Date.now()}">
                    <label for="current-job-${Date.now()}" class="text-sm text-gray-700">Emprego atual</label>
                </div>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea class="job-description mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" rows="3"></textarea>
            <button class="generate-description mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                <i class="fas fa-magic mr-1"></i> Gerar Descrição
            </button>
        </div>
        <div class="mt-4 flex justify-end">
            <button class="remove-experience text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i> Remover
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Adicionar event listeners para o novo item (atualização em tempo real)
    newItem.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateResumePreview);
        input.addEventListener('change', updateResumePreview);
    });
    
    newItem.querySelector('.generate-description').addEventListener('click', function() {
        generateJobDescription(newItem);
    });
    
    newItem.querySelector('.remove-experience').addEventListener('click', function() {
        container.removeChild(newItem);
        updateResumePreview();
    });
    
    // Atualizar a prévia
    updateResumePreview();
}

// Adicionar um novo item de formação
function addEducationItem() {
    const container = document.getElementById('education-container');
    const newItem = document.createElement('div');
    newItem.className = 'education-item border border-gray-200 rounded-md p-4 mb-4';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Curso/Grau</label>
                <input type="text" class="degree mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Instituição</label>
                <input type="text" class="institution mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="month" class="edu-start-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Data de Conclusão</label>
                <input type="month" class="edu-end-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <div class="mt-1">
                    <input type="checkbox" class="current-education" id="current-edu-${Date.now()}">
                    <label for="current-edu-${Date.now()}" class="text-sm text-gray-700">Em andamento</label>
                </div>
            </div>
        </div>
        <div class="mt-4 flex justify-end">
            <button class="remove-education text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i> Remover
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Adicionar event listeners para o novo item
    newItem.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateResumePreview);
    });
    
    newItem.querySelector('.remove-education').addEventListener('click', function() {
        container.removeChild(newItem);
        updateResumePreview();
    });
    
    // Atualizar a prévia
    updateResumePreview();
}

// Adicionar um novo item de idioma
function addLanguageItem() {
    const container = document.getElementById('languages-container');
    const newItem = document.createElement('div');
    newItem.className = 'language-item grid grid-cols-2 gap-4 mb-4';
    newItem.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-gray-700">Idioma</label>
            <input type="text" class="language-name mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700">Nível</label>
            <select class="language-level mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Fluente">Fluente</option>
                <option value="Nativo">Nativo</option>
            </select>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Adicionar event listeners para o novo item
    newItem.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updateResumePreview);
    });
    
    // Atualizar a prévia
    updateResumePreview();
}

// Configurar botões de remoção
function setupRemoveButtons() {
    document.querySelectorAll('.remove-experience').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.experience-item');
            item.parentNode.removeChild(item);
            updateResumePreview();
        });
    });
    
    document.querySelectorAll('.remove-education').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.education-item');
            item.parentNode.removeChild(item);
            updateResumePreview();
        });
    });
}

// Selecionar um modelo de currículo
function selectTemplate(templateElement) {
    // Remover seleção atual
    document.querySelectorAll('.template-option').forEach(template => {
        template.classList.remove('border-indigo-500', 'border-2');
        template.classList.add('border-gray-200', 'border');
    });
    
    // Adicionar seleção ao modelo clicado
    templateElement.classList.remove('border-gray-200', 'border');
    templateElement.classList.add('border-indigo-500', 'border-2');
    
    // Aplicar estilo do modelo selecionado
    const templateName = templateElement.getAttribute('data-template');
    applyTemplateStyle(templateName);
}

// Aplicar estilo do modelo selecionado
function applyTemplateStyle(templateName) {
    const previewElement = document.getElementById('resume-preview');
    
    // Remover classes de estilo anteriores
    previewElement.classList.remove('template-classic', 'template-modern', 'template-executive');
    
    // Adicionar classe do novo modelo
    previewElement.classList.add(`template-${templateName}`);
    
    // Aplicar estilos específicos para cada modelo
    switch(templateName) {
        case 'classic':
            previewElement.style.fontFamily = 'Georgia, serif';
            break;
        case 'modern':
            previewElement.style.fontFamily = 'Arial, sans-serif';
            break;
        case 'executive':
            previewElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
            break;
    }
    
    // Atualizar a prévia
    updateResumePreview();
}

// Gerar resumo profissional
function generateSummary() {
    const jobTitle = document.getElementById('jobTitle').value;
    const skills = document.getElementById('skills').value;
    
    if (!jobTitle) {
        alert('Por favor, preencha o cargo pretendido para gerar um resumo personalizado.');
        return;
    }
    
    // Simulação de geração de resumo baseado no cargo
    let summary = '';
    
    if (jobTitle.toLowerCase().includes('desenvolvedor') || jobTitle.toLowerCase().includes('programador')) {
        summary = `Desenvolvedor de software experiente com sólidos conhecimentos em desenvolvimento de aplicações e resolução de problemas complexos. Comprometido com a entrega de código limpo e eficiente, buscando constantemente aprimorar habilidades técnicas e acompanhar as tendências do mercado.`;
    } else if (jobTitle.toLowerCase().includes('marketing')) {
        summary = `Profissional de marketing criativo e orientado a resultados, com experiência em desenvolvimento e implementação de estratégias de marketing digital. Habilidade para analisar dados e tendências de mercado, identificando oportunidades para aumentar o engajamento e conversão.`;
    } else if (jobTitle.toLowerCase().includes('vendas')) {
        summary = `Profissional de vendas dinâmico com histórico comprovado de superação de metas e construção de relacionamentos duradouros com clientes. Habilidade para identificar necessidades dos clientes e oferecer soluções personalizadas que agregam valor ao negócio.`;
    } else if (jobTitle.toLowerCase().includes('administra')) {
        summary = `Profissional de administração organizado e eficiente, com experiência em otimização de processos e gestão de recursos. Capacidade de trabalhar sob pressão, priorizar tarefas e garantir o cumprimento de prazos, contribuindo para a eficiência operacional da empresa.`;
    } else {
        summary = `Profissional dedicado e proativo na área de ${jobTitle}, com foco em resultados e melhoria contínua. Capacidade de adaptação a novos desafios e trabalho em equipe, buscando constantemente o desenvolvimento profissional e contribuição para os objetivos organizacionais.`;
    }
    
    document.getElementById('summary').value = summary;
    updateResumePreview();
}

// Gerar descrição de cargo
function generateJobDescription(experienceItem) {
    const jobTitle = experienceItem.querySelector('.job-title').value;
    const company = experienceItem.querySelector('.company').value;
    
    if (!jobTitle) {
        alert('Por favor, preencha o cargo para gerar uma descrição personalizada.');
        return;
    }
    
    // Simulação de geração de descrição baseada no cargo
    let description = '';
    
    if (jobTitle.toLowerCase().includes('desenvolvedor') || jobTitle.toLowerCase().includes('programador')) {
        description = `• Desenvolvimento e manutenção de aplicações utilizando tecnologias modernas\n• Colaboração com equipes multidisciplinares para implementação de novos recursos\n• Otimização de código para melhorar performance e escalabilidade\n• Participação em code reviews e implementação de boas práticas de desenvolvimento`;
    } else if (jobTitle.toLowerCase().includes('marketing')) {
        description = `• Desenvolvimento e execução de campanhas de marketing digital\n• Análise de métricas e KPIs para otimização de estratégias\n• Criação de conteúdo para diferentes canais e públicos\n• Gerenciamento de presença nas redes sociais e aumento de engajamento`;
    } else if (jobTitle.toLowerCase().includes('vendas')) {
        description = `• Prospecção de novos clientes e manutenção de relacionamento com clientes existentes\n• Superação consistente de metas de vendas trimestrais\n• Negociação de contratos e condições comerciais\n• Identificação de oportunidades de cross-selling e up-selling`;
    } else if (jobTitle.toLowerCase().includes('administra')) {
        description = `• Gerenciamento de processos administrativos e documentação\n• Coordenação de equipe e distribuição de tarefas\n• Otimização de fluxos de trabalho para aumentar eficiência\n• Elaboração de relatórios gerenciais para tomada de decisão`;
    } else {
        description = `• Execução de atividades relacionadas à função de ${jobTitle}\n• Colaboração com equipes internas para atingir objetivos organizacionais\n• Implementação de melhorias nos processos existentes\n• Resolução de problemas de forma eficiente e proativa`;
    }
    
    experienceItem.querySelector('.job-description').value = description;
    updateResumePreview();
}

// Gerar habilidades
function generateSkills() {
    const jobTitle = document.getElementById('jobTitle').value;
    
    if (!jobTitle) {
        alert('Por favor, preencha o cargo pretendido para gerar habilidades relevantes.');
        return;
    }
    
    // Simulação de geração de habilidades baseadas no cargo
    let skills = '';
    
    if (jobTitle.toLowerCase().includes('desenvolvedor') || jobTitle.toLowerCase().includes('programador')) {
        skills = 'JavaScript, HTML5, CSS3, React, Node.js, Git, API RESTful, SQL, Metodologias Ágeis, Resolução de Problemas';
    } else if (jobTitle.toLowerCase().includes('marketing')) {
        skills = 'Marketing Digital, SEO, Google Analytics, Redes Sociais, Email Marketing, Copywriting, Gestão de Campanhas, Adobe Creative Suite, Marketing de Conteúdo';
    } else if (jobTitle.toLowerCase().includes('vendas')) {
        skills = 'Negociação, Prospecção, CRM, Vendas Consultivas, Relacionamento com Cliente, Apresentações, Fechamento de Vendas, Análise de Mercado';
    } else if (jobTitle.toLowerCase().includes('administra')) {
        skills = 'Gestão de Processos, Pacote Office, Organização, Controle Financeiro, Atendimento ao Cliente, Gestão de Tempo, Comunicação, Liderança';
    } else {
        skills = 'Comunicação, Trabalho em Equipe, Organização, Resolução de Problemas, Adaptabilidade, Gestão de Tempo, Atenção aos Detalhes, Proatividade';
    }
    
    document.getElementById('skills').value = skills;
    updateResumePreview();
}

// Atualizar pontuação ATS
function updateATSScore() {
    // Simulação de análise ATS
    let score = 0;
    let feedback = [];
    
    // Verificar informações pessoais
    if (document.getElementById('fullName').value) score += 5;
    if (document.getElementById('jobTitle').value) score += 5;
    if (document.getElementById('email').value) score += 5;
    if (document.getElementById('phone').value) score += 5;
    if (document.getElementById('location').value) score += 5;
    
    // Verificar resumo
    const summary = document.getElementById('summary').value;
    if (summary) {
        score += 10;
        if (summary.length > 100) score += 5;
    }
    
    // Verificar experiências
    const experienceItems = document.querySelectorAll('.experience-item');
    if (experienceItems.length > 0) {
        score += 5;
        let hasDescriptions = false;
        experienceItems.forEach(item => {
            const description = item.querySelector('.job-description').value;
            if (description && description.length > 50) {
                hasDescriptions = true;
                score += 5;
            }
        });
        
        if (!hasDescriptions) {
            feedback.push('<i class="fas fa-exclamation-circle text-yellow-500 mr-1"></i> Adicione descrições detalhadas às suas experiências');
        } else {
            feedback.push('<i class="fas fa-check-circle text-green-500 mr-1"></i> Boas descrições de experiência profissional');
        }
    } else {
        feedback.push('<i class="fas fa-times-circle text-red-500 mr-1"></i> Adicione pelo menos uma experiência profissional');
    }
    
    // Verificar formação
    const educationItems = document.querySelectorAll('.education-item');
    if (educationItems.length > 0) {
        score += 10;
    } else {
        feedback.push('<i class="fas fa-exclamation-circle text-yellow-500 mr-1"></i> Adicione sua formação acadêmica');
    }
    
    // Verificar habilidades
    const skills = document.getElementById('skills').value;
    if (skills) {
        const skillsList = skills.split(',');
        score += Math.min(10, skillsList.length * 2);
        
        if (skillsList.length < 5) {
            feedback.push('<i class="fas fa-exclamation-circle text-yellow-500 mr-1"></i> Adicione mais habilidades relevantes');
        } else {
            feedback.push('<i class="fas fa-check-circle text-green-500 mr-1"></i> Bom conjunto de habilidades');
        }
    } else {
        feedback.push('<i class="fas fa-times-circle text-red-500 mr-1"></i> Adicione suas habilidades principais');
    }
    
    // Verificar idiomas
    const languageItems = document.querySelectorAll('.language-item');
    if (languageItems.length > 0) {
        score += 5;
    } else {
        feedback.push('<i class="fas fa-exclamation-circle text-yellow-500 mr-1"></i> Adicione seus conhecimentos em idiomas');
    }
    
    // Verificar palavras-chave relevantes
    const jobTitle = document.getElementById('jobTitle').value.toLowerCase();
    let keywordScore = 0;
    
    if (jobTitle) {
        const allText = document.getElementById('resume-preview').innerText.toLowerCase();
        
        // Simulação de palavras-chave relevantes para diferentes áreas
        let keywords = [];
        
        if (jobTitle.includes('desenvolvedor') || jobTitle.includes('programador')) {
            keywords = ['desenvolvimento', 'software', 'programação', 'código', 'aplicação', 'tecnologia', 'sistema'];
        } else if (jobTitle.includes('marketing')) {
            keywords = ['campanha', 'estratégia', 'digital', 'conteúdo', 'mídia', 'análise', 'mercado'];
        } else if (jobTitle.includes('vendas')) {
            keywords = ['cliente', 'negociação', 'meta', 'resultado', 'prospecção', 'comercial', 'venda'];
        } else if (jobTitle.includes('administra')) {
            keywords = ['gestão', 'processo', 'organização', 'controle', 'planejamento', 'relatório', 'coordenação'];
        }
        
        keywords.forEach(keyword => {
            if (allText.includes(keyword)) {
                keywordScore += 2;
            }
        });
        
        score += Math.min(15, keywordScore);
        
        if (keywordScore < 6) {
            feedback.push('<i class="fas fa-times-circle text-red-500 mr-1"></i> Faltam palavras-chave relevantes para a vaga');
        } else if (keywordScore < 10) {
            feedback.push('<i class="fas fa-exclamation-circle text-yellow-500 mr-1"></i> Adicione mais palavras-chave específicas da área');
        } else {
            feedback.push('<i class="fas fa-check-circle text-green-500 mr-1"></i> Bom uso de palavras-chave relevantes');
        }
    }
    
    // Atualizar pontuação na interface
    score = Math.min(100, score);
    document.getElementById('ats-score').textContent = `${score}/100`;
    document.getElementById('ats-progress').style.width = `${score}%`;
    
    // Definir cor da barra de progresso baseada na pontuação
    const progressBar = document.getElementById('ats-progress');
    if (score < 50) {
        progressBar.classList.remove('bg-yellow-500', 'bg-green-500', 'bg-indigo-600');
        progressBar.classList.add('bg-red-500');
    } else if (score < 70) {
        progressBar.classList.remove('bg-red-500', 'bg-green-500', 'bg-indigo-600');
        progressBar.classList.add('bg-yellow-500');
    } else if (score < 90) {
        progressBar.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-indigo-600');
        progressBar.classList.add('bg-green-500');
    } else {
        progressBar.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
        progressBar.classList.add('bg-indigo-600');
    }
    
    // Atualizar feedback na interface
    if (feedback.length === 0) {
        feedback.push('<i class="fas fa-check-circle text-green-500 mr-1"></i> Seu currículo está otimizado para ATS!');
    }
    
    document.getElementById('ats-feedback').innerHTML = feedback.join('<br>');
    
    // Sistema de Upsell Inteligente
    checkForUpsellOpportunity(score);
}

// Exportar para PDF
function exportToPDF() {
    const element = document.getElementById('resume-preview');
    const name = document.getElementById('fullName').value || 'curriculo';
    const filename = `${name.toLowerCase().replace(/\s+/g, '_')}_curriculo.pdf`;
    
    // Configurações para o PDF
    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gerar o PDF
    html2pdf().set(opt).from(element).save();
    
    alert('Seu currículo foi exportado com sucesso!');
}

// Salvar currículo
function saveResume() {
    try {
        // Coletar todos os dados do formulário
        const resumeData = {
            personalInfo: {
                fullName: document.getElementById('fullName')?.value || '',
                jobTitle: document.getElementById('jobTitle')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                location: document.getElementById('location')?.value || '',
                linkedin: document.getElementById('linkedin')?.value || '',
                summary: document.getElementById('summary')?.value || ''
            },
            experiences: [],
            education: [],
            skills: document.getElementById('skills')?.value || '',
            languages: [],
            timestamp: new Date().toISOString()
        };
        
        // Coletar experiências
        document.querySelectorAll('.experience-item').forEach(item => {
            const experience = {
                jobTitle: item.querySelector('.job-title')?.value || '',
                company: item.querySelector('.company')?.value || '',
                startDate: item.querySelector('.start-date')?.value || '',
                endDate: item.querySelector('.end-date')?.value || '',
                currentJob: item.querySelector('.current-job')?.checked || false,
                description: item.querySelector('.job-description')?.value || ''
            };
            if (experience.jobTitle || experience.company) {
                resumeData.experiences.push(experience);
            }
        });
        
        // Coletar formação
        document.querySelectorAll('.education-item').forEach(item => {
            const education = {
                degree: item.querySelector('.degree')?.value || '',
                institution: item.querySelector('.institution')?.value || '',
                startDate: item.querySelector('.edu-start-date')?.value || '',
                endDate: item.querySelector('.edu-end-date')?.value || '',
                currentEducation: item.querySelector('.current-education')?.checked || false
            };
            if (education.degree || education.institution) {
                resumeData.education.push(education);
            }
        });
        
        // Coletar idiomas
        document.querySelectorAll('.language-item').forEach(item => {
            const language = {
                name: item.querySelector('.language-name')?.value || '',
                level: item.querySelector('.language-level')?.value || ''
            };
            if (language.name) {
                resumeData.languages.push(language);
            }
        });
        
        // Salvar no localStorage
        localStorage.setItem('curriculo_salvo', JSON.stringify(resumeData));
        
        // Mostrar feedback visual de sucesso
        const saveBtn = document.querySelector('button[onclick="saveResume()"]');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Salvo com sucesso!';
            saveBtn.style.backgroundColor = '#10B981';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.backgroundColor = '';
            }, 2000);
        }
        
        console.log('Currículo salvo com sucesso:', resumeData);
        
    } catch (error) {
        console.error('Erro ao salvar currículo:', error);
        alert('Erro ao salvar currículo. Tente novamente.');
    }
}

// Sistema de Upsell Inteligente
let upsellShown = false;

function checkForUpsellOpportunity(score) {
    // Verificar se o usuário é premium
    const isPremium = localStorage.getItem('isPremium') === 'true';
    
    if (isPremium || upsellShown) {
        return; // Não mostrar upsell para usuários premium ou se já foi mostrado
    }
    
    // Mostrar upsell quando o currículo está bem avaliado
    if (score >= 70) {
        setTimeout(() => {
            showUpsellModal(score);
            upsellShown = true;
        }, 2000); // Aguardar 2 segundos para não ser intrusivo
    }
}

function showUpsellModal(score) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 relative animate-pulse-slow">
            <button onclick="closeUpsellModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-star text-yellow-500 text-4xl"></i>
                </div>
                
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                    🎉 Parabéns! Seu currículo está ${score}% otimizado!
                </h3>
                
                <p class="text-gray-600 mb-6">
                    Você está quase lá! Desbloqueie todos os templates premium e recursos avançados para finalizar seu currículo perfeito.
                </p>
                
                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg mb-6">
                    <div class="text-lg font-bold">Oferta Especial</div>
                    <div class="text-2xl font-bold">R$ 7,00/mês</div>
                    <div class="text-sm opacity-90">Cancele quando quiser</div>
                </div>
                
                <div class="space-y-2 text-left mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i>
                        <span class="text-sm">3 templates profissionais</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i>
                        <span class="text-sm">Currículos ilimitados</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i>
                        <span class="text-sm">Análise ATS avançada</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i>
                        <span class="text-sm">Assistente IA completo</span>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <button onclick="redirectToPremium()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                        Assinar Agora - R$ 7,00/mês
                    </button>
                    
                    <button onclick="closeUpsellModal()" class="w-full text-gray-500 py-2 hover:text-gray-700">
                        Continuar com plano gratuito
                    </button>
                </div>
                
                <div class="mt-4 text-xs text-gray-400">
                    💳 Pagamento seguro via Stripe • Cancele a qualquer momento
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar animação de entrada
    setTimeout(() => {
        modal.querySelector('.bg-white').classList.add('animate-bounce-in');
    }, 100);
}

function closeUpsellModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

function redirectToPremium() {
    window.location.href = '/premium.html';
}

// Contador de ações para trigger de upsell alternativo
let userActions = 0;

function trackUserAction() {
    userActions++;
    
    // Trigger upsell após várias ações (usuário engajado)
    if (userActions >= 10 && !upsellShown && localStorage.getItem('isPremium') !== 'true') {
        setTimeout(() => {
            showEngagementUpsell();
            upsellShown = true;
        }, 1000);
    }
}

function showEngagementUpsell() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 relative">
            <button onclick="closeUpsellModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-rocket text-indigo-500 text-4xl"></i>
                </div>
                
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                    Você está criando um ótimo currículo! 🚀
                </h3>
                
                <p class="text-gray-600 mb-6">
                    Que tal desbloquear todos os recursos premium para criar currículos ainda mais impressionantes?
                </p>
                
                <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg mb-6">
                    <div class="text-lg font-bold">Apenas R$ 7,00/mês</div>
                    <div class="text-sm opacity-90">Primeiro mês com 50% de desconto</div>
                </div>
                
                <button onclick="redirectToPremium()" class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                    Ver Planos Premium
                </button>
                
                <button onclick="closeUpsellModal()" class="w-full text-gray-500 py-2 mt-2 hover:text-gray-700">
                    Continuar editando
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Adicionar tracking de ações aos event listeners existentes
document.addEventListener('DOMContentLoaded', function() {
    // Interceptar cliques e inputs para tracking
    document.addEventListener('click', trackUserAction);
    document.addEventListener('input', trackUserAction);
});

// Formatar data (YYYY-MM para MM/YYYY)
function formatDate(dateString, yearOnly = false) {
    if (!dateString) return '';
    
    const [year, month] = dateString.split('-');
    
    if (yearOnly) {
        return year;
    }
    
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[parseInt(month) - 1]} de ${year}`;
}


// Função para exportar currículo como PDF usando html2pdf.js
function exportToPDF() {
    const element = document.getElementById("resume-preview");
    
    if (!element) {
        alert("Erro: Área de preview do currículo não encontrada!");
        return;
    }
    
    // Verificar se html2pdf está disponível
    if (typeof html2pdf === 'undefined') {
        console.warn('html2pdf não está disponível, usando window.print() como fallback');
        // Fallback para impressão nativa do navegador
        window.print();
        return;
    }
    
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     'curriculo.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Mostrar indicador de carregamento
    const exportBtn = document.querySelector('button[onclick="exportToPDF()"]');
    if (exportBtn) {
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Gerando PDF...';
        exportBtn.disabled = true;
        
        html2pdf().from(element).set(opt).save().then(() => {
            // Restaurar botão após exportação
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            
            // Mostrar feedback visual de sucesso
            exportBtn.innerHTML = '<i class="fas fa-check mr-2"></i> PDF exportado!';
            exportBtn.style.backgroundColor = '#10B981';
            
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
                exportBtn.style.backgroundColor = '';
            }, 2000);
            
        }).catch((error) => {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        });
    } else {
        // Se não encontrar o botão, executar diretamente
        html2pdf().from(element).set(opt).save().then(() => {
            alert('PDF gerado com sucesso!');
        }).catch((error) => {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        });
    }
}



// Sistema de Auto-salvamento
let autoSaveInterval;
let lastSaveData = '';

function initAutoSave() {
    // Carregar dados salvos ao inicializar
    loadAutoSavedData();
    
    // Configurar auto-salvamento a cada 5 segundos
    autoSaveInterval = setInterval(autoSaveData, 5000);
    
    // Salvar antes de sair da página
    window.addEventListener('beforeunload', function(e) {
        autoSaveData();
    });
    
    console.log('Auto-salvamento ativado - dados salvos a cada 5 segundos');
}

function autoSaveData() {
    try {
        const formData = {
            personalInfo: {
                fullName: document.getElementById('fullName')?.value || '',
                jobTitle: document.getElementById('jobTitle')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                location: document.getElementById('location')?.value || '',
                summary: document.getElementById('summary')?.value || '',
                skills: document.getElementById('skills')?.value || ''
            },
            experiences: [],
            education: [],
            languages: [],
            timestamp: new Date().toISOString()
        };
        
        // Coletar experiências
        document.querySelectorAll('.experience-item').forEach(item => {
            const experience = {
                jobTitle: item.querySelector('.job-title')?.value || '',
                company: item.querySelector('.company')?.value || '',
                startDate: item.querySelector('.start-date')?.value || '',
                endDate: item.querySelector('.end-date')?.value || '',
                currentJob: item.querySelector('.current-job')?.checked || false,
                description: item.querySelector('.job-description')?.value || ''
            };
            formData.experiences.push(experience);
        });
        
        // Coletar formação
        document.querySelectorAll('.education-item').forEach(item => {
            const education = {
                degree: item.querySelector('.degree')?.value || '',
                institution: item.querySelector('.institution')?.value || '',
                startDate: item.querySelector('.edu-start-date')?.value || '',
                endDate: item.querySelector('.edu-end-date')?.value || '',
                currentEducation: item.querySelector('.current-education')?.checked || false
            };
            formData.education.push(education);
        });
        
        // Coletar idiomas
        document.querySelectorAll('.language-item').forEach(item => {
            const language = {
                name: item.querySelector('.language-name')?.value || '',
                level: item.querySelector('.language-level')?.value || ''
            };
            formData.languages.push(language);
        });
        
        const dataString = JSON.stringify(formData);
        
        // Só salvar se os dados mudaram
        if (dataString !== lastSaveData) {
            localStorage.setItem('curriculo_autosave', dataString);
            lastSaveData = dataString;
            
            // Mostrar indicador visual de salvamento
            showSaveIndicator();
        }
        
    } catch (error) {
        console.error('Erro no auto-salvamento:', error);
    }
}

function loadAutoSavedData() {
    try {
        const savedData = localStorage.getItem('curriculo_autosave');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Mostrar notificação de dados recuperados
            if (confirm('Encontramos dados salvos automaticamente. Deseja recuperá-los?')) {
                restoreFormData(formData);
                updateResumePreview();
                console.log('Dados auto-salvos recuperados com sucesso');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados auto-salvos:', error);
    }
}

function restoreFormData(formData) {
    // Restaurar informações pessoais
    if (formData.personalInfo) {
        const fields = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'summary', 'skills'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && formData.personalInfo[field]) {
                element.value = formData.personalInfo[field];
            }
        });
    }
    
    // Restaurar experiências
    if (formData.experiences && formData.experiences.length > 0) {
        // Limpar experiências existentes
        const container = document.getElementById('experience-container');
        container.innerHTML = '';
        
        formData.experiences.forEach(exp => {
            addExperienceItem();
            const lastItem = container.lastElementChild;
            if (lastItem) {
                lastItem.querySelector('.job-title').value = exp.jobTitle || '';
                lastItem.querySelector('.company').value = exp.company || '';
                lastItem.querySelector('.start-date').value = exp.startDate || '';
                lastItem.querySelector('.end-date').value = exp.endDate || '';
                lastItem.querySelector('.current-job').checked = exp.currentJob || false;
                lastItem.querySelector('.job-description').value = exp.description || '';
            }
        });
    }
    
    // Restaurar formação
    if (formData.education && formData.education.length > 0) {
        const container = document.getElementById('education-container');
        container.innerHTML = '';
        
        formData.education.forEach(edu => {
            addEducationItem();
            const lastItem = container.lastElementChild;
            if (lastItem) {
                lastItem.querySelector('.degree').value = edu.degree || '';
                lastItem.querySelector('.institution').value = edu.institution || '';
                lastItem.querySelector('.edu-start-date').value = edu.startDate || '';
                lastItem.querySelector('.edu-end-date').value = edu.endDate || '';
                lastItem.querySelector('.current-education').checked = edu.currentEducation || false;
            }
        });
    }
    
    // Restaurar idiomas
    if (formData.languages && formData.languages.length > 0) {
        const container = document.getElementById('languages-container');
        container.innerHTML = '';
        
        formData.languages.forEach(lang => {
            addLanguageItem();
            const lastItem = container.lastElementChild;
            if (lastItem) {
                lastItem.querySelector('.language-name').value = lang.name || '';
                lastItem.querySelector('.language-level').value = lang.level || '';
            }
        });
    }
}

function showSaveIndicator() {
    // Criar ou atualizar indicador de salvamento
    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = '<i class="fas fa-check mr-2"></i>Salvo automaticamente';
    indicator.style.opacity = '1';
    
    // Esconder após 2 segundos
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

function clearAutoSavedData() {
    localStorage.removeItem('curriculo_autosave');
    console.log('Dados auto-salvos limpos');
}

// Inicializar auto-salvamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(initAutoSave, 1000);
});



// Carregar dados salvos automaticamente
function loadAutoSavedData() {
    try {
        const savedData = localStorage.getItem('curriculo_salvo');
        if (savedData) {
            const resumeData = JSON.parse(savedData);

            // Preencher informações pessoais
            if (resumeData.personalInfo) {
                document.getElementById('fullName').value = resumeData.personalInfo.fullName || '';
                document.getElementById('jobTitle').value = resumeData.personalInfo.jobTitle || '';
                document.getElementById('email').value = resumeData.personalInfo.email || '';
                document.getElementById('phone').value = resumeData.personalInfo.phone || '';
                document.getElementById('location').value = resumeData.personalInfo.location || '';
                document.getElementById('linkedin').value = resumeData.personalInfo.linkedin || '';
                document.getElementById('summary').value = resumeData.personalInfo.summary || '';
            }

            // Preencher experiências (limpar existentes e adicionar novas)
            const experiencesContainer = document.getElementById('experiences-container');
            if (experiencesContainer) {
                experiencesContainer.innerHTML = ''; // Limpar antes de carregar
                resumeData.experiences.forEach(exp => {
                    addExperienceItem(exp);
                });
            }

            // Preencher formação (limpar existentes e adicionar novas)
            const educationContainer = document.getElementById('education-container');
            if (educationContainer) {
                educationContainer.innerHTML = ''; // Limpar antes de carregar
                resumeData.education.forEach(edu => {
                    addEducationItem(edu);
                });
            }

            // Preencher habilidades
            document.getElementById('skills').value = resumeData.skills || '';

            // Preencher idiomas (limpar existentes e adicionar novas)
            const languagesContainer = document.getElementById('languages-container');
            if (languagesContainer) {
                languagesContainer.innerHTML = ''; // Limpar antes de carregar
                resumeData.languages.forEach(lang => {
                    addLanguageItem(lang);
                });
            }

            console.log('Dados do currículo carregados com sucesso:', resumeData);
            updateResumePreview(); // Atualizar preview após carregar dados
        }
    } catch (error) {
        console.error('Erro ao carregar dados do currículo:', error);
    }
}

// Chamar a função de carregamento ao carregar a página
document.addEventListener('DOMContentLoaded', loadAutoSavedData);

// Adicionar auto-salvamento a cada 5 segundos
setInterval(saveResume, 5000);

// Funções auxiliares para adicionar itens (se ainda não existirem)
function addExperienceItem(data = {}) {
    const container = document.getElementById('experiences-container');
    const newItem = document.createElement('div');
    newItem.className = 'experience-item border p-4 mb-4 rounded-lg shadow-sm bg-gray-50';
    newItem.innerHTML = `
        <div class="flex justify-end">
            <button type="button" onclick="this.closest('.experience-item').remove(); updateResumePreview();" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </div>
        <div class="mb-4">
            <label for="job-title" class="block text-sm font-medium text-gray-700">Cargo</label>
            <input type="text" class="job-title mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Desenvolvedor Front-end" value="${data.jobTitle || ''}">
        </div>
        <div class="mb-4">
            <label for="company" class="block text-sm font-medium text-gray-700">Empresa</label>
            <input type="text" class="company mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Empresa XYZ" value="${data.company || ''}">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label for="start-date" class="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="month" class="start-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${data.startDate || ''}">
            </div>
            <div>
                <label for="end-date" class="block text-sm font-medium text-gray-700">Data de Término</label>
                <input type="month" class="end-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${data.endDate || ''}">
            </div>
        </div>
        <div class="mb-4 flex items-center">
            <input type="checkbox" class="current-job h-4 w-4 text-indigo-600 border-gray-300 rounded" ${data.currentJob ? 'checked' : ''}>
            <label for="current-job" class="ml-2 block text-sm text-gray-900">Emprego atual</label>
        </div>
        <div class="mb-4">
            <label for="job-description" class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea class="job-description mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3" placeholder="Responsabilidades e conquistas...">${data.description || ''}</textarea>
            <p class="text-xs text-gray-500 mt-1">Sugerir melhorias <i class="fas fa-lightbulb"></i> Use verbos de ação e resultados quantificáveis</p>
        </div>
    `;
    container.appendChild(newItem);
    // Adicionar listeners para o novo item
    newItem.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateResumePreview);
        input.addEventListener('change', updateResumePreview);
    });
}

function addEducationItem(data = {}) {
    const container = document.getElementById('education-container');
    const newItem = document.createElement('div');
    newItem.className = 'education-item border p-4 mb-4 rounded-lg shadow-sm bg-gray-50';
    newItem.innerHTML = `
        <div class="flex justify-end">
            <button type="button" onclick="this.closest('.education-item').remove(); updateResumePreview();" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </div>
        <div class="mb-4">
            <label for="degree" class="block text-sm font-medium text-gray-700">Curso</label>
            <input type="text" class="degree mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Ciência da Computação" value="${data.degree || ''}">
        </div>
        <div class="mb-4">
            <label for="institution" class="block text-sm font-medium text-gray-700">Instituição</label>
            <input type="text" class="institution mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Universidade XYZ" value="${data.institution || ''}">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label for="edu-start-date" class="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="month" class="edu-start-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${data.startDate || ''}">
            </div>
            <div>
                <label for="edu-end-date" class="block text-sm font-medium text-gray-700">Data de Conclusão</label>
                <input type="month" class="edu-end-date mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${data.endDate || ''}">
            </div>
        </div>
        <div class="mb-4 flex items-center">
            <input type="checkbox" class="current-education h-4 w-4 text-indigo-600 border-gray-300 rounded" ${data.currentEducation ? 'checked' : ''}>
            <label for="current-education" class="ml-2 block text-sm text-gray-900">Em andamento</label>
        </div>
    `;
    container.appendChild(newItem);
    // Adicionar listeners para o novo item
    newItem.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateResumePreview);
        input.addEventListener('change', updateResumePreview);
    });
}

function addLanguageItem(data = {}) {
    const container = document.getElementById('languages-container');
    const newItem = document.createElement('div');
    newItem.className = 'language-item border p-4 mb-4 rounded-lg shadow-sm bg-gray-50';
    newItem.innerHTML = `
        <div class="flex justify-end">
            <button type="button" onclick="this.closest('.language-item').remove(); updateResumePreview();" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </div>
        <div class="mb-4">
            <label for="language-name" class="block text-sm font-medium text-gray-700">Idioma</label>
            <input type="text" class="language-name mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Português" value="${data.name || ''}">
        </div>
        <div class="mb-4">
            <label for="language-level" class="block text-sm font-medium text-gray-700">Nível</label>
            <input type="text" class="language-level mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Nativo, Avançado" value="${data.level || ''}">
        </div>
    `;
    container.appendChild(newItem);
    // Adicionar listeners para o novo item
    newItem.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateResumePreview);
        input.addEventListener('change', updateResumePreview);
    });
}

// Adicionar listeners para os botões de adicionar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-experience').addEventListener('click', () => addExperienceItem());
    document.getElementById('add-education').addEventListener('click', () => addEducationItem());
    document.getElementById('add-language').addEventListener('click', () => addLanguageItem());
});

// Certificar-se de que os containers existem
document.addEventListener('DOMContentLoaded', () => {
    const containers = ['experiences-container', 'education-container', 'languages-container'];
    containers.forEach(id => {
        if (!document.getElementById(id)) {
            const newDiv = document.createElement('div');
            newDiv.id = id;
            // Encontrar um bom lugar para anexar, por exemplo, antes do próximo h2 ou no final do formulário
            // Isso é um placeholder, a lógica real dependerá da estrutura HTML
            const parent = document.querySelector('.main-form-section'); // Exemplo
            if (parent) {
                parent.appendChild(newDiv);
            }
        }
    });
});

// Chamar updateResumePreview no carregamento inicial para renderizar dados salvos
document.addEventListener('DOMContentLoaded', updateResumePreview);


