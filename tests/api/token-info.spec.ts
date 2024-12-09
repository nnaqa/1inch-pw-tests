import { test, expect, request } from '@playwright/test';
import dotenv from 'dotenv';


dotenv.config();

const BASE_URL = process.env.BASE_URL;
const VALID_CHAIN_ID = process.env.VALID_CHAIN_ID;
const VALID_ADDRESS = process.env.VALID_ADDRESS;
const EXPECTED_SYMBOL = process.env.EXPECTED_SYMBOL;
const EXPECTED_NAME = process.env.EXPECTED_NAME;
const EXPECTED_DECIMALS = process.env.EXPECTED_DECIMALS;
const API_KEY = process.env.API_KEY;

if (!BASE_URL || !VALID_CHAIN_ID || !VALID_ADDRESS || !EXPECTED_SYMBOL || 
    !EXPECTED_NAME || !EXPECTED_DECIMALS || !API_KEY) {
  throw new Error('Missing required environment variables in .env file');
}

test.describe('Token Endpoint Tests', () => {
  test('Validate token details from API response', async ({ request }) => {
    // Send GET request to the API endpoint with Authorization header
    const response = await request.get(
      `${BASE_URL}/v1.2/${VALID_CHAIN_ID}/custom/${VALID_ADDRESS}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Check that the response status is 200
    expect(response.status()).toBe(200);

    // Parse response body
    const responseBody = await response.json();

    // Validate token properties
    expect(responseBody.symbol).toBe(EXPECTED_SYMBOL);
    expect(responseBody.name).toBe(EXPECTED_NAME);
    expect(responseBody.address).toBe(VALID_ADDRESS);
    expect(responseBody.chainId).toBe(parseInt(VALID_CHAIN_ID));
    expect(responseBody.decimals).toBe(parseInt(EXPECTED_DECIMALS));

    // Validate logoURI and check if the image is available
    const logoURI = responseBody.logoURI;
    expect(logoURI).toBeTruthy(); // Ensure logoURI exists

    const logoResponse = await request.get(logoURI);
    expect(logoResponse.status()).toBe(200); // Ensure image URL is accessible
  });
});
