import { templateService, type TemplateConfig, type Template } from './templateService'

export interface ExportData {
  templates: Template
  config: TemplateConfig
  version: string
  exportDate: string
}

export const exportService = {
  async exportConfig(): Promise<void> {
    const templates = templateService.getTemplates()
    const config = await templateService.getTemplateConfig()

    const exportData: ExportData = {
      templates,
      config,
      version: '1.0.0',
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `config_templates_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  async importConfig(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ExportData
          
          // Validar estrutura
          if (!data.templates || !data.config) {
            throw new Error('Formato de arquivo inválido')
          }

          // Salvar templates e configurações
          templateService.saveTemplates(data.templates)
          await templateService.saveTemplateConfig(data.config)

          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file)
    })
  },

  async exportImages(): Promise<void> {
    const config = await templateService.getTemplateConfig()
    const images: Array<{ type: 'voluntaria' | 'involuntaria'; data: string; filename: string }> = []

    if (config.voluntaria.headerImage) {
      // Se for base64, usar diretamente. Se for caminho, tentar carregar
      if (config.voluntaria.headerImage.startsWith('data:')) {
        images.push({
          type: 'voluntaria',
          data: config.voluntaria.headerImage,
          filename: 'cabecalho_voluntaria.png',
        })
      } else {
        // Tentar carregar a imagem do servidor
        try {
          const response = await fetch(config.voluntaria.headerImage.startsWith('/') 
            ? config.voluntaria.headerImage 
            : `/config/images/${config.voluntaria.headerImage}`)
          if (response.ok) {
            const blob = await response.blob()
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.readAsDataURL(blob)
            })
            images.push({
              type: 'voluntaria',
              data: dataUrl,
              filename: 'cabecalho_voluntaria.png',
            })
          }
        } catch (error) {
          console.error('Erro ao carregar imagem voluntária:', error)
        }
      }
    }

    if (config.involuntaria.headerImage) {
      // Se for base64, usar diretamente. Se for caminho, tentar carregar
      if (config.involuntaria.headerImage.startsWith('data:')) {
        images.push({
          type: 'involuntaria',
          data: config.involuntaria.headerImage,
          filename: 'cabecalho_involuntaria.png',
        })
      } else {
        // Tentar carregar a imagem do servidor
        try {
          const response = await fetch(config.involuntaria.headerImage.startsWith('/') 
            ? config.involuntaria.headerImage 
            : `/config/images/${config.involuntaria.headerImage}`)
          if (response.ok) {
            const blob = await response.blob()
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.readAsDataURL(blob)
            })
            images.push({
              type: 'involuntaria',
              data: dataUrl,
              filename: 'cabecalho_involuntaria.png',
            })
          }
        } catch (error) {
          console.error('Erro ao carregar imagem involuntária:', error)
        }
      }
    }

    images.forEach((img) => {
      const link = document.createElement('a')
      link.href = img.data
      link.download = img.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }
}

