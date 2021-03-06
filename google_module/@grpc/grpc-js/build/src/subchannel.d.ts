/// <reference types="node" />
import { EventEmitter } from 'events';
import * as http2 from 'http2';
import * as url from 'url';
import { Call, Http2CallStream } from './call-stream';
import { ChannelOptions } from './channel-options';
import { Metadata } from './metadata';
export interface SubChannel extends EventEmitter {
    /**
     * Attach a call stream to this subchannel's connection to start it
     * @param headers The headers to start the stream with
     * @param callStream The stream to start
     */
    startCallStream(metadata: Metadata, callStream: Call): void;
    close(): void;
}
export declare class Http2SubChannel extends EventEmitter implements SubChannel {
    private session;
    private refCount;
    private userAgent;
    private keepaliveTimeMs;
    private keepaliveTimeoutMs;
    private keepaliveIntervalId;
    private keepaliveTimeoutId;
    constructor(target: url.URL, connectionOptions: http2.SecureClientSessionOptions, userAgent: string, channelArgs: Partial<ChannelOptions>);
    private ref;
    private unref;
    private sendPing;
    private startKeepalivePings;
    private stopKeepalivePings;
    startCallStream(metadata: Metadata, callStream: Http2CallStream): void;
    close(): void;
}
