import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-2" });
const BUCKET = "arquivacloud-emerson-2026";

const LIMITE_ARQUIVO = 3 * 1024 * 1024;
const LIMITE_TOTAL = 30 * 1024 * 1024;
const MAX_ARQUIVOS = 10;

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method;
    const key = event.pathParameters?.key;

    if (method === "GET" && !key) {
      const result = await s3.send(
        new ListObjectsV2Command({ Bucket: BUCKET })
      );

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.Contents || [])
      };
    }

    if (method === "GET" && key) {
      const result = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      );

      const bytes = await result.Body.transformToByteArray();

      return {
        statusCode: 200,
        isBase64Encoded: true,
        headers: {
          "Content-Type": result.ContentType || "application/octet-stream",
          "Content-Disposition":
            `attachment; filename*=UTF-8''${encodeURIComponent(key)}`
        },
        body: Buffer.from(bytes).toString("base64")
      };
    }

    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const nome = body.nome?.trim();

      if (
        !nome ||
        !/^[\p{L}\p{N}._() -]{1,100}$/u.test(nome) ||
        nome === "." ||
        nome === ".." ||
        typeof body.conteudo !== "string"
      ) {
        return {
          statusCode: 400,
          body: JSON.stringify({ erro: "Nome ou arquivo inválido." })
        };
      }

      const conteudo = Buffer.from(body.conteudo, "base64");

      if (conteudo.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ erro: "Arquivo vazio." })
        };
      }

      if (conteudo.length > LIMITE_ARQUIVO) {
        return {
          statusCode: 413,
          body: JSON.stringify({ erro: "Máximo de 3 MB por arquivo." })
        };
      }

      const listagem = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          MaxKeys: 11
        })
      );

      const arquivos = listagem.Contents || [];

      if (arquivos.some(arquivo => arquivo.Key === nome)) {
        return {
          statusCode: 409,
          body: JSON.stringify({ erro: "Já existe um arquivo com esse nome." })
        };
      }

      if (listagem.IsTruncated || arquivos.length >= MAX_ARQUIVOS) {
        return {
          statusCode: 413,
          body: JSON.stringify({ erro: "Limite de 10 arquivos atingido." })
        };
      }

      const tamanhoAtual = arquivos.reduce(
        (total, arquivo) => total + (arquivo.Size || 0),
        0
      );

      if (tamanhoAtual + conteudo.length > LIMITE_TOTAL) {
        return {
          statusCode: 413,
          body: JSON.stringify({ erro: "Limite total de 30 MB atingido." })
        };
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: nome,
          Body: conteudo,
          ContentType: body.contentType || "application/octet-stream"
        })
      );

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: "Arquivo enviado!",
          arquivo: nome
        })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ erro: "Método não permitido." })
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ erro: "Erro interno no servidor." })
    };
  }
};
