# NAKSHARIX — Neon agent skills and MCP audit

Verified against Neon official skill `https://neon.com/.well-known/agent-skills/neon/SKILL.md` and upstream `neondatabase/agent-skills` commit `392174f40372f8ffd1f02604cbd68310c47fc7ac` (11 November 2026).

## Existing setup — preserved

- Production Neon project: `delicate-star-51216895` (AWS US East 1).
- The existing Next.js/Prisma code, authentication, deployed Vercel project, database role grants, `DATABASE_URL`/`DIRECT_URL` settings, any .env files, current backup recovery workflows have **not been modified** by the agent tooling setup. The existing GitHub CI workflow only receives an additive static QA step for these agent config files; all prior CI checks remain intact.
- ChatGPT's installed Neon integration already provides the `neon` and `neon-postgres` skills and a connected Neon MCP. The NAKSHARIX project was readable through that connection. No second ChatGPT connector or new Neon project was created.
- Audit of NAKSHARIX `main` found no existing repo-level `.agents/skills`, `.codex/config.toml` or `.mcp.json`; additions below are new files, not overwrites.

## Newly installed for project-level Codex usage

- The full upstream `neon` and `neon-postgres` skills, including all published relative reference files, are vendored under `.agents/skills/`. The sources are pinned to the commit above so the installation is reproducible.
- GitHub CI now runs `node scripts/qa-neon-agent-tooling.mjs` as a read-only agent-setup gate; the existing build/test jobs are preserved.
- `.codex/config.toml` adds the official hosted Neon MCP server via OAuth. **No API token** is stored in Git; when Codex first loads this project, its OAuth flow may ask the owner to authorize access.
- The MCP URL is scoped to the existing NAKSHARIX project, `readonly=true`, with only `docs` and `schema` categories. No SQL modification or customer-row reading tools are exposed by this new Codex configuration. Neon's official guidance discourages connecting MCP agents directly to production data; this deliberately restricts the tool surface.
- The existing ChatGPT Neon MCP connection is **already installed** and is unchanged; this project-level Codex file does not install or alter the ChatGPT connector.
- No `neon init` or `neon link` is run, because the app already uses Neon and those commands could overwrite working application configuration. No new `neon.ts`, `.neon`, API key, service, branch or database is created.

## Verify

From a trusted clone opened in Codex, restart Codex after pulling this commit. Check project MCP configuration with `codex mcp list`. If prompted, authorize Neon OAuth for this project; otherwise `codex mcp login neon`. Verify the two skill directories exist in `.agents/skills` and run `node scripts/qa-neon-agent-tooling.mjs` to validate the local installation without connecting to Neon.

The skills were installed from pinned official source files, rather than by `neon skills`; no synthetic `skills-lock.json` was created. To bring them under CLI-managed updates later, use an approved `neon skills -s neon -s neon-postgres --agent codex -y` from the repository root with a sufficiently recent Node version after reviewing its planned changes.

## Backup incident remains independent

These agent-tooling changes do not fix the separate GitHub Actions protected secret write failure. The owner-local backup setup reached `NAKSHARIX_NEON_AUTH=PASS` and `Neon direct SSL read-only credential validation: PASS`, then `gh secret set BACKUP_DATABASE_URL` failed. That secret must be set securely; never paste it, a private age key, or a Neon token into source control or chat. A real successful encrypted export and isolated restore remains required before the backup is marked verified.
