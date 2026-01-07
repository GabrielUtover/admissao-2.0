import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Download, Upload, Image as ImageIcon } from 'lucide-react'
import { templateService, type Template, type TemplateConfig } from '@/services/templateService'
import { exportService } from '@/services/exportService'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [templates, setTemplates] = useState<Template>({
    voluntaria: '',
    involuntaria: '',
  })
  const [config, setConfig] = useState<TemplateConfig>({
    voluntaria: { content: '', boldTexts: [] },
    involuntaria: { content: '', boldTexts: [] },
  })
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const savedTemplates = templateService.getTemplates()
      templateService.getTemplateConfig().then((savedConfig) => {
        setTemplates(savedTemplates)
        setConfig(savedConfig)
      })
    }
  }, [open])

  const handleSave = async () => {
    templateService.saveTemplates(templates)
    await templateService.saveTemplateConfig(config)
  }

  const handleExport = async () => {
    await exportService.exportConfig()
    alert('Configurações exportadas com sucesso!')
  }

  const handleImport = () => {
    importInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await exportService.importConfig(file)
        // Recarregar configurações
        const savedTemplates = templateService.getTemplates()
        const savedConfig = templateService.getTemplateConfig()
        setTemplates(savedTemplates)
        setConfig(savedConfig)
        alert('Configurações importadas com sucesso!')
      } catch (error) {
        alert('Erro ao importar configurações: ' + (error as Error).message)
      }
    }
    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = ''
    }
  }

  const handleExportImages = async () => {
    await exportService.exportImages()
    alert('Imagens exportadas! Coloque os arquivos na pasta public/config/images/ do projeto.')
  }

  const handleTemplateChange = (
    type: 'voluntaria' | 'involuntaria',
    value: string
  ) => {
    setTemplates((prev) => ({
      ...prev,
      [type]: value,
    }))
    setConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], content: value },
    }))
  }

  const handleImageUpload = (
    type: 'voluntaria' | 'involuntaria',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const filename = type === 'voluntaria' 
        ? 'cabecalho_voluntaria.png' 
        : 'cabecalho_involuntaria.png'
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setConfig((prev) => ({
          ...prev,
          [type]: { 
            ...prev[type], 
            headerImage: imageData, // Base64 temporário para preview
            _imageFilename: filename,
          },
        }))
        
        // Instruir usuário sobre onde colocar a imagem
        alert(`Imagem carregada!\n\nPara usar a imagem no projeto:\n1. Exporte a imagem usando o botão "Exportar Imagens"\n2. Coloque o arquivo "${filename}" na pasta public/config/images/ do projeto`)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBoldTextChange = (
    type: 'voluntaria' | 'involuntaria',
    index: number,
    value: string
  ) => {
    setConfig((prev) => {
      const boldTexts = [...(prev[type].boldTexts || [])]
      boldTexts[index] = value
      return {
        ...prev,
        [type]: { ...prev[type], boldTexts },
      }
    })
  }

  const addBoldText = (type: 'voluntaria' | 'involuntaria') => {
    setConfig((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        boldTexts: [...(prev[type].boldTexts || []), ''],
      },
    }))
  }

  const removeBoldText = (type: 'voluntaria' | 'involuntaria', index: number) => {
    setConfig((prev) => {
      const boldTexts = [...(prev[type].boldTexts || [])]
      boldTexts.splice(index, 1)
      return {
        ...prev,
        [type]: { ...prev[type], boldTexts },
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Configurações de Templates
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Configure os templates para internação voluntária e involuntária.
            Use as variáveis: <span className="font-mono bg-white/30 px-2 py-1 rounded text-gray-900">{'{{NOME_PACIENTE}}'}</span>, <span className="font-mono bg-white/30 px-2 py-1 rounded text-gray-900">{'{{DATA_NASCIMENTO}}'}</span>,
            <span className="font-mono bg-white/30 px-2 py-1 rounded text-gray-900">{'{{DATA_ATUAL}}'}</span>.
            Use <span className="font-mono bg-white/30 px-2 py-1 rounded text-gray-900">{'{{CABECALHO_IMAGEM}}'}</span> no início do template para inserir a imagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Template Voluntária */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Internação Voluntária</h3>
            
            <div className="space-y-2">
              <Label>Imagem do Cabeçalho</Label>
              <p className="text-xs text-gray-600">
                Coloque a imagem em <code className="bg-gray-100 px-1 rounded">public/config/images/</code> com o nome <code className="bg-gray-100 px-1 rounded">cabecalho_voluntaria.png</code>
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('voluntaria', e)}
                className="cursor-pointer"
              />
              {config.voluntaria.headerImage && (
                <div className="space-y-1">
                  <img 
                    src={config.voluntaria.headerImage.startsWith('data:') 
                      ? config.voluntaria.headerImage 
                      : config.voluntaria.headerImage.startsWith('/')
                        ? config.voluntaria.headerImage
                        : `/config/images/${config.voluntaria.headerImage}`} 
                    alt="Preview cabeçalho" 
                    className="max-w-xs h-20 object-contain border rounded"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', config.voluntaria.headerImage)
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    {config.voluntaria.headerImage.startsWith('data:') 
                      ? 'Imagem carregada via upload (será salva ao exportar)' 
                      : `Imagem: ${config.voluntaria.headerImage}`}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voluntaria">Template</Label>
              <Textarea
                id="voluntaria"
                value={config.voluntaria.content || templates.voluntaria}
                onChange={(e) =>
                  handleTemplateChange('voluntaria', e.target.value)
                }
                className="min-h-[250px] font-mono text-sm"
                placeholder="Digite o template para internação voluntária..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Textos em Negrito</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBoldText('voluntaria')}
                >
                  Adicionar
                </Button>
              </div>
              {(config.voluntaria.boldTexts || []).map((text, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => handleBoldTextChange('voluntaria', index, e.target.value)}
                    placeholder="Digite o texto que deve ficar em negrito"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBoldText('voluntaria', index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Template Involuntária */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Internação Involuntária</h3>
            
            <div className="space-y-2">
              <Label>Imagem do Cabeçalho</Label>
              <p className="text-xs text-gray-600">
                Coloque a imagem em <code className="bg-gray-100 px-1 rounded">public/config/images/</code> com o nome <code className="bg-gray-100 px-1 rounded">cabecalho_involuntaria.png</code>
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('involuntaria', e)}
                className="cursor-pointer"
              />
              {config.involuntaria.headerImage && (
                <div className="space-y-1">
                  <img 
                    src={config.involuntaria.headerImage.startsWith('data:') 
                      ? config.involuntaria.headerImage 
                      : config.involuntaria.headerImage.startsWith('/')
                        ? config.involuntaria.headerImage
                        : `/config/images/${config.involuntaria.headerImage}`} 
                    alt="Preview cabeçalho" 
                    className="max-w-xs h-20 object-contain border rounded"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', config.involuntaria.headerImage)
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    {config.involuntaria.headerImage.startsWith('data:') 
                      ? 'Imagem carregada via upload (será salva ao exportar)' 
                      : `Imagem: ${config.involuntaria.headerImage}`}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="involuntaria">Template</Label>
              <Textarea
                id="involuntaria"
                value={config.involuntaria.content || templates.involuntaria}
                onChange={(e) =>
                  handleTemplateChange('involuntaria', e.target.value)
                }
                className="min-h-[250px] font-mono text-sm"
                placeholder="Digite o template para internação involuntária..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Textos em Negrito</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBoldText('involuntaria')}
                >
                  Adicionar
                </Button>
              </div>
              {(config.involuntaria.boldTexts || []).map((text, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => handleBoldTextChange('involuntaria', index, e.target.value)}
                    placeholder="Digite o texto que deve ficar em negrito"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBoldText('involuntaria', index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Config
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar Config
              </Button>
              <Button
                variant="outline"
                onClick={handleExportImages}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Exportar Imagens
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar Templates</Button>
            </div>
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

