# ArquivaCloud

Sistema web de armazenamento e gerenciamento de arquivos na nuvem, desenvolvido por **Emerson Danillo e Gisele** como projeto acadêmico de Cloud Computing.

## Visão geral

O ArquivaCloud permite enviar, listar e baixar arquivos armazenados em um bucket privado do Amazon S3. O frontend é hospedado no AWS Amplify e consome uma API HTTP do Amazon API Gateway, integrada a uma função AWS Lambda.

## Arquitetura

```text
Navegador
   |
   v
AWS Amplify (frontend estático)
   |
   v
Amazon API Gateway (HTTP API)
   |
   v
AWS Lambda (Node.js)
   |
   v
Amazon S3 (bucket privado)
```

## Serviços utilizados

| Serviço | Responsabilidade |
|---|---|
| AWS Amplify | Hospedagem do frontend |
| Amazon API Gateway | Exposição dos endpoints HTTP |
| AWS Lambda | Processamento das requisições |
| Amazon S3 | Armazenamento persistente dos arquivos |
| Amazon CloudWatch | Logs e acompanhamento da execução |

## Funcionalidades da API

| Método | Rota | Função |
|---|---|---|
| GET | `/files` | Lista os arquivos armazenados |
| POST | `/files` | Envia um arquivo |
| GET | `/files/{key}` | Baixa um arquivo pelo nome/chave |

## Regras e limites implementados

- Tamanho máximo por arquivo: **3 MB**.
- Quantidade máxima: **10 arquivos**.
- Espaço total máximo: **30 MB**.
- Bloqueio de nomes duplicados.
- Validação do nome e rejeição de arquivos vazios.
- Respostas HTTP específicas para erros de validação.

> Observação técnica: as verificações de quantidade e espaço são feitas antes do envio ao S3. Como não há operação transacional envolvendo a listagem e o upload, requisições simultâneas podem ultrapassar os limites. Uma evolução possível é implementar controle atômico e autenticação.

## Estrutura do repositório

```text
ArquivaCloud/
├── backend/
│   ├── index.mjs
│   └── package.json
├── frontend/
│   └── index.html  # inserir aqui o arquivo original publicado no Amplify
├── docs/
│   └── arquitetura.md
├── .gitignore
└── README.md
```

## Configuração do backend

1. Entre na função Lambda `arquivacloud-api`.
2. Configure o runtime Node.js compatível com o código.
3. Garanta que a role de execução tenha permissões mínimas para `s3:ListBucket`, `s3:GetObject` e `s3:PutObject` no bucket utilizado.
4. Configure a região `us-east-2` e confira o nome do bucket no arquivo `backend/index.mjs`.
5. Configure as rotas da HTTP API para encaminhar `GET /files`, `POST /files` e `GET /files/{key}` para a função Lambda.
6. Configure o CORS para permitir a origem do frontend hospedado no Amplify.

O código não contém chaves de acesso AWS. A função utiliza a role de execução da Lambda para acessar o S3.

## Configuração do frontend

O arquivo original `index.html`, que já está publicado no Amplify, deve ser colocado em `frontend/index.html`. A URL da API deve apontar para a API Gateway do ambiente utilizado.

## Testes recomendados

- Listar o conteúdo do bucket pela rota `GET /files`.
- Enviar um arquivo válido pela rota `POST /files`.
- Baixar o arquivo pela rota `GET /files/{key}`.
- Tentar enviar arquivo vazio.
- Tentar enviar arquivo maior que 3 MB.
- Tentar enviar nome duplicado.
- Tentar ultrapassar 10 arquivos ou 30 MB no total.
- Conferir os registros de execução no CloudWatch.

## Segurança e custos

- O bucket S3 deve permanecer privado e com bloqueio de acesso público habilitado.
- As permissões devem ser concedidas à role da Lambda, evitando credenciais fixas no código.
- A API não possui autenticação nesta versão; isso deve ser registrado como limitação e melhoria futura.
- O orçamento e o consumo devem ser acompanhados no AWS Billing/Budgets. Um alerta de orçamento não bloqueia automaticamente cobranças.

## Autoria

- Emerson Danillo
- Gisele

Projeto acadêmico de Cloud Computing — 2026.
