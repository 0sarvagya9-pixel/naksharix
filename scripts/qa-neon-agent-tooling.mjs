import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const s=(p)=>readFileSync(p,"utf8");
assert.match(s(".agents/skills/neon/SKILL.md"),/^---\nname: neon\n/);
assert.match(s(".agents/skills/neon-postgres/SKILL.md"),/^---\nname: neon-postgres\n/);
for(const [skill,refs] of Object.entries({
 neon:["auth.md","claimable-neon.md","function-triggers.md","logs-loki.md","parse-env.md","sdk.md"],
 "neon-postgres":["branching.md","egress-optimization.md","full-text-search.md","hybrid-search.md","lakebase-search-drizzle.md","vector-search.md"]
})){
 for(const ref of refs) assert.ok(existsSync(".agents/skills/"+skill+"/references/"+ref),"Official reference missing: "+skill+"/"+ref);
}
const mcp=s(".codex/config.toml");
assert.match(mcp,/\[mcp_servers\.neon\]/);
assert.ok(mcp.includes("https://mcp.neon.tech/mcp?projectId=delicate-star-51216895&readonly=true&category=docs&category=schema"));
assert.ok(!/Bearer\s|Authorization\s*=|NEON_API_KEY|DATABASE_URL\s*=/.test(mcp),"No secrets in MCP config");
assert.ok(!/command\s*=/.test(mcp),"Do not execute a local third-party MCP server");
console.log("NAKSHARIX_NEON_SKILLS=PASS;PROJECT_SCOPED_OAUTH_MCP=PASS;NO_SECRET_WRITES=PASS");
