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

export const PROJECTION_CONFIG_TYPE = 'ProjectionConfig';
export const PROJECTION_CONFIG_RELATION = 'hasProjectionConfig';
export { SPINAL_RELATION_PTR_LST_TYPE as PROJECTION_CONFIG_RELATION_TYPE } from 'spinal-model-graph';

export const CONTEXT_NOT_FOUND_NAME = 'Projection Error';
export const CONTEXT_NOT_FOUND_TYPE = 'ProjectionError';
export const CONTEXT_NOT_FOUND_RELATION = 'ProjectionErrorHasDate';
export const NOT_FOUND_DATE_TYPE = 'ProjectionErrorDate';

export const OVERLAY_LINES_PREVIEW_POSITION_NAME =
  'spinal-overlay-preview-position-line';
export const OVERLAY_SPHERES_PREVIEW_POSITION_NAME =
  'spinal-overlay-preview-position-sphere';

export const GENERATION_CONTEXT_NAME = 'Generation Context';
export const GENERATION_CONTEXT_TYPE = 'GenerationContext';
export const GENERATION_TYPE = 'GenerationType';
export const GENERATION_RELATION = 'hasGeneration';
export const GENERATION_GEO_TYPE = 'ContextSpatial';
export const GENERATION_PROJECTION_TYPE = 'ProjectionSpatial';

export const ARCHIVE_RELATION_NAME = 'hasGenerationArchive';

export const BIMCONTEXT_RELATION_NAME = 'hasBimContext';
