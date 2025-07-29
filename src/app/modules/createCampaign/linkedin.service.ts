import axios from 'axios';
import querystring from 'querystring';

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI!;
const SCOPE = 'r_ads r_ads_reporting w_ads';

export const generateLinkedInAuthUrl = (): string => {
  const params = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: 'RANDOM_SECURE_STRING',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
};

export const exchangeLinkedInCode = async (code: string) => {
  const resp = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return resp.data; // { access_token, expires_in }
};

export const createLinkedInAd = async ({ accessToken, adAccountId, campaignId, creativeText, creativeMediaId }: {
  accessToken: string;
  adAccountId: string;
  campaignId: string;
  creativeText: string;
  creativeMediaId?: string;
}) => {
  const endpoint = `https://api.linkedin.com/rest/adDirectSponsoredContents?q=statisticsV2`;

  // For simplicity: posting direct sponsored content as ad creative
  const payload = {
    account: `urn:li:sponsoredAccount:${adAccountId}`,
    campaign: `urn:li:sponsoredCampaign:${campaignId}`,
    creative: {
      "media": creativeMediaId ? [`urn:li:sponsoredMedia:${creativeMediaId}`] : undefined,
      "text": creativeText
    }
  };

  const resp = await axios.post(`https://api.linkedin.com/rest/adCreatives`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    }
  });
  return resp.data;
};
