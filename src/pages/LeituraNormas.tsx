import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FileText, Printer, User, Info } from 'lucide-react'
import { PasswordDialog } from '@/components/PasswordDialog'
import { SettingsDialog } from '@/components/SettingsDialog'
import { FloatingHeader } from '@/components/FloatingHeader'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { templateService } from '@/services/templateService'
import { pdfService } from '@/services/pdfService'

type TipoInternacao = 'voluntaria' | 'involuntaria'

export default function LeituraNormas() {
  const [nomePaciente, setNomePaciente] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [tipoInternacao, setTipoInternacao] = useState<TipoInternacao>('voluntaria')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [dataNascimentoError, setDataNascimentoError] = useState<string>('')

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR')
  }

  const getCurrentDate = (): string => {
    return formatDate(new Date())
  }

  const getMaxDate = (): string => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDataNascimento(value)
    
    if (value) {
      const age = calculateAge(value)
      if (age < 18) {
        setDataNascimentoError('O paciente deve ter no mínimo 18 anos de idade.')
      } else {
        setDataNascimentoError('')
      }
    } else {
      setDataNascimentoError('')
    }
  }

  const handleGenerate = async () => {
    if (!nomePaciente.trim()) {
      alert('Por favor, preencha o nome do paciente')
      return
    }

    if (dataNascimento) {
      const age = calculateAge(dataNascimento)
      if (age < 18) {
        alert('O paciente deve ter no mínimo 18 anos de idade.')
        return
      }
    }

    const dataAtual = getCurrentDate()
    let dataNasc = 'Não informado'
    if (dataNascimento) {
      const date = new Date(dataNascimento)
      dataNasc = formatDate(date)
    }

    const config = await templateService.getTemplateConfig()
    const templateConfig = tipoInternacao === 'voluntaria' 
      ? config.voluntaria 
      : config.involuntaria

    let content = templateService.replaceVariables(
      templateConfig.content,
      nomePaciente,
      dataNasc,
      dataAtual
    )

    // Aplicar formatação em negrito
    if (templateConfig.boldTexts && templateConfig.boldTexts.length > 0) {
      content = templateService.applyBoldFormatting(content, templateConfig.boldTexts)
    }

    // Manter placeholder se houver imagem configurada, remover caso contrário
    if (!templateConfig.headerImage) {
      content = content.replace(/\{\{CABECALHO_IMAGEM\}\}/g, '')
    }

    try {
      const url = await pdfService.generatePDF(
        content,
        templateConfig.headerImage
      )

      setPdfUrl(url)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar o PDF. Por favor, tente novamente.')
    }
  }

  const handleOpenPDF = () => {
    if (pdfUrl) {
      pdfService.openPDF(pdfUrl)
    }
  }

  const handleOpenSettings = () => {
    setPasswordDialogOpen(true)
  }

  const handlePasswordSuccess = () => {
    setAuthenticated(true)
    setSettingsDialogOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsDialogOpen(false)
    setAuthenticated(false)
  }

  return (
    <div className="min-h-screen dark-bg relative overflow-hidden pt-16 pb-12 px-4 md:px-6 lg:px-8">
      <AnimatedBackground />
      <FloatingHeader onSettingsClick={handleOpenSettings} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título Principal */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
            Leitura de Normas
          </h1>
          <p className="text-slate-600 text-sm">Sistema de documentação médica</p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Dados do Paciente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Dados do Paciente
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 font-semibold">
                  Nome Completo do Paciente *
                </Label>
                <Input
                  id="nome"
                  value={nomePaciente}
                  onChange={(e) => setNomePaciente(e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-slate-700 font-semibold">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={handleDataNascimentoChange}
                  max={getMaxDate()}
                  className={dataNascimentoError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {dataNascimentoError && (
                  <p className="text-sm text-red-600 font-medium">{dataNascimentoError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Tipo de Internação */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  Tipo de Internação
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Selecionar Tipo *
                </Label>
                <RadioGroup
                  value={tipoInternacao}
                  onChange={(value) => setTipoInternacao(value as TipoInternacao)}
                  className="space-y-2"
                >
                  <RadioGroupItem
                    id="voluntaria"
                    name="tipo-internacao"
                    value="voluntaria"
                    label="Voluntária"
                  />
                  <RadioGroupItem
                    id="involuntaria"
                    name="tipo-internacao"
                    value="involuntaria"
                    label="Involuntária"
                  />
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Data de Admissão
                </Label>
                <Input
                  value={getCurrentDate()}
                  disabled
                  className="bg-white/60 opacity-75 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg w-full"
                  disabled={!nomePaciente.trim()}
                  size="lg"
                >
                  <FileText className="h-5 w-5" />
                  Gerar Documento
                </Button>

                {pdfUrl && (
                  <Button
                    onClick={handleOpenPDF}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg w-full"
                    size="lg"
                  >
                    <Printer className="h-5 w-5" />
                    Abrir PDF para Impressão
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSuccess={handlePasswordSuccess}
      />

      {authenticated && (
        <SettingsDialog
          open={settingsDialogOpen}
          onOpenChange={handleSettingsClose}
        />
      )}
    </div>
  )
}

