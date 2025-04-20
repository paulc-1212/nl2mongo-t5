export enum SenderType {
    User = 'user',
    System = 'system',
}

export type Sender = SenderType.User | SenderType.System;
export type RowValue = string | number | boolean | null | undefined  | Date | RowValue[] | { [key: string]: RowValue };
export type DataItem = Record<string, RowValue>;
export type Content = string | DataItem[]

export abstract class Message {
    protected readonly _id: number;
    protected readonly _sender: Sender;
    protected readonly _content: string | DataItem[];
    protected readonly _durationMs?: number;
    protected readonly _isError: boolean;

    protected constructor(sender: Sender, content: Content, durationMs?: number, isError: boolean = false) {
        this._id = Date.now();
        this._sender = sender;
        this._content = content;
        this._durationMs = durationMs;
        this._isError = isError;
    }

    public get id(): number {
        return this._id;
    }

    public get sender(): Sender {
        return this._sender;
    }       

    public get content(): Content {
        return this._content;
    }

    public get durationMs(): number | undefined {
        return this._durationMs;
    }   

    public get isError(): boolean {
        return this._isError;
    }
}

export class MessageFromUser extends Message {

    constructor(content: string) {
        super(SenderType.User, content);
    }

    public override get content(): string {
       return this._content as string; 
   }
}

export class MessageFromSystem extends Message {

    constructor(content: DataItem[], isError: boolean = false, durationMs?: number, ) {
        super(SenderType.System, content, durationMs, isError);
    }

    public override get content(): DataItem[] {
        return this._content as DataItem[];
    }
}