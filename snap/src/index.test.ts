import { expect } from '@jest/globals'
import { installSnap } from '@metamask/snaps-jest'
import { panel, text } from '@metamask/snaps-ui'
import { assert } from '@metamask/utils'

let apiKey = 'tJueY6TkWt9ikGWy4zZvAZndSL4M4bBx'

console.error = (message) => {
  //    throw new Error(message);
}

describe('onRpcRequest', () => {
  it('adds api key to snap', async () => {
    const { request, close, mock } = await installSnap()
    const { unmock } = await mock({
      response: {
        status: 200,
        body: 'true',
      },
      url: 'https://snap-api.anchainai.com',
    })
    const response = request({
      origin: 'http://localhost:8080',
      method: 'store',
      params: { apiKey },
    })

    const ui = await response.getInterface()
    expect(ui).toRender(
      panel([
        text('API Key stored successfully'),
        text(
          '"http://localhost:8080" has successfully stored a valid api key in your local metamask storage',
        ),
      ]),
    )
    await ui.ok()
    expect(await response).toRespondWith(null)
    await close()
  })
})

describe('onTransaction', () => {
  it('returns bei risk score for transaction to address', async () => {
    const { sendTransaction, close } = await installSnap()

    const response = await sendTransaction({
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data:
        '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    })

    await close()
  })
})
