export interface TemplateConfig {
  voluntaria: {
    content: string
    headerImage?: string
    boldTexts?: string[]
  }
  involuntaria: {
    content: string
    headerImage?: string
    boldTexts?: string[]
  }
}

export interface Template {
  voluntaria: string
  involuntaria: string
}

const TEMPLATE_STORAGE_KEY = 'leitura_normas_templates'
const TEMPLATE_CONFIG_KEY = 'leitura_normas_template_config'
const CONFIG_FILE_PATH = '/config/templates.json'

const DEFAULT_TEMPLATES: Template = {
  voluntaria: `LEITURA DE NORMAS - INTERNAÇÃO VOLUNTÁRIA

Paciente: {{NOME_PACIENTE}}
Data de Nascimento: {{DATA_NASCIMENTO}}
Data de Admissão: {{DATA_ATUAL}}

Senhor(a) {{NOME_PACIENTE}},

Informamos que você está sendo internado(a) voluntariamente nesta unidade de saúde mental. Esta internação foi solicitada por você e você pode solicitar a alta a qualquer momento.

Você tem direito a:
- Receber informações sobre seu tratamento
- Participar das decisões sobre seu cuidado
- Solicitar alta quando desejar
- Receber visitas e manter contato com familiares
- Ter acesso a um advogado se necessário

Assinatura do Paciente: _________________________
Data: {{DATA_ATUAL}}`,

  involuntaria: `LEITURA DE NORMAS - INTERNAÇÃO INVOLUNTÁRIA

Paciente: {{NOME_PACIENTE}}
Data de Nascimento: {{DATA_NASCIMENTO}}
Data de Admissão: {{DATA_ATUAL}}

Senhor(a) {{NOME_PACIENTE}},

Informamos que você está sendo internado(a) de forma involuntária nesta unidade de saúde mental, conforme autorização médica e determinação legal.

Esta internação foi necessária para sua proteção e tratamento. Você tem direito a:
- Receber informações sobre seu tratamento
- Ter acesso a um advogado
- Receber visitas de familiares (conforme regulamento)
- Solicitar revisão da sua internação
- Participar, na medida do possível, das decisões sobre seu cuidado

A alta será concedida quando houver melhora do quadro que motivou a internação, conforme avaliação médica.

Assinatura do Responsável Técnico: _________________________
Data: {{DATA_ATUAL}}`
}

