import jsPDF from 'jspdf'

export const pdfService = {
  async generatePDF(
    content: string,
    headerImage?: string
  ): Promise<string> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    let y = 0

    // Verificar se o template tem placeholder de imagem
    const hasImagePlaceholder = content.includes('{{CABECALHO_IMAGEM}}')

    // Adicionar imagem do cabeçalho se existir (sem margem, de ponta a ponta)
    if (headerImage && hasImagePlaceholder) {
      try {
        let imageDataUrl = headerImage
        
        // Se for um caminho (não base64), carregar e converter para base64
        if (!headerImage.startsWith('data:')) {
          const imageSrc = headerImage.startsWith('/') 
            ? headerImage 
            : `/config/images/${headerImage}`
          
          // Carregar a imagem e converter para base64
          const response = await fetch(imageSrc)
          if (!response.ok) {
            throw new Error(`Erro ao carregar imagem: ${response.statusText}`)
          }
          const blob = await response.blob()
          imageDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        }
        
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imageDataUrl
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000)
          img.onload = () => {
            clearTimeout(timeout)
            try {
              // Imagem ocupando toda a largura da página (sem margem)
              const imgWidth = pageWidth
              const imgHeight = (img.height * imgWidth) / img.width
              const imgX = 0
              const paddingBottom = 30 / 2.83465 // 10px convertido para mm ≈ 3.53mm
              
              // Determinar o formato da imagem (PNG, JPEG ou SVG)
              let format = 'PNG'
              if (imageDataUrl.startsWith('data:image/jpeg') || imageDataUrl.startsWith('data:image/jpg')) {
                format = 'JPEG'
              } else if (imageDataUrl.startsWith('data:image/png')) {
                format = 'PNG'
              } else if (imageDataUrl.startsWith('data:image/svg')) {
                format = 'SVG'
              }
              
              // Adicionar imagem começando do topo (y = 0), sem margem
              doc.addImage(imageDataUrl, format, imgX, y, imgWidth, imgHeight)
              // Adicionar padding bottom de 10px abaixo da imagem
              y = imgHeight + paddingBottom
              resolve()
            } catch (error) {
              clearTimeout(timeout)
              reject(error)
            }
          }
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Erro ao carregar imagem'))
          }
        })
      } catch (error) {
        console.error('Erro ao carregar imagem:', error)
        // Continua sem a imagem
        y = margin
      }
    } else {
      y = margin
    }

    // Remover placeholder da imagem do conteúdo antes de processar
    let textContent = content.replace(/\{\{CABECALHO_IMAGEM\}\}/g, '').trim()
    
    // Processar conteúdo com formatação em negrito
    const parts = pdfService.parseContent(textContent)
    
    doc.setFontSize(10)
    
    parts.forEach((part) => {
      if (y + 7 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }

      if (part.type === 'bold') {
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFont('helvetica', 'normal')
      }

      const lines = doc.splitTextToSize(part.text, maxWidth)
      lines.forEach((line: string) => {
        if (y + 7 > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += 7
      })
    })

    // Criar blob URL para download/preview
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)

    return url
  },

  parseContent(content: string): Array<{ type: 'normal' | 'bold'; text: string }> {
    const parts: Array<{ type: 'normal' | 'bold'; text: string }> = []
    const regex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'normal',
          text: content.substring(lastIndex, match.index),
        })
      }
      parts.push({
        type: 'bold',
        text: match[1],
      })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'normal',
        text: content.substring(lastIndex),
      })
    }

    return parts.length > 0 ? parts : [{ type: 'normal', text: content }]
  },

  openPDF(url: string): void {
    window.open(url, '_blank')
  }
}

