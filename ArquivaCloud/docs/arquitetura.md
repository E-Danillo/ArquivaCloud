# Arquitetura do ArquivaCloud

1. O usuário acessa a aplicação pelo navegador.
2. O frontend estático é entregue pelo AWS Amplify.
3. O JavaScript do frontend envia requisições HTTP ao Amazon API Gateway.
4. O API Gateway encaminha as chamadas para a função AWS Lambda.
5. A Lambda valida a requisição e utiliza o AWS SDK para listar, gravar ou recuperar objetos no Amazon S3.
6. A resposta retorna pelo API Gateway ao navegador.

## Modelo de serviço

- **Amplify Hosting:** plataforma gerenciada para hospedagem do frontend (PaaS).
- **API Gateway:** serviço gerenciado para criação e exposição de APIs.
- **Lambda:** computação serverless/FaaS.
- **S3:** armazenamento de objetos gerenciado.

## Limitações conhecidas

A API não exige autenticação. As cotas de quantidade e tamanho são validadas em código, mas não são atômicas diante de requisições simultâneas. Recomenda-se adicionar autenticação, controle de concorrência e monitoramento de abuso em uma versão futura.
