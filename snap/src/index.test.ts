import { expect } from '@jest/globals'
import { installSnap } from '@metamask/snaps-jest'
import { panel, text } from '@metamask/snaps-ui'
import { assert } from '@metamask/utils'

let apiKey = 'tJueY6TkWt9ikGWy4zZvAZndSL4M4bBx'


describe('onRpcRequest', () => {
  it('adds api key to snap', async () => {
    const { request, close, mock } = await installSnap()
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
    const { request, close, sendTransaction } = await installSnap()
    const rpcResponse = request({
      origin: 'http://localhost:8080',
      method: 'store',
      params: { apiKey },
    })

    const ui = await rpcResponse.getInterface()
    expect(ui).toRender(
      panel([
        text('API Key stored successfully'),
        text(
          '"http://localhost:8080" has successfully stored a valid api key in your local metamask storage',
        ),
      ]),
    )
    await ui.ok()
    expect(await rpcResponse).toRespondWith(null)

    const response = await sendTransaction({
      })

    console.log(response.content)
    expect(response).not.toRespondWithError(null);


    await close()
  })
})
