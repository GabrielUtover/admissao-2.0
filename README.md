# Sistema de Leitura de Normas

Sistema web desenvolvido com React + TypeScript + shadcn/ui para geração de documentos de Leitura de Normas para internação voluntária e involuntária.

## Funcionalidades

- ✅ Tela inicial com formulário para dados do paciente
- ✅ Seleção entre internação voluntária e involuntária
- ✅ Data de admissão automática (data atual)
- ✅ Geração de PDF com templates personalizáveis
- ✅ Botão para abrir PDF gerado para impressão
- ✅ Tela de configurações protegida por senha
- ✅ Editor de templates com variáveis dinâmicas

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## Variáveis Disponíveis nos Templates

- `{{NOME_PACIENTE}}` - Nome completo do paciente
- `{{DATA_NASCIMENTO}}` - Data de nascimento do paciente
- `{{DATA_ATUAL}}` - Data atual (data de admissão)

## Senha de Configurações

A senha padrão para acessar as configurações é: **Incons55522**

## Build para Produção

```bash
npm run build
```

## Deploy na Vercel

O projeto está configurado para deploy automático na Vercel.

### Opção 1: Deploy via GitHub (Recomendado)

1. Faça push do código para o repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta do GitHub
4. Clique em "Add New Project"
5. Selecione o repositório `admissao-2.0`
6. A Vercel detectará automaticamente as configurações:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Clique em "Deploy"

### Opção 2: Deploy via CLI

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Execute o comando na raiz do projeto:
```bash
vercel
```

3. Siga as instruções no terminal

### Configurações

O arquivo `vercel.json` já está configurado com:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Rewrites para SPA (Single Page Application)

