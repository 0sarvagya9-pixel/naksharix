import "server-only";

import { createHash, createHmac } from "node:crypto";
import { env } from "@/lib/env";

export type S3CompatibleDriver = "r2" | "s3";

type StorageConfig = {
  endpoint: string;
  host: string;
  region: string;
  service: "s3";
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

type RequestInput = {
  driver: S3CompatibleDriver;
  method: "GET" | "PUT";
  key: string;
  body?: Uint8Array;
  contentType?: string;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeKey(key: string) {
  return key.split("/").filter(Boolean).map(awsEncode).join("/");
}

function amzDate(now: Date) {
  return now.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function getConfig(driver: S3CompatibleDriver): StorageConfig {
  if (driver === "r2") {
    const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucket = env.CLOUDFLARE_R2_BUCKET;
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 storage is not fully configured.");
    const host = `${accountId}.r2.cloudflarestorage.com`;
    return {
      endpoint: `https://${host}`,
      host,
      region: "auto",
      service: "s3",
      accessKeyId,
      secretAccessKey,
      bucket
    };
  }

  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  const region = env.AWS_REGION;
  const bucket = env.AWS_S3_BUCKET;
  if (!accessKeyId || !secretAccessKey || !region || !bucket) throw new Error("S3 storage is not fully configured.");
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  return {
    endpoint: `https://${host}`,
    host,
    region,
    service: "s3",
    accessKeyId,
    secretAccessKey,
    bucket
  };
}

function requestPath(config: StorageConfig, driver: S3CompatibleDriver, key: string) {
  const encoded = encodeKey(key);
  return driver === "r2" ? `/${awsEncode(config.bucket)}/${encoded}` : `/${encoded}`;
}

function toArrayBuffer(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function signedRequest(input: RequestInput) {
  const config = getConfig(input.driver);
  const now = new Date();
  const timestamp = amzDate(now);
  const dateStamp = timestamp.slice(0, 8);
  const body = input.body ?? new Uint8Array();
  const payloadHash = sha256(body);
  const path = requestPath(config, input.driver, input.key);

  const canonicalHeaderEntries: Array<[string, string]> = [
    ["host", config.host],
    ["x-amz-content-sha256", payloadHash],
    ["x-amz-date", timestamp]
  ];
  if (input.contentType) canonicalHeaderEntries.push(["content-type", input.contentType]);
  canonicalHeaderEntries.sort(([a], [b]) => a.localeCompare(b));

  const canonicalHeaders = canonicalHeaderEntries.map(([name, value]) => `${name}:${value.trim()}\n`).join("");
  const signedHeaders = canonicalHeaderEntries.map(([name]) => name).join(";");
  const canonicalRequest = [
    input.method,
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const scope = `${dateStamp}/${config.region}/${config.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    scope,
    sha256(canonicalRequest)
  ].join("\n");

  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, config.region);
  const serviceKey = hmac(regionKey, config.service);
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const headers = new Headers({
    Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": timestamp
  });
  if (input.contentType) headers.set("content-type", input.contentType);

  const response = await fetch(`${config.endpoint}${path}`, {
    method: input.method,
    headers,
    body: input.method === "PUT" ? toArrayBuffer(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${input.driver.toUpperCase()} storage ${input.method} failed with HTTP ${response.status}.`);
  }
  return response;
}

export async function putPrivateObject(driver: S3CompatibleDriver, key: string, bytes: Uint8Array, contentType: string) {
  await signedRequest({ driver, method: "PUT", key, body: bytes, contentType });
  return { driver, key };
}

export async function getPrivateObject(driver: S3CompatibleDriver, key: string) {
  const response = await signedRequest({ driver, method: "GET", key });
  return new Uint8Array(await response.arrayBuffer());
}
