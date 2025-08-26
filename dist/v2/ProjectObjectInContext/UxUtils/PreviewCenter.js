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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewItem = void 0;
exports.stopPreview = stopPreview;
exports.setColorPreview = setColorPreview;
exports.getColorPreview = getColorPreview;
const getBBoxAndMatrixs_1 = require("../../utils/projection/getBBoxAndMatrixs");
const getLeafDbIdsByModelId_1 = require("../../utils/projection/getLeafDbIdsByModelId");
const getPointOffset_1 = require("../../utils/projection/getPointOffset");
const transformRtzToXyz_1 = require("../../utils/projection/transformRtzToXyz");
const isProjectionGroup_1 = require("../../utils/projection/isProjectionGroup");
const lodash_throttle_1 = __importDefault(require("lodash.throttle"));
const constant_1 = require("../../constant");
let current = null;
let sphereMat = null;
let lineMat = null;
let sceneSphereOverlay = null;
let sceneLineOverlay = null;
let color = '#00ff00';
exports.previewItem = (0, lodash_throttle_1.default)(_previewItem, 1000);
function _previewItem(item, offset, mode, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        const _offset = (0, transformRtzToXyz_1.transformRtzToXyz)(offset);
        if (current === null) {
            createNew(item, _offset);
        }
        try {
            current.offset = _offset;
            populateItemToShow(item, mode);
            yield (0, getBBoxAndMatrixs_1.getBBoxAndMatrixs)(current, viewer);
            for (const itm of current.itemToShow) {
                updatePointOffset(itm, _offset, viewer);
            }
            viewer.impl.invalidate(true, true, true);
        }
        catch (e) {
            console.error(e);
        }
    });
}
function stopPreview(viewer) {
    const curr = current;
    if (curr === null)
        return Promise.resolve();
    curr.lock = true;
    for (const itm of curr.itemToShow) {
        hideItem(itm);
    }
    viewer.impl.invalidate(true, true, true);
    current = null;
    viewer.impl.invalidate(true, true, true);
}
function setColorPreview(colorStr) {
    color = colorStr;
    if (sphereMat)
        sphereMat.color.set(color);
    if (lineMat)
        lineMat.color.set(color);
}
function getColorPreview() {
    return color;
}
function createNew(item, offset) {
    current = {
        item,
        mode: 0,
        offset,
        lock: false,
        itemToShow: [],
    };
}
function populateItemToShow(item, mode) {
    const curr = current;
    if (curr.mode !== mode) {
        if (mode === 0) {
            for (const itm of curr.itemToShow) {
                hideItem(itm);
            }
            curr.itemToShow = [];
            curr.mode = mode;
        }
        else if (mode === 1) {
            if ((0, isProjectionGroup_1.isProjectionGroup)(item)) {
                const first = item.computedData[0];
                if (typeof first === 'undefined')
                    return;
                const ids = (0, getLeafDbIdsByModelId_1.getLeafDbIdsByModelId)(first.modelId, first.dbId);
                if (ids.length === 0)
                    return;
                for (const itm of curr.itemToShow) {
                    hideItem(itm);
                }
                curr.itemToShow = [{ dbId: ids[0], modelId: first.modelId }];
            }
            else {
                const ids = (0, getLeafDbIdsByModelId_1.getLeafDbIdsByModelId)(item.modelId, item.dbId);
                if (ids.length === 0)
                    return;
                for (const itm of curr.itemToShow) {
                    hideItem(itm);
                }
                curr.itemToShow = [{ dbId: ids[0], modelId: item.modelId }];
            }
        }
        else {
            if ((0, isProjectionGroup_1.isProjectionGroup)(item)) {
                for (const itm of curr.itemToShow) {
                    hideItem(itm);
                }
                curr.itemToShow = [];
                for (const itm of item.computedData) {
                    const ids = (0, getLeafDbIdsByModelId_1.getLeafDbIdsByModelId)(itm.modelId, itm.dbId);
                    if (ids.length === 0)
                        continue;
                    for (const id of ids) {
                        curr.itemToShow.push({ dbId: id, modelId: itm.modelId });
                    }
                }
            }
            else {
                for (const itm of curr.itemToShow) {
                    hideItem(itm);
                }
                const ids = (0, getLeafDbIdsByModelId_1.getLeafDbIdsByModelId)(item.modelId, item.dbId);
                if (ids.length === 0)
                    return;
                curr.itemToShow = [];
                for (const id of ids) {
                    curr.itemToShow.push({ dbId: id, modelId: item.modelId });
                }
            }
        }
        curr.mode = mode;
    }
}
function hideItem(item) {
    sceneSphereOverlay.remove(item.sphere);
    sceneLineOverlay.remove(item.line);
}
function getSphereMat(viewer) {
    if (sphereMat === null) {
        sphereMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const { scene } = viewer.impl.createOverlayScene(constant_1.OVERLAY_SPHERES_PREVIEW_POSITION_NAME, sphereMat);
        sceneSphereOverlay = scene;
    }
    return sphereMat;
}
function getLineMat(viewer) {
    if (lineMat === null) {
        lineMat = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            depthWrite: true,
            depthTest: true,
            linewidth: 3,
            opacity: 1.0,
        });
        const { scene } = viewer.impl.createOverlayScene(constant_1.OVERLAY_LINES_PREVIEW_POSITION_NAME, lineMat);
        sceneLineOverlay = scene;
    }
    return lineMat;
}
function updatePointOffset(item, offset, viewer) {
    const matrixWorld = item.matrixWorld;
    const bbox = item.bbox;
    const bBoxCenter = new THREE.Vector3();
    bbox.getCenter(bBoxCenter);
    const point = (0, getPointOffset_1.getPointOffset)(bBoxCenter, offset, matrixWorld);
    const sphere = getOrCreateSphere(item, viewer);
    sphere.position.set(point.x, point.y, point.z);
    sphere.updateMatrix();
    const line = getOrCreateLine(item, bBoxCenter, viewer);
    if (line.geometry instanceof THREE.BufferGeometry) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        line.geometry.attributes.position.needsUpdate = true;
    }
    else {
        line.geometry.verticesNeedUpdate = true;
    }
}
function getOrCreateSphere(item, viewer) {
    if (typeof item.sphere === 'undefined') {
        const material_green = getSphereMat(viewer);
        const sphere_geo = new THREE.SphereGeometry(0.4, 30, 30);
        const sphere_maxpt = new THREE.Mesh(sphere_geo, material_green);
        sphere_maxpt.matrixAutoUpdate = false;
        viewer.impl.addOverlay(constant_1.OVERLAY_SPHERES_PREVIEW_POSITION_NAME, sphere_maxpt);
        item.sphere = sphere_maxpt;
    }
    return item.sphere;
}
function getOrCreateLine(item, bBoxCenter, viewer) {
    if (typeof item.line === 'undefined') {
        const geometryLine = new THREE.Geometry();
        geometryLine.vertices.push(new THREE.Vector3(bBoxCenter.x, bBoxCenter.y, bBoxCenter.z), item.sphere.position);
        const material = getLineMat(viewer);
        const line = new THREE.Line(geometryLine, material);
        viewer.impl.addOverlay(constant_1.OVERLAY_LINES_PREVIEW_POSITION_NAME, line);
        item.line = line;
    }
    return item.line;
}
//# sourceMappingURL=PreviewCenter.js.map