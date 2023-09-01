import { expect } from '@jest/globals'
import { installSnap } from '@metamask/snaps-jest'
import { panel, text } from '@metamask/snaps-ui'
import { assert } from '@metamask/utils'

let apiKey = 'tJueY6TkWt9ikGWy4zZvAZndSL4M4bBx'

console.error = message => {
  //    throw new Error(message);
      };

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
    console.log(ui)
    assert(ui.type == "alert")
    await ui.ok()
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
