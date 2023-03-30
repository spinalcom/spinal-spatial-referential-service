"use strict";
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
exports.loadBimFile = void 0;
function loadModel(viewer, path, option = {}) {
    return new Promise((resolve, reject) => {
        let m = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (e) => {
            if (m && e.model.id === m.id) {
                viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
                resolve(m);
            }
        };
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fct = viewer.loadModel;
        if (!viewer.model)
            fct = viewer.start;
        fct.call(viewer, path, option, (model) => {
            m = model;
        }, reject);
    });
}
function loadBimFile(bimFile, viewer) {
    return __awaiter(this, void 0, void 0, function* () {
        const bimFileId = bimFile.info.id.get();
        const svfVersionFile = yield window.spinal.SpinalForgeViewer.getSVF(bimFile.element, bimFileId, bimFile.info.name.get());
        const path = window.location.origin + svfVersionFile.path;
        const m = yield loadModel(viewer, path, {});
        window.spinal.BimObjectService.addModel(bimFileId, m, svfVersionFile.version, null, bimFile.info.name.get());
        return m;
    });
}
exports.loadBimFile = loadBimFile;
//# sourceMappingURL=loadBimFile.js.map