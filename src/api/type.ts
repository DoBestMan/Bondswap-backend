export type ReqParams = Array<any>;

export interface Req {
    jsonrpc: '2.0';
    id: number;
    method: string;
    params: ReqParams;
}

export interface Res<T> {
    jsonrpc: '2.0';
    id: number;
    result: T;
}
