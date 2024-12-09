import { test, expect } from '@playwright/test';
import { testData } from './test-data';

test.describe('Wallet connection and balance validation', () => {

  test('Connect wallet and validate balance', async ({ page }) => {
    const { wallet } = testData;
    // Step 1: Open the URL and accept cookies, click "I agree"
    await page.goto('https://portfolio.1inch.io/');
    await page.locator('text=I agree').click();

    // Step 2: Click on "Connect wallet" in the header
    await page.locator('.bundles-list-wrap button').click();

    // Step 3: Type ENS wallet address "vitalik.eth" in the opened form
    await page.locator('input[placeholder="Add address or domain"]').fill(wallet.ensAddress);
    
    // Step 4-5: Validate request and response to ENS lookup endpoint after clicking "+" button
    const addButton = page.locator('button[class="add-button"]');
    const [_, lookupResponse] = await Promise.all([
        page.waitForRequest(request => 
        request.url().includes(wallet.lookupUrl)
        ),
        page.waitForResponse(response => 
        response.url().includes('name=' + wallet.ensAddress) && 
        response.status() === 200
        ),
        // Click "+" button action that sends the request
        addButton.click(),
    ]);
    // Check response body
    const responseBody = await lookupResponse.json();
    expect(responseBody).toEqual(wallet.expectedLookupResponse);
  
    // Step 6: Check current value request and save the USD balance
    const currentValueResponse = await page.waitForResponse(response =>
        response.url().includes(wallet.currentValueUrl) &&
        response.status() === 200
    );
    const currentValueResponseBody = await currentValueResponse.json();
    // Extract "value_usd" value from JSON
    const valueUsd = currentValueResponseBody.result[0]?.value_usd;

    // Step 7: Check wallet was added successfully in the header
    const walletHeader = page.locator('.bundles-list-wrap').getByText(wallet.ensAddress)
    await expect(walletHeader).toBeVisible();

    // Step 8: Press dropdown button
    await walletHeader.click();

    // Step 9: Validate wallet is added to the list and balance matches
    const walletInList = page.locator('.account-option-content .account-option-name');
    const balanceInList = page.locator('.account-option-content .account-option-value');
    await expect(walletInList).toHaveText(wallet.ensAddress);
    await expect(balanceInList).toHaveText(wallet.balance);

    const displayedBalance = await balanceInList.textContent();
    const formattedBalance = parseFloat(displayedBalance!.replace(/[^0-9.]/g, ''));
    const roundedValueUsd = Math.round(valueUsd)

    expect(formattedBalance).toBeCloseTo(roundedValueUsd, 2);
  });

});
