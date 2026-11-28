import {readFileSync,existsSync,statSync} from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
const require=createRequire(import.meta.url),ts=require("typescript");
export function resolveSource(name,from,root=process.cwd()){
 const base=name.startsWith("@/")?path.join(root,name.slice(2)):name.startsWith(".")?path.resolve(path.dirname(from),name):null;
 if(!base)return require.resolve(name);
 return [base,base+".ts",base+".tsx",base+".js",base+".cjs",path.join(base,"index.ts"),path.join(base,"index.tsx"),path.join(base,"index.js"),path.join(base,"index.cjs")].find(p=>existsSync(p)&&statSync(p).isFile())??require.resolve(base);
}
export function compileSource(file,{baseline,baselineFiles=[]}={}){
 const relative=path.relative(process.cwd(),file).replaceAll(path.sep,"/");
 const source=baseline&&baselineFiles.includes(relative)?execFileSync("git",["show",baseline+":"+relative],{encoding:"utf8"}):readFileSync(file,"utf8");
 if(file.endsWith(".json"))return "module.exports="+source+";";
 return /\.tsx?$/.test(file)?ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText:source;
}
/** Bundles actual local source and installed pure-JS packages. External seams must be declared. */
export function browserModules(entries,external,options={}){
 const modules=new Map(),seams=new Set(external);
 function add(file){
  if(modules.has(file))return;const code=compileSource(file,options),deps={};modules.set(file,{code,deps});
  for(const m of code.matchAll(/require\(["']([^"']+)["']\)/g)){
   const name=m[1];if(seams.has(name)){deps[name]=name;continue;}
   if(name.startsWith("node:"))throw Error("Undeclared browser seam "+name);
   const target=resolveSource(name,file);deps[name]=target;add(target);
  }
 }
 for(const entry of entries)add(path.resolve(entry));
 const table=[...modules].map(([file,{code,deps}])=>JSON.stringify(file)+":[function(module,exports,require){\n"+code+"\n},"+JSON.stringify(deps)+"]").join(",");
 return "const actualModules={"+table+"},actualCache={};function actualRequire(id){const externalValue=externalRequire(id);if(externalValue!==undefined)return externalValue;if(actualCache[id])return actualCache[id].exports;const row=actualModules[id];if(!row)throw Error('Unconfigured module '+id);const loaded={exports:{}};actualCache[id]=loaded;row[0](loaded,loaded.exports,name=>actualRequire(row[1][name]));return loaded.exports;}";
}
export function sourceLoader(overrides={},options={}){
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const loaded={exports:{}};cache.set(file,loaded);
  const local=name=>Object.hasOwn(overrides,name)?overrides[name]:(name.startsWith("@/")||name.startsWith("."))?load(resolveSource(name,file)):require(name);
  new Function("require","module","exports",compileSource(file,options))(local,loaded,loaded.exports);return loaded.exports;
 }
 return load;
}
