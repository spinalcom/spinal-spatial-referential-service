"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raycastItemToMesh = raycastItemToMesh;
const utils_1 = require("../../utils");
const getModifiedWorldBoundingBox_1 = require("../../utils/projection/getModifiedWorldBoundingBox");
const getPointOffset_1 = require("../../utils/projection/getPointOffset");
const getFragIds_1 = require("../../utils/getFragIds");
// raycast job don't use webworker
const raycastJob_1 = require("../rayUtils/raycastJob");
// also raycast job but use webworker
function raycastItemToMesh(from, to, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [centerPoints, geometries] = yield Promise.all([
                getCenterObjects(from, viewer),
                getMeshsData(to, viewer),
            ]);
            console.log('raycastItemToMesh', centerPoints, geometries);
            return (0, raycastJob_1.raycastJob)({ centerPoints, geometries });
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    });
}
function getCenterObjects(array, viewer) {
    const res = [];
    for (const obj of array) {
        for (const { dbId, offset } of obj.dbId) {
            // add offset here
            const center = getCenter(dbId, offset, obj.model, viewer);
            res.push(center);
        }
    }
    return Promise.all(res);
}
function getCenter(dbId, offset, model, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        const { matrixWorld, bbox } = yield (0, utils_1.getBBoxAndMatrix)(dbId, model, viewer);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        return {
            dbId,
            modelId: model.id,
            center: (0, getPointOffset_1.getPointOffset)(center, offset, matrixWorld),
        };
    });
}
function getMeshsData(array, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = [];
        for (const { model, dbId } of array) {
            for (const dbIdItem of dbId) {
                res.push(getMesh(dbIdItem, model, viewer));
            }
        }
        const tmp = yield Promise.all(res);
        return tmp.filter((item) => {
            return item != null;
        });
    });
}
function getMesh(dbIdItem, model, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ids = yield (0, getFragIds_1.getFragIds)(dbIdItem, model);
            const meshs = ids.map((fragId) => viewer.impl.getRenderProxy(model, fragId));
            const bbox = (0, getModifiedWorldBoundingBox_1.getModifiedWorldBoundingBox)(ids, model);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            const dataMesh = meshs.map((mesh) => {
                return {
                    geometry: {
                        vb: mesh.geometry.vb,
                        vblayout: mesh.geometry.vblayout,
                        attributes: mesh.geometry.attributes,
                        ib: mesh.geometry.ib,
                        indices: mesh.geometry.indices,
                        index: mesh.geometry.index,
                        offsets: mesh.geometry.offsets,
                        vbstride: mesh.geometry.vbstride,
                    },
                    matrixWorld: mesh.matrixWorld,
                    center,
                    bbox,
                };
            });
            return {
                dataMesh,
                dbId: dbIdItem,
                modelId: model.id,
            };
        }
        catch (e) {
            console.log('getMeshsData no fragId in', dbIdItem);
            return null;
        }
    });
}
//# sourceMappingURL=raycastItemToMesh.js.map