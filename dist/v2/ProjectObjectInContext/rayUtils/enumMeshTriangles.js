"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumMeshTriangles = void 0;
const THREE = __importStar(require("three")); // uncomment for worker usage
let vA, vB, vC, nA, nB, nC;
function enumMeshTriangles(geometry, callback) {
    const attributes = geometry.attributes;
    let a, b, c;
    if (!vA) {
        vA = new THREE.Vector3();
        vB = new THREE.Vector3();
        vC = new THREE.Vector3();
        nA = new THREE.Vector3();
        nB = new THREE.Vector3();
        nC = new THREE.Vector3();
    }
    const positions = geometry.vb || attributes.position.array;
    let normals = geometry.vb || (attributes.normal && attributes.normal.array); // eslint-disable-line no-mixed-operators
    const stride = geometry.vb ? geometry.vbstride : 3;
    // Get the offset to positions in the buffer. Be careful, 2D buffers
    // don't use the 'position' attribute for positions. Reject those.
    let poffset;
    if (geometry.vblayout) {
        if (!geometry.vblayout.position) {
            return;
        } // No positions, what to do??
        poffset = geometry.vblayout.position.offset;
    }
    else if (!attributes.position) {
        return;
    } // No positions, what to do??
    else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        poffset = attributes.position.itemOffset || 0;
    }
    let noffset = 0;
    const nattr = geometry.vblayout
        ? geometry.vblayout.normal
        : attributes.normal || null;
    if (nattr) {
        noffset = nattr.offset || nattr.itemOffset || 0;
    }
    else {
        normals = null;
    }
    if (nattr && (nattr.itemSize !== 3 || nattr.bytesPerItem !== 4)) {
        normals = null;
    }
    const indices = geometry.ib ||
        geometry.indices ||
        (attributes.index ? attributes.index.array : null);
    if (indices) {
        let offsets = geometry.offsets;
        if (!offsets || offsets.length === 0) {
            offsets = [{ start: 0, count: indices.length, index: 0 }];
        }
        for (let oi = 0, ol = offsets.length; oi < ol; ++oi) {
            const start = offsets[oi].start;
            const count = offsets[oi].count;
            const index = offsets[oi].index;
            for (let i = start, il = start + count; i < il; i += 3) {
                a = index + indices[i];
                b = index + indices[i + 1];
                c = index + indices[i + 2];
                const pa = a * stride + poffset;
                const pb = b * stride + poffset;
                const pc = c * stride + poffset;
                vA.x = positions[pa];
                vA.y = positions[pa + 1];
                vA.z = positions[pa + 2];
                vB.x = positions[pb];
                vB.y = positions[pb + 1];
                vB.z = positions[pb + 2];
                vC.x = positions[pc];
                vC.y = positions[pc + 1];
                vC.z = positions[pc + 2];
                if (normals) {
                    const na = a * stride + noffset;
                    const nb = b * stride + noffset;
                    const nc = c * stride + noffset;
                    nA.x = normals[na];
                    nA.y = normals[na + 1];
                    nA.z = normals[na + 2];
                    nB.x = normals[nb];
                    nB.y = normals[nb + 1];
                    nB.z = normals[nb + 2];
                    nC.x = normals[nc];
                    nC.y = normals[nc + 1];
                    nC.z = normals[nc + 2];
                    callback(vA, vB, vC, a, b, c, nA, nB, nC);
                }
                else {
                    callback(vA, vB, vC, a, b, c);
                }
            }
        }
    }
    else {
        const vcount = geometry.vb
            ? geometry.vb.length / geometry.vbstride
            : positions.length / 3;
        for (let i = 0; i < vcount; i++) {
            a = 3 * i;
            b = 3 * i + 1;
            c = 3 * i + 2;
            const pa = a * stride + poffset;
            const pb = b * stride + poffset;
            const pc = c * stride + poffset;
            vA.x = positions[pa];
            vA.y = positions[pa + 1];
            vA.z = positions[pa + 2];
            vB.x = positions[pb];
            vB.y = positions[pb + 1];
            vB.z = positions[pb + 2];
            vC.x = positions[pc];
            vC.y = positions[pc + 1];
            vC.z = positions[pc + 2];
            if (normals) {
                const na = a * stride + noffset;
                const nb = b * stride + noffset;
                const nc = c * stride + noffset;
                nA.x = normals[na];
                nA.y = normals[na + 1];
                nA.z = normals[na + 2];
                nB.x = normals[nb];
                nB.y = normals[nb + 1];
                nB.z = normals[nb + 2];
                nC.x = normals[nc];
                nC.y = normals[nc + 1];
                nC.z = normals[nc + 2];
                callback(vA, vB, vC, a, b, c, nA, nB, nC);
            }
            else {
                callback(vA, vB, vC, a, b, c);
            }
        }
    }
}
exports.enumMeshTriangles = enumMeshTriangles;
//# sourceMappingURL=enumMeshTriangles.js.map