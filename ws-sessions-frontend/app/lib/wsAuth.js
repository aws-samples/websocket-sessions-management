import { Sha256 } from "@aws-crypto/sha256-js";
import {
  CognitoIdentityClient,
  GetCredentialsForIdentityCommand,
  GetIdCommand,
} from "@aws-sdk/client-cognito-identity";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";

// LocalStorage key for the cached IdentityId. We persist it across reloads
// so the same browser keeps the same userId between sessions, which is the
// anonymous reconnecting user feature this sample is built around.
const IDENTITY_KEY = "ws-sessions:identityId";

// Pull a usable AWS region out of the WS URL. API Gateway WebSocket URLs
// look like wss://<id>.execute-api.<region>.amazonaws.com/<stage>
function regionFromWsUrl(wsUrl) {
  const m = /\.execute-api\.([^.]+)\.amazonaws\.com/.exec(wsUrl);
  if (!m) {
    throw new Error(
      "Could not derive AWS region from WebSocket URL. Expected wss://<id>.execute-api.<region>.amazonaws.com/<stage>"
    );
  }
  return m[1];
}

// Resolve a stable IdentityId for this browser, creating one on first load.
// Returned ids look like "<region>:<uuid>" and are what API Gateway exposes
// as requestContext.identity.cognitoIdentityId on the OnConnect Lambda.
async function resolveIdentityId(client, identityPoolId) {
  const cached = typeof window !== "undefined"
    ? window.localStorage.getItem(IDENTITY_KEY)
    : null;
  if (cached) return cached;

  const { IdentityId } = await client.send(
    new GetIdCommand({ IdentityPoolId: identityPoolId })
  );
  if (!IdentityId) throw new Error("Cognito GetId returned no IdentityId");

  window.localStorage.setItem(IDENTITY_KEY, IdentityId);
  return IdentityId;
}

// Forget the current identity. The next call to getSignedConnectUrl will
// allocate a fresh one, which is how the "Reset Identity" button works.
export function clearIdentity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(IDENTITY_KEY);
}

export function getCachedIdentityId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(IDENTITY_KEY);
}

// Take a plain WebSocket URL and return a SigV4-signed version that the
// $connect route (AuthorizationType: AWS_IAM) will accept. Also returns the
// IdentityId so the UI can display it as the userId. We sign as if the
// upgrade request were an HTTPS GET to execute-api, which is what API
// Gateway actually validates under the hood.
export async function getSignedConnectUrl(wsUrl, identityPoolId) {
  const region = regionFromWsUrl(wsUrl);
  const cognito = new CognitoIdentityClient({ region });

  const identityId = await resolveIdentityId(cognito, identityPoolId);

  const { Credentials } = await cognito.send(
    new GetCredentialsForIdentityCommand({ IdentityId: identityId })
  );
  if (!Credentials) {
    throw new Error("Cognito GetCredentialsForIdentity returned no Credentials");
  }

  const url = new URL(wsUrl);
  const signer = new SignatureV4({
    service: "execute-api",
    region,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretKey,
      sessionToken: Credentials.SessionToken,
    },
    sha256: Sha256,
  });

  const request = new HttpRequest({
    protocol: "https:",
    hostname: url.hostname,
    method: "GET",
    path: url.pathname,
    headers: { host: url.hostname },
  });

  // 5 minutes is plenty for a single $connect handshake and bounds the blast
  // radius if the URL ends up in a log line somewhere.
  const signed = await signer.presign(request, { expiresIn: 300 });

  const signedUrl = new URL(wsUrl);
  for (const [k, v] of Object.entries(signed.query ?? {})) {
    signedUrl.searchParams.set(k, v);
  }

  return { signedUrl: signedUrl.toString(), identityId };
}
