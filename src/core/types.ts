export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestContext<TBody = unknown> {
  traceId: string;
  timestamp: number;
  path: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: TBody;
}

export interface ResponseEnvelope<TData = unknown> {
  statusCode: number;
  traceId: string;
  data?: TData;
  error?: {
    code: string;
    message: string;
  };
}

export interface RouteHandler<TIn, TOut> {
  (ctx: RequestContext<TIn>): Promise<ResponseEnvelope<TOut>>;
}
