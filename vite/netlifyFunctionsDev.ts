import { readdirSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Dev-only: serves netlify/functions/* on the Vite dev server so `npm run dev` runs the full app
 * without netlify-cli. Functions are loaded through Vite's SSR loader (TypeScript, hot reload) and
 * routed by their exported `config.path` / `config.method`, like on Netlify.
 */

type FunctionModule = {
    default: (req: Request, context: unknown) => Promise<Response> | Response;
    config?: { path?: string | string[]; method?: string | string[] };
};

const matchPath = (pattern: string, pathname: string): Record<string, string> | null => {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) {
        return null;
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        const part = patternParts[i];
        if (part.startsWith(":")) {
            params[part.slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (part !== pathParts[i]) {
            return null;
        }
    }
    return params;
};

const readBody = async (req: IncomingMessage) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
};

const handle = async (server: ViteDevServer, functionsDir: string, req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const files = readdirSync(functionsDir).filter((file) => /\.(m?ts|m?js)$/.test(file));

    for (const file of files) {
        const mod = (await server.ssrLoadModule(path.join(functionsDir, file))) as FunctionModule;
        const paths = [mod.config?.path ?? []].flat();
        const methods = [mod.config?.method ?? []].flat().map((m) => m.toUpperCase());

        for (const pattern of paths) {
            const params = matchPath(pattern, url.pathname);
            if (!params || (methods.length > 0 && !methods.includes(req.method ?? "GET"))) {
                continue;
            }

            const controller = new AbortController();
            res.on("close", () => controller.abort());

            const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
                if (typeof value === "string") {
                    headers.set(key, value);
                }
            }

            const request = new Request(`http://${req.headers.host}${req.url}`, {
                method: req.method,
                headers,
                body,
                signal: controller.signal,
            });
            const response = await mod.default(request, { params, ip: req.socket.remoteAddress ?? "127.0.0.1" });

            res.statusCode = response.status;
            response.headers.forEach((value, key) => res.setHeader(key, value));
            if (response.body) {
                for await (const chunk of response.body) {
                    res.write(chunk);
                }
            }
            res.end();
            return true;
        }
    }
    return false;
};

export const netlifyFunctionsDev = (): Plugin => ({
    name: "paradox:netlify-functions-dev",
    apply: "serve",
    configureServer(server) {
        const functionsDir = path.resolve(server.config.root, "netlify/functions");

        server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith("/api/")) {
                next();
                return;
            }
            handle(server, functionsDir, req, res)
                .then((handled) => {
                    if (!handled) {
                        res.statusCode = 404;
                        res.end(JSON.stringify({ error: "Not found" }));
                    }
                })
                .catch((error) => {
                    server.config.logger.error(String(error?.stack ?? error));
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: "Function crashed" }));
                });
        });
    },
});
