import { webUrl } from "./env";

export class PublicApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name="PublicApiError"; }
}

export async function getPublicData<T>(path: string, signal?: AbortSignal):Promise<T> {
  // Auth cookies, payments, customer identifiers and native storage are deliberately excluded.
  if(!path.startsWith("/") || path.startsWith("//") || /[^\x20-\x7e]/.test(path))
    throw new PublicApiError("Invalid public request.",0);
  const controller=new AbortController();
  const abort=()=>controller.abort();
  signal?.addEventListener("abort",abort,{once:true});
  const timeout=setTimeout(()=>controller.abort(),15000);
  try {
    if(signal?.aborted)throw new PublicApiError("Request cancelled.",0);
    const response=await fetch(webUrl(path),{
      method:"GET",headers:{Accept:"application/json"},signal:controller.signal,
      cache:"no-store"
    });
    const data=await response.json().catch(()=>null) as {data?:T;error?:string}|null;
    if(!response.ok)throw new PublicApiError(
      response.status===429 ? "Too many requests. Try again shortly."
        : typeof data?.error==="string" && response.status<500 ? data.error
          : "The service is temporarily unavailable.",response.status
    );
    if(!data || typeof data!=="object" || !("data" in data))
      throw new PublicApiError("The service returned an unexpected response.",502);
    return data.data as T;
  } catch(error){
    if(error instanceof PublicApiError)throw error;
    if(controller.signal.aborted)throw new PublicApiError("Request cancelled or timed out.",0);
    throw new PublicApiError("Could not connect. Check your network and retry.",0);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort",abort);
  }
}
