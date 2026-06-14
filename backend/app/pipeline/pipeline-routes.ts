import { withErrorHandler } from "../errors/error-handler";
import { runPipeline } from "./pipeline-controller";

export const pipelineRoutes = {
  "/pipeline/run": {
    POST: withErrorHandler(runPipeline),
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
