import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { ProjectionGroupModel } from '../projectionModels/ProjectionGroupModel';
import type { ProjectionItemModel } from '../projectionModels/ProjectionItemModel';
import { type SpinalContext } from 'spinal-model-graph';
import { Lst } from 'spinal-core-connectorjs';
export declare function createConfigNode(context: SpinalContext, item: ProjectionGroupConfig): Promise<Lst<ProjectionGroupModel | ProjectionItemModel>>;
