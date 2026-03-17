import type { z } from "zod";
import type { Client } from "@xdevplatform/xdk";

export type ToolSchema = Record<string, z.ZodTypeAny>;

/** Type-erased tool for use in arrays/registries */
export interface AnyTool {
  name: string;
  description: string;
  schema: ToolSchema;
  handler: (client: Client, userId: string, args: any) => Promise<unknown>;
}

/** Defines a tool with full type inference on handler args */
export function defineTool<T extends ToolSchema>(tool: {
  name: string;
  description: string;
  schema: T;
  handler: (
    client: Client,
    userId: string,
    args: { [K in keyof T]: z.infer<T[K]> }
  ) => Promise<unknown>;
}): AnyTool {
  return tool;
}
