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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIMCONTEXT_RELATION_NAME = exports.ARCHIVE_RELATION_NAME = exports.GENERATION_PROJECTION_TYPE = exports.GENERATION_GEO_TYPE = exports.GENERATION_RELATION = exports.GENERATION_TYPE = exports.GENERATION_CONTEXT_TYPE = exports.GENERATION_CONTEXT_NAME = exports.OVERLAY_SPHERES_PREVIEW_POSITION_NAME = exports.OVERLAY_LINES_PREVIEW_POSITION_NAME = exports.NOT_FOUND_DATE_TYPE = exports.CONTEXT_NOT_FOUND_RELATION = exports.CONTEXT_NOT_FOUND_TYPE = exports.CONTEXT_NOT_FOUND_NAME = exports.PROJECTION_CONFIG_RELATION_TYPE = exports.PROJECTION_CONFIG_RELATION = exports.PROJECTION_CONFIG_TYPE = void 0;
exports.PROJECTION_CONFIG_TYPE = 'ProjectionConfig';
exports.PROJECTION_CONFIG_RELATION = 'hasProjectionConfig';
var spinal_model_graph_1 = require("spinal-model-graph");
Object.defineProperty(exports, "PROJECTION_CONFIG_RELATION_TYPE", { enumerable: true, get: function () { return spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE; } });
exports.CONTEXT_NOT_FOUND_NAME = 'Projection Error';
exports.CONTEXT_NOT_FOUND_TYPE = 'ProjectionError';
exports.CONTEXT_NOT_FOUND_RELATION = 'ProjectionErrorHasDate';
exports.NOT_FOUND_DATE_TYPE = 'ProjectionErrorDate';
exports.OVERLAY_LINES_PREVIEW_POSITION_NAME = 'spinal-overlay-preview-position-line';
exports.OVERLAY_SPHERES_PREVIEW_POSITION_NAME = 'spinal-overlay-preview-position-sphere';
exports.GENERATION_CONTEXT_NAME = 'Generation Context';
exports.GENERATION_CONTEXT_TYPE = 'GenerationContext';
exports.GENERATION_TYPE = 'GenerationType';
exports.GENERATION_RELATION = 'hasGeneration';
exports.GENERATION_GEO_TYPE = 'ContextSpatial';
exports.GENERATION_PROJECTION_TYPE = 'ProjectionSpatial';
exports.ARCHIVE_RELATION_NAME = 'hasGenerationArchive';
exports.BIMCONTEXT_RELATION_NAME = 'hasBimContext';
//# sourceMappingURL=constant.js.map