import { expect } from '@jest/globals'
import { installSnap } from '@metamask/snaps-jest'
import { panel, text } from '@metamask/snaps-ui'
import { assert } from '@metamask/utils'

let apiKey = 'tJueY6TkWt9ikGWy4zZvAZndSL4M4bBx'

describe('onRpcRequest', () => {
  it('adds api key to snap', async () => {
    const { request, close } = await installSnap("npm:web3-security-snap")
    const response =  await request({
      origin: 'http://localhost:8080',
      method: 'store',
      params: { apiKey },
    })
    console.log(JSON.stringify(response))

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
