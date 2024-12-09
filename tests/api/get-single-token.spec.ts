import { test, expect, request } from '@playwright/test';
import dotenv from 'dotenv';


dotenv.config();

const BASE_URL = process.env.BASE_URL;
const VALID_CHAIN_ID = process.env.VALID_CHAIN_ID;
const INVALID_CHAIN_ID = process.env.INVALID_CHAIN_ID;
const VALID_ADDRESS = process.env.VALID_ADDRESS;
const INVALID_ADDRESS = process.env.INVALID_ADDRESS;
const EXPECTED_SYMBOL = process.env.EXPECTED_SYMBOL;
const EXPECTED_NAME = process.env.EXPECTED_NAME;
const EXPECTED_DECIMALS = process.env.EXPECTED_DECIMALS;
const API_KEY = process.env.API_KEY;

if (!BASE_URL || !VALID_CHAIN_ID || !INVALID_CHAIN_ID || !VALID_ADDRESS || !INVALID_ADDRESS || !EXPECTED_SYMBOL || 
    !EXPECTED_NAME || !EXPECTED_DECIMALS || !API_KEY) {
  throw new Error('Missing required environment variables in .env file');
}

test.describe('Get Single Token Endpoint Tests', () => {
    let responseBody: any;

    test.beforeAll(async ({ request }) => {
        // Making an API call once before all tests
        // Send GET request to the API endpoint with Authorization header
        const response = await request.get(
            `${BASE_URL}/v1.2/${VALID_CHAIN_ID}/custom/${VALID_ADDRESS}`,
            {
                headers: {
                Authorization: `Bearer ${API_KEY}`,
                },
            }
            );
        expect(response.status()).toBe(200);
        // Parse response body
        responseBody = await response.json();
    });

    test('Validate token details from API response. Test scenario from Test Task 3', async ({ request }) => {
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

    test('Validate all token details from API response', async ({ request }) => {
        // Validate all token properties from correct request
        expect(responseBody).toMatchObject({
            "symbol": EXPECTED_SYMBOL,
            "name": EXPECTED_NAME,
            "address": VALID_ADDRESS,
            "chainId": parseInt(VALID_CHAIN_ID),
            "decimals": parseInt(EXPECTED_DECIMALS),
            "logoURI": "https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png",
            "isFoT": false,
            "rating": 10,
            "eip2612": true,
            "tags": [
              {
                "value": "crosschain",
                "provider": "1inch"
              },
              {
                "value": "defi",
                "provider": "Defiprime"
              },
              {
                "value": "GROUP:1INCH",
                "provider": "1inch"
              },
              {
                "value": "tokens",
                "provider": "1inch"
              }
            ],
            "providers": [
              "1inch",
              "CoinGecko",
              "Curve Token List",
              "Defiprime",
              "Furucombo",
              "Gemini Token List",
              "Kleros Tokens",
              "Trust Wallet Assets",
              "Uniswap Labs Default",
              "Zerion"
            ]
        });
    });

    test('Invalid address request to token endpoint', async ({ request }) => {
        // Send GET request to the API endpoint with invalid address
        const invalidURL = `${BASE_URL}/v1.2/${VALID_CHAIN_ID}/custom/${INVALID_ADDRESS}`
        const response = await request.get(
            invalidURL,
            {
                headers: {
                Authorization: `Bearer ${API_KEY}`,
                },
            }
            );
        expect(response.status()).toBe(400);
    
        const responseBody = await response.json();
        expect(responseBody).toMatchObject({
            "statusCode": 400,
            "message": `Token address validation failed:  should be a valid hex string, : ${INVALID_ADDRESS}`,
            "error": "Bad Request"
            }
        );
    });

    test('Invalid chainId request to token endpoint', async ({ request }) => {
        // Send GET request to the API endpoint with invalid chainId
        const invalidURL = `${BASE_URL}/v1.2/${INVALID_CHAIN_ID}/custom/${VALID_ADDRESS}`
        const response = await request.get(
            invalidURL,
            {
                headers: {
                Authorization: `Bearer ${API_KEY}`,
                },
            }
            );
        expect(response.status()).toBe(404);
    
        const responseBody = await response.json();
        expect(responseBody).toMatchObject({
            "statusCode": 404,
            "message": `${INVALID_CHAIN_ID} is invalid chain id`,
            "error": "Not Found"
            }
        );
    });
});
