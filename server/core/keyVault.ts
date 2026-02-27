import { randomUUID } from "crypto";
import { apiKeySchema, providerNameSchema, type ProviderName } from "@shared/schema";
import { getStoreFiles, readJson, writeJson } from "./fileStore";

type Vault = Record<ProviderName, ReturnType<typeof apiKeySchema.parse>[]>;

const empty = (): Vault => ({
  cerebras: [],
  unrealspeech: [],
  cloudflare: [],
  serpstack: [],
  catbox: [],
  facebook: [],
});

export async function getVault(): Promise<Vault> {
  const raw = await readJson(getStoreFiles().keyVault, empty());
  const out = empty();
  for (const provider of providerNameSchema.options) {
    out[provider] = (raw[provider] ?? []).map((v: unknown) => apiKeySchema.parse(v));
  }
  return out;
}

export async function addKey(provider: ProviderName, key: string, label?: string) {
  const vault = await getVault();
  vault[provider].push(
    apiKeySchema.parse({
      id: randomUUID(),
      key,
      label,
      createdAt: new Date().toISOString(),
      active: true,
      failureCount: 0,
      usageCount: 0,
    }),
  );
  await writeJson(getStoreFiles().keyVault, vault);
  return vault[provider];
}

export async function removeKey(provider: ProviderName, id: string) {
  const vault = await getVault();
  vault[provider] = vault[provider].filter((x) => x.id !== id);
  await writeJson(getStoreFiles().keyVault, vault);
  return vault[provider];
}

export async function acquireKey(provider: ProviderName) {
  const vault = await getVault();
  const candidates = vault[provider].filter((k) => k.active).sort((a, b) => {
    const ad = a.lastUsedAt ? Date.parse(a.lastUsedAt) : 0;
    const bd = b.lastUsedAt ? Date.parse(b.lastUsedAt) : 0;
    return ad - bd;
  });
  if (!candidates.length) throw new Error(`No active keys for ${provider}`);
  return candidates[0];
}

export async function reportKeyUsage(provider: ProviderName, id: string, failed = false) {
  const vault = await getVault();
  vault[provider] = vault[provider].map((k) => {
    if (k.id !== id) return k;
    return {
      ...k,
      usageCount: k.usageCount + 1,
      failureCount: failed ? k.failureCount + 1 : k.failureCount,
      lastUsedAt: new Date().toISOString(),
      lastFailureAt: failed ? new Date().toISOString() : k.lastFailureAt,
      active: failed && k.failureCount >= 3 ? false : k.active,
    };
  });
  await writeJson(getStoreFiles().keyVault, vault);
}
