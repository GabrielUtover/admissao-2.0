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

