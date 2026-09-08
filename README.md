# Cobrador Mobile Android

Aplicativo Android nativo que incorpora o Cobrador Mobile e utiliza a mesma
planilha e o mesmo Apps Script do Cobrador V8.2.

## Recursos Android

- instalação como aplicativo independente;
- câmera, galeria e seletor de PDF para comprovantes;
- recibo PDF gerado no próprio aparelho;
- compartilhamento nativo do recibo, inclusive pelo WhatsApp;
- armazenamento local da configuração e dos comprovantes;
- painel, pagamentos, moradores, histórico, mensagens e backups.

## Compilar no Android Studio

1. Instale o Android Studio com Android SDK 35 e JDK 17.
2. Abra a pasta `Cobrador_Mobile_Android` como projeto.
3. Aguarde a sincronização do Gradle e aceite a instalação dos componentes.
4. Para testar no celular: ative a depuração USB e clique em **Run**.
5. Para gerar o APK: **Build > Build App Bundles or APKs > Build APKs**.
6. O APK será criado em `app/build/outputs/apk/debug/app-debug.apk`.

Para publicação na Play Store, use **Build > Generate Signed Bundle / APK** e
gere um arquivo AAB assinado. Guarde a chave de assinatura em local seguro.

## Primeira abertura

Informe a URL do Web App terminada em `/exec` e a chave correspondente. Esses
dados não estão gravados no código. O arquivo `Backend_Planilha_v8_2.gs` está
incluído para atualização do Apps Script.

## Segurança

O projeto não contém a chave do Apps Script, senhas ou dados dos moradores.
Não publique uma versão modificada que tenha credenciais escritas no código.
