import openNextWorker from "./.open-next/worker.js";
import { canonicalWorkerRedirect } from "./lib/canonical-worker-redirect.ts";

const worker = {
  async fetch(request, env, ctx) {
    const redirect = canonicalWorkerRedirect(request);
    if (redirect) return redirect;

    return openNextWorker.fetch(request, env, ctx);
  },
};

export default worker;
