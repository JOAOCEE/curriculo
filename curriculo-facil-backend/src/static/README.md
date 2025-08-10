# CurrículoFácil - Documentação

## Visão Geral

O CurrículoFácil é um micro SaaS para criação de currículos profissionais com análise ATS e recursos premium. Esta documentação fornece informações sobre a estrutura do projeto, como publicar o site e como configurar o sistema de pagamentos.

## Estrutura do Projeto

```
curriculo-facil/
├── index.html             # Página inicial
├── editor.html            # Editor de currículos
├── premium.html           # Página de assinatura premium
├── css/                   # Estilos do site
├── js/                    # Scripts JavaScript
│   ├── app.js             # Script principal
│   ├── editor.js          # Funcionalidades do editor
│   └── payment/           # Sistema de pagamentos
│       ├── stripe-integration.js  # Integração com Stripe
│       └── premium-features.js    # Controle de recursos premium
└── images/                # Imagens e ícones
    ├── backgrounds/       # Imagens de fundo
    ├── icons/             # Ícones do sistema
    └── templates/         # Imagens dos modelos de currículo
```

## Como Publicar o Site

Para publicar o CurrículoFácil e começar a monetizá-lo, siga estas etapas:

1. **Escolha um serviço de hospedagem**:
   - Opções recomendadas: Netlify, Vercel, GitHub Pages, ou qualquer hospedagem compartilhada

2. **Configure seu domínio personalizado**:
   - Adquira um domínio (recomendado: curriculofacil.com.br)
   - Configure os registros DNS para apontar para sua hospedagem

3. **Faça upload dos arquivos**:
   - Carregue todos os arquivos mantendo a estrutura de diretórios
   - Certifique-se de que o arquivo index.html esteja na raiz

4. **Configure o HTTPS**:
   - Ative o HTTPS para garantir conexões seguras (especialmente importante para pagamentos)

## Configuração do Sistema de Pagamentos

O CurrículoFácil está integrado com o Stripe para processar pagamentos de assinaturas. Para configurar:

1. **Crie uma conta no Stripe**:
   - Acesse [stripe.com](https://stripe.com) e crie uma conta
   - Complete a verificação da conta para processar pagamentos reais

2. **Obtenha suas chaves de API**:
   - No painel do Stripe, vá para Desenvolvedores > Chaves de API
   - Copie sua chave publicável (publishable key)

3. **Configure o produto e preço**:
   - No painel do Stripe, crie um produto chamado "CurrículoFácil Premium"
   - Adicione um preço recorrente de R$7/mês
   - Copie o ID do preço (price_id)

4. **Atualize o arquivo de configuração**:
   - Abra o arquivo `js/payment/stripe-integration.js`
   - Substitua `YOUR_PUBLISHABLE_KEY` pela sua chave publicável do Stripe
   - Substitua `price_premium_monthly` pelo ID do preço que você criou

5. **Configure o webhook do Stripe** (para ambiente de produção):
   - Crie um endpoint de webhook em seu backend para processar eventos do Stripe
   - Configure para escutar eventos como `customer.subscription.created` e `customer.subscription.deleted`

## Funcionalidades Premium

O plano Premium do CurrículoFácil inclui:

1. **Acesso a todos os modelos de currículo**:
   - 9 modelos profissionais para diferentes setores

2. **Currículos ilimitados**:
   - Criação e gerenciamento de múltiplos currículos

3. **Análise ATS avançada**:
   - Feedback detalhado sobre cada seção do currículo
   - Comparação com padrões da indústria
   - Sugestões de melhoria específicas

4. **Assistente de conteúdo com IA**:
   - Geração de resumos profissionais
   - Sugestões de habilidades relevantes
   - Formatação de realizações profissionais

## Personalização e Expansão

O CurrículoFácil foi projetado para ser facilmente personalizável e expansível:

1. **Adicionar novos modelos**:
   - Crie novas imagens de modelo e adicione à pasta `images/templates/`
   - Atualize o array `templates` no arquivo `js/payment/premium-features.js`

2. **Modificar preços**:
   - Atualize o valor no arquivo `js/payment/stripe-integration.js`
   - Atualize também os valores exibidos em `premium.html`

3. **Adicionar novas funcionalidades premium**:
   - Implemente a funcionalidade no JavaScript
   - Atualize o objeto `premiumFeatures` no arquivo `js/payment/premium-features.js`

## Suporte e Manutenção

Para manter seu site CurrículoFácil funcionando perfeitamente:

1. **Monitore os pagamentos**:
   - Verifique regularmente o painel do Stripe para acompanhar assinaturas e receitas

2. **Atualize as bibliotecas**:
   - Mantenha o Stripe.js e outras dependências atualizadas para segurança

3. **Backup regular**:
   - Faça backup dos arquivos e configurações regularmente

---

Este projeto é de sua total propriedade e autoria. Você tem todos os direitos para usá-lo, modificá-lo e monetizá-lo como preferir.
