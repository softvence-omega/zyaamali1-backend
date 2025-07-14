import { GoogleAdsApi } from 'google-ads-api';
import config from '../config';


const client = new GoogleAdsApi({
  client_id: config.google__client_id!,
  client_secret: config.google__client_secret!,
  developer_token: config.google__developer_token!,
});

const customer = client.Customer({
  customer_id: config.google__customer_id!,
  refresh_token: config.google__refresh_token!,
});

export { client, customer };