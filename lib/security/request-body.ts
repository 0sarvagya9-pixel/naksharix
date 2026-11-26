type BoundedBodyResult =
  | {ok:true;text:string}
  | {ok:false;reason:"too_large"|"invalid_body"};

/** Bound actual bytes before decoding or parsing, including chunked requests. */
export async function readBoundedUtf8Body(request:Request,maxBytes:number):Promise<BoundedBodyResult>{
  if(!Number.isSafeInteger(maxBytes)||maxBytes<1)throw new RangeError("Invalid request byte limit");
  if(!request.body||request.bodyUsed||request.body.locked)return {ok:false,reason:"invalid_body"};
  const reader=request.body.getReader();
  const cancel=()=>reader.cancel().catch(()=>undefined);
  const decoder=new TextDecoder("utf-8",{fatal:true});
  let size=0,text="";
  try{
    // This is only an early rejection. A small or missing header never bypasses
    // the observed stream limit, and the length unit is bytes, not JS characters.
    const declared=request.headers.get("content-length");
    if(declared!==null&&/^\d+$/.test(declared)&&Number(declared)>maxBytes){
      await cancel();return {ok:false,reason:"too_large"};
    }
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      size+=value.byteLength;
      if(size>maxBytes){await cancel();return {ok:false,reason:"too_large"};}
      text+=decoder.decode(value,{stream:true});
    }
    return {ok:true,text:text+decoder.decode()};
  }catch{
    await cancel();
    return {ok:false,reason:"invalid_body"};
  }finally{
    reader.releaseLock();
  }
}
