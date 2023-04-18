import { resetClient } from '../Client';
import {
  Contracts,
  IDeliveryNetworkResponse,
  Responses,
} from '@kontent-ai/delivery-sdk';

const defaultProjectId = '975bf280-fd91-488c-994c-2f04416e5ee3';

const getSampleProjectItems = (
  projectId = defaultProjectId
): Promise<
  IDeliveryNetworkResponse<
    Responses.IListContentItemsResponse,
    Contracts.IListContentItemsContract
  >
> => {
  const client = resetClient(projectId);

  return client.items().elementsParameter(['id']).depthParameter(0).toPromise();
};

export { defaultProjectId, getSampleProjectItems };
