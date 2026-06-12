import { AppError } from "./app-error";

type RouteHandler = (req: Request) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof AppError) {
        console.error(`[${error.name}] ${error.message}`);
        return Response.json({ message: error.message }, { status: error.statusCode });
      }
      console.error("[UnhandledError]", error);
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  };
}