export const templateService = {
  getTemplates(): Template {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return DEFAULT_TEMPLATES
      }
    }
    return DEFAULT_TEMPLATES
  },

  async getTemplateConfig(): Promise<TemplateConfig> {
    // Primeiro tenta carregar do arquivo do projeto
    try {
      console.log('Tentando carregar configuração de:', CONFIG_FILE_PATH)
      const response = await fetch(CONFIG_FILE_PATH)
      console.log('Resposta do fetch:', response.status, response.statusText)
      if (response.ok) {
        const fileConfig = await response.json()
        console.log('Configuração carregada do arquivo:', fileConfig)
        // Validar estrutura e converter caminhos de imagem para URLs
        if (fileConfig.voluntaria && fileConfig.involuntaria) {
          const config: TemplateConfig = {
            voluntaria: {
              content: fileConfig.voluntaria.content || DEFAULT_TEMPLATES.voluntaria,
              headerImage: fileConfig.voluntaria.headerImage 
                ? (fileConfig.voluntaria.headerImage.startsWith('/') 
                    ? fileConfig.voluntaria.headerImage 
                    : fileConfig.voluntaria.headerImage.startsWith('data:')
                      ? fileConfig.voluntaria.headerImage
                      : `/config/images/${fileConfig.voluntaria.headerImage}`)
                : undefined,
              boldTexts: fileConfig.voluntaria.boldTexts || [],
            },
            involuntaria: {
              content: fileConfig.involuntaria.content || DEFAULT_TEMPLATES.involuntaria,
              headerImage: fileConfig.involuntaria.headerImage 
                ? (fileConfig.involuntaria.headerImage.startsWith('/') 
                    ? fileConfig.involuntaria.headerImage 
                    : fileConfig.involuntaria.headerImage.startsWith('data:')
                      ? fileConfig.involuntaria.headerImage
                      : `/config/images/${fileConfig.involuntaria.headerImage}`)
                : undefined,
              boldTexts: fileConfig.involuntaria.boldTexts || [],
            },
          }
          // Atualizar localStorage com a config do arquivo
          localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(config))
          console.log('Configuração processada e salva:', config)
          return config
        } else {
          console.warn('Estrutura de configuração inválida:', fileConfig)
        }
      } else {
        console.warn(`Erro ao carregar arquivo de configuração: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao carregar config do arquivo, usando localStorage:', error)
    }

    // Fallback para localStorage
    console.log('Usando fallback do localStorage')
    const stored = localStorage.getItem(TEMPLATE_CONFIG_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Configuração do localStorage:', parsed)
        // Garantir que caminhos relativos sejam convertidos
        if (parsed.voluntaria?.headerImage && !parsed.voluntaria.headerImage.startsWith('data:') && !parsed.voluntaria.headerImage.startsWith('/')) {
          parsed.voluntaria.headerImage = `/config/images/${parsed.voluntaria.headerImage}`
        }
        if (parsed.involuntaria?.headerImage && !parsed.involuntaria.headerImage.startsWith('data:') && !parsed.involuntaria.headerImage.startsWith('/')) {
          parsed.involuntaria.headerImage = `/config/images/${parsed.involuntaria.headerImage}`
        }
        return parsed
      } catch (error) {
        console.error('Erro ao parsear localStorage:', error)
        return {
          voluntaria: { content: DEFAULT_TEMPLATES.voluntaria, boldTexts: [] },
          involuntaria: { content: DEFAULT_TEMPLATES.involuntaria, boldTexts: [] },
        }
      }
    }
    console.log('Usando templates padrão')
    return {
      voluntaria: { content: DEFAULT_TEMPLATES.voluntaria, boldTexts: [] },
      involuntaria: { content: DEFAULT_TEMPLATES.involuntaria, boldTexts: [] },
    }
  },

  saveTemplates(templates: Template): void {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
  },

  async saveTemplateConfig(config: TemplateConfig): Promise<void> {
    // Preparar configuração para salvar (remover campos temporários e normalizar caminhos)
    const configToSave: Omit<TemplateConfig, 'voluntaria' | 'involuntaria'> & {
      voluntaria: Omit<TemplateConfig['voluntaria'], '_imageFile' | '_imageFilename'>
      involuntaria: Omit<TemplateConfig['involuntaria'], '_imageFile' | '_imageFilename'>
    } = {
      voluntaria: {
        content: config.voluntaria.content,
        headerImage: config.voluntaria.headerImage?.startsWith('/config/images/')
          ? config.voluntaria.headerImage.replace('/config/images/', '')
          : config.voluntaria._imageFilename || config.voluntaria.headerImage?.startsWith('data:')
            ? 'cabecalho_voluntaria.png'
            : config.voluntaria.headerImage,
        boldTexts: config.voluntaria.boldTexts || [],
      },
      involuntaria: {
        content: config.involuntaria.content,
        headerImage: config.involuntaria.headerImage?.startsWith('/config/images/')
          ? config.involuntaria.headerImage.replace('/config/images/', '')
          : config.involuntaria._imageFilename || config.involuntaria.headerImage?.startsWith('data:')
            ? 'cabecalho_involuntaria.png'
            : config.involuntaria.headerImage,
        boldTexts: config.involuntaria.boldTexts || [],
      },
    }
    
    // Salvar no localStorage como backup (incluindo base64 para uso imediato)
    localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(config))
    
    // Salvar no arquivo do projeto através de download (apenas caminhos)
    const configStr = JSON.stringify(configToSave, null, 2)
    const blob = new Blob([configStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'templates.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    // Se houver imagens em base64, oferecer para exportá-las
    const hasBase64Images = 
      (config.voluntaria.headerImage?.startsWith('data:') || config.voluntaria._imageFile) ||
      (config.involuntaria.headerImage?.startsWith('data:') || config.involuntaria._imageFile)
    
    if (hasBase64Images) {
      alert('Configurações salvas!\n\n1. Substitua o arquivo public/config/templates.json pelo arquivo baixado.\n2. Se você fez upload de imagens, exporte-as usando o botão "Exportar Imagens" e coloque-as em public/config/images/')
    } else {
      alert('Configurações salvas! Por favor, substitua o arquivo public/config/templates.json pelo arquivo baixado.')
    }
  },

  replaceVariables(
    template: string,
    nomePaciente: string,
    dataNascimento: string,
    dataAtual: string
  ): string {
    return template
      .replace(/\{\{NOME_PACIENTE\}\}/g, nomePaciente)
      .replace(/\{\{DATA_NASCIMENTO\}\}/g, dataNascimento)
      .replace(/\{\{DATA_ATUAL\}\}/g, dataAtual)
      .replace(/\{\{CABECALHO_IMAGEM\}\}/g, '{{CABECALHO_IMAGEM}}') // Placeholder para processar depois
  },

  applyBoldFormatting(content: string, boldTexts: string[]): string {
    let result = content
    boldTexts.forEach((text) => {
      const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = result.replace(regex, `**${text}**`)
    })
    return result
  }
}

