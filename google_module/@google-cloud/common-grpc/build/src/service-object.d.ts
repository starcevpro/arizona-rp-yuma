/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*!
 * @module commonGrpc/serviceObject
 */
import { Metadata, MetadataCallback, ResponseCallback, ServiceObject, ServiceObjectConfig, SetMetadataResponse } from '@google-cloud/common';
import * as r from 'request';
export declare class GrpcServiceObject extends ServiceObject {
    parent: GrpcServiceObject;
    /**
     * GrpcServiceObject is a base class, meant to be inherited from by a service
     * object that uses the gRPC protobuf API.
     *
     * @constructor
     * @alias module:common/grpc-service-object
     *
     * @private
     *
     * @param {object} config - Configuration object.
     */
    constructor(config: ServiceObjectConfig);
    /**
     * Delete the object.
     *
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     */
    delete(): Promise<[r.Response]>;
    delete(callback: r.RequestCallback): void;
    /**
     * Get the metadata of this object.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.metadata - The metadata for this object.
     */
    getMetadata(): Promise<Metadata>;
    getMetadata(callback: MetadataCallback): void;
    /**
     * Set the metadata for this object.
     *
     * @param {object} metadata - The metadata to set on this object.
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     */
    setMetadata(metadata: Metadata): Promise<SetMetadataResponse>;
    setMetadata(metadata: Metadata, callback: ResponseCallback): void;
    /**
     * Patch a request to the GrpcService object.
     *
     * @private
     */
    request(...args: Array<{}>): any;
    /**
     * Patch a streaming request to the GrpcService object.
     *
     * @private
     */
    requestStream(...args: Array<{}>): any;
    /**
     * Patch a writable streaming request to the GrpcService object.
     *
     * @private
     */
    requestWritableStream(...args: Array<{}>): any;
    private getOpts;
}
