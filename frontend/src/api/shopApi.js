import { client } from './client';

export const shopApi = {
  getItems: () => client('/shop/items'),
  purchaseItem: (itemId) => client('/shop/purchase', { body: { itemId } }),
  equipItem: (itemId) => client('/shop/equip', { body: { itemId } }),
};
