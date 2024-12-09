export const testData = {
    wallet: {
      ensAddress: 'vitalik.eth',
      lookupUrl: 'https://domains.1inch.io/v2.0/lookup?name=vitalik.eth',
      expectedLookupResponse: {
        result: [
          {
            protocol: 'ENS',
            address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
            checkUrl: 'https://app.ens.domains/vitalik.eth'
          }
        ]
      },
      currentValueUrl: 'https://portfolio-api.1inch.io/portfolio/v4/general/current_value?addresses=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&use_cache=true',
      // balance: '$6 571 370',
      balance: '$6 425 729',
    }
  };
  