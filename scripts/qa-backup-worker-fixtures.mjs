import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import assert from "node:assert/strict";
const raw=fs.readFileSync("lib/ops/backup-worker.ts","utf8"),tick=String.fromCharCode(96);
const start=raw.indexOf("export const EXPORT_WORKER = String.raw"+tick);
const end=raw.indexOf(tick+";\nexport const RESTORE_WORKER",start);
assert.ok(start>=0&&end>start);
const source=raw.slice(start+"export const EXPORT_WORKER = String.raw".length+1,end);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"naksh-backup-fixture-"));
const worker=path.join(tmp,"export.mjs"),psql=path.join(tmp,"psql"),dump=path.join(tmp,"pg_dump");
fs.writeFileSync(worker,source);
fs.writeFileSync(psql,[
"#!/bin/sh",
'if [ "$TEST_PSQL_FAIL" = "auth" ]; then echo "password authentication failed" >&2; exit 1; fi',
'if [ "$TEST_PSQL_FAIL" = "off" ]; then echo off; exit 0; fi',
'if [ "$TEST_PSQL_FAIL" = "once" ] && [ ! -e "$TEST_STATEFILE" ]; then touch "$TEST_STATEFILE"; echo "connection timed out" >&2; exit 1; fi',
'echo on'].join("\n")+"\n");
fs.writeFileSync(dump,[
"#!/bin/sh",
'if [ "$TEST_DUMP_FAIL" = "query" ]; then echo "canceling statement due to statement timeout" >&2; exit 1; fi',
'if [ "$TEST_DUMP_FAIL" = "net" ]; then echo "could not connect to server" >&2; exit 1; fi',
'printf PGDMP > /tmp/naksh-source.dump',
'head -c 160 /dev/zero >> /tmp/naksh-source.dump'].join("\n")+"\n");
fs.chmodSync(psql,0o700);fs.chmodSync(dump,0o700);
const cases=[["success",{},0,"archiveBytes"],["readonly-off",{TEST_PSQL_FAIL:"off"},1,"READONLY_GUARD"],["auth-denied",{TEST_PSQL_FAIL:"auth"},1,"AUTH"],["retry-once",{TEST_PSQL_FAIL:"once",TEST_STATEFILE:path.join(tmp,"state")},0,"archiveBytes"],["query-timeout",{TEST_DUMP_FAIL:"query"},1,"QUERY_TIMEOUT"],["network-fail",{TEST_DUMP_FAIL:"net"},1,"NETWORK"]];
for(const [name,flags,exit,diagnostic] of cases){
  try{fs.unlinkSync("/tmp/naksh-source.dump")}catch{}
  const env={...process.env,PATH:tmp+":"+process.env.PATH,BACKUP_DATABASE_URL:"postgresql://fixture:dummy@ep-qa.c-8.us-east-1.aws.neon.tech/neondb",BACKUP_EXPECTED_SOURCE_HOST:"ep-qa.c-8.us-east-1.aws.neon.tech",...flags};
  const r=spawnSync(process.execPath,[worker],{env,encoding:"utf8",timeout:15000});
  assert.equal(r.status,exit,name+" unexpected exit");
  assert.ok((r.stderr+r.stdout).includes(diagnostic),name+" expected "+diagnostic);
  assert.ok(!r.stderr.includes("dummy"),name+" secret leaked");
  console.log("BACKUP_WORKER_FIXTURE="+name+":PASS");
}
try{fs.unlinkSync("/tmp/naksh-source.dump")}catch{}
fs.rmSync(tmp,{recursive:true,force:true});
console.log("BACKUP_WORKER_RUNTIME_FIXTURES=6/6_PASS");
