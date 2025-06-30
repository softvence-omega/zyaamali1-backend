import axios from 'axios';
import config from '../../config';
import {FacebookAdsApi, User ,AdAccount} from 'facebook-nodejs-business-sdk';

 const getFacebookAccessToken = async (code: string) => {
  const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
    params: {
      client_id: config.facebookAppId,
      client_secret: config.facebookAppSecret,
      redirect_uri: config.facebookRedirectUri,
      code,
    },
  });

  return response.data.access_token;
};

 const getFacebookAdAccounts = async (accessToken: string) => {
  FacebookAdsApi.init(accessToken); // Sets the default token for SDK

  const user = new User('me');
  const adAccounts = await user.getAdAccounts(); // No need to pass token here

  return adAccounts.map(account => ({
    id: account.id,
    name: account.name,
    account_status: account.account_status,
  }));
};

const getInstagramAccounts = async (accessToken: string, adAccountId: string) => {
  FacebookAdsApi.init(accessToken);
  const adAccount = new AdAccount(adAccountId);
  const instaAccounts = await adAccount.getInstagramAccounts();

  return instaAccounts.map(insta => ({
    id: insta.id,
    name: insta.name,
    username: insta.username,
  }));
};




export const connectAdsAccountservice ={
    getFacebookAccessToken,
    getFacebookAdAccounts,
    getInstagramAccounts
}
