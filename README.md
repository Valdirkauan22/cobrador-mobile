# Cobrador Mobile (React + TypeScript)

Aplicativo web moderno e responsivo em **React (TypeScript + Vite + Tailwind CSS)** para gestão de mensalidades e controle de cobranças de Associações de Moradores.

O sistema integra-se diretamente com o backend Google Sheets / Google Apps Script (`Backend_Planilha_v8_2.gs`) ou pode ser executado em modo de demonstração local.

## Funcionalidades Principais

- **Painel Geral de Métricas**: Indicadores em tempo real de Moradores, Pagos, A pagar e Total em aberto, além de previsão e arrecadação atual da competência.
- **A Pagar (Pendentes)**: Busca em tempo real, visualização de débitos e vencimentos, envio rápido de mensagem personalizada de cobrança via WhatsApp, registro completo de pagamentos e histórico.
- **Pagos**: Busca de pagadores, emissão e compartilhamento de recibo em PDF gerado no próprio navegador, anexo de comprovantes (fotos/documentos salvos em IndexedDB local e registrados no histórico).
- **Cadastro de Moradores**: Criação e edição de moradores, códigos, telefones e situação (Ativo / Inativo).
- **Menu Mais**:
  - 📊 **Painel Anual**: Visão mensal da arrecadação e porcentagem de quitação ao longo do ano.
  - ✉️ **Mensagens Automáticas**: Editor de modelos de WhatsApp (Lembretes, Vencimentos, 1ª e 2ª Cobranças, Agradecimentos) com variáveis dinâmicas (`[nome]`, `[competencia]`, `[valor]`, `[vencimento]`).
  - ☁️ **Backup Agora**: Criação de cópia de segurança na nuvem.
  - 🕑 **Ativar Backup Diário**: Configuração de rotina diária no Google Drive.
  - ⬇️ **Exportar Relação**: Download de arquivo CSV formatado com os pagamentos e pendências.
  - ⚙️ **Configurações de Conexão**: Alternância entre conexão com Google Apps Script (`/exec` e chave) e Modo Demonstração (local).

## Execução

```bash
npm install
npm run dev
```

A aplicação será iniciada na porta 3000 (`http://localhost:3000`).
