"use strict";
/*!
 * Copyright 2017 Google Inc. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
exports.grpc = grpc;
const operation_1 = require("./operation");
const service_1 = require("./service");
const service_object_1 = require("./service-object");
// tslint:disable-next-line:variable-name
const Service = service_1.GrpcService;
exports.Service = Service;
// tslint:disable-next-line:variable-name
const ServiceObject = service_object_1.GrpcServiceObject;
exports.ServiceObject = ServiceObject;
// tslint:disable-next-line:variable-name
const Operation = operation_1.GrpcOperation;
exports.Operation = Operation;
/**
 * @type {module:common/util}
 * @private
 */
var common_1 = require("@google-cloud/common");
exports.util = common_1.util;
//# sourceMappingURL=index.js.map