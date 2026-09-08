# Cobrador Mobile — Web App/PWA

Aplicativo web moderno e responsivo em **React (TypeScript + Vite + Tailwind CSS)** para gestão de mensalidades e controle de cobranças de Associações de Moradores.

O sistema integra-se diretamente com o backend Google Sheets / Google Apps Script (`Backend_Planilha_v8_2.gs`) ou pode ser executado em modo de demonstração local.

> Este repositório não gera APK diretamente. O aplicativo pode ser instalado no Android pelo navegador como PWA.

## Funcionalidades Principais

- **Painel Geral de Métricas**: Indicadores em tempo real de Moradores, Pagos, A pagar e Total em aberto, além de previsão e arrecadação atual da competência.
- **A Pagar (Pendentes)**: Busca em tempo real, visualização de débitos e vencimentos, envio rápido de mensagem personalizada de cobrança via WhatsApp, registro completo de pagamentos e histórico.
- **Pagos**: Busca de pagadores, emissão e compartilhamento de recibo em PDF, anexo local e envio do comprovante para uma pasta segura no Google Drive.
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

## Configuração segura do Apps Script

1. No Apps Script, abra **Configurações do projeto > Propriedades do script**.
2. Crie `API_KEY` com uma chave longa e exclusiva e `SPREADSHEET_ID` com o ID da planilha.
3. Implante uma nova versão do Web App.
4. Informe a URL `/exec` e a mesma chave na tela de configurações do Cobrador.

Nenhuma chave real deve ser gravada neste repositório. Como uma chave antiga já foi publicada no histórico, ela deve ser substituída antes do uso em produção.

Para o campo **Unidade**, use a coluna E da aba `Moradores` com o cabeçalho `Unidade`.

## Instalar no Android

Abra o endereço publicado no Chrome, acesse o menu e escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.
