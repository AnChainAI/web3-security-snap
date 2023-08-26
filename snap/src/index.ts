import { OnRpcRequestHandler, OnTransactionHandler, } from '@metamask/snaps-types'
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui'

const endpoint = 'https://snap-api.anchainai.com/graphql'
const validateQuery = ` query ValidateApiKey($data: FindOneApiKey!) { validateApiKey(data: $data) }`
const riskScoreQuery = `query RiskScore($data: RiskScoreInput!) {
  riskScore(data: $data) {
    status
    error
    address
    risk {
      explanation
      emoji
      level
      score
    }
    self {
      reasons
      detail
    }
    data
  }
}`

const setApiKey = async (apiKey: string | null) => {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { BEIKey: apiKey },
    },
  })
}

const validateApiKey = async (apiKey: string | null) => {
  let valid = false
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: validateQuery,
      variables: { data: { key: apiKey } }
    }),
  })
    .then((response) => response.text())
    .then((body) => {
      // Process the fetched data here
      let b = JSON.parse(body)
      valid = b.data.validateApiKey
    })
    .catch((error) => {
      throw new Error(error+ ' ' + endpoint)
    })
  return valid
}

const displayAlert = async (error: string, explanation: string) => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([heading(error), text(explanation)]),
    },
  })
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'store':
      if (
        request.params &&
        'apiKey' in request.params &&
        typeof request.params.apiKey === 'string'
      ) {
        const validKey = await validateApiKey(request.params.apiKey)
        if (validKey) {
          await setApiKey(request.params.apiKey)
        } else {
          await displayAlert(
            'Invalid API Key',
            'The API Key attempted to be stored is invalid. Please try again.',
          )
          
        }
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`API Key stored successfully`),
              text(
                JSON.stringify(origin) +
                  ' has successfully stored a valid api key in your local metamask storage',
              ),
            ]),
          },
        })
      }

      throw new Error('Must provide params.apiKey.')

    case 'fetchKey':
      const persistedData = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      })
      if (
        persistedData == null ||
        !persistedData.hasOwnProperty('BEIKey') ||
        persistedData.BEIKey == null
      ) {
        return false
      }
      return true

    default:
      throw new Error('Method not found.')
  }
}

export const onTransaction: OnTransactionHandler = async ({
  transactionOrigin,
  transaction,
  chainId,
}) => {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })
  if (
    persistedData == null ||
    !persistedData.hasOwnProperty('BEIKey') ||
    persistedData.BEIKey == null
  ) {
    return {
      type: 'alert',
      content: panel([
        heading('Add Api Key'),
        text(
          'Please Visit https://snap.anchainai.com/ to register your account',
        ),
        copyable('https://snap.anchainai.com/'),
      ]),
    }
  }
  let b = {}
  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': persistedData.BEIKey.toString(),
    },
    body: JSON.stringify({
      query: riskScoreQuery,
      variables: {
        data: {
          from: transaction.from,
          address: transaction.to,
          chainId: chainId,
        },
      },
    }),
  })
    .then((response) => response.text())
    .then((body) => {
      b = JSON.parse(body)
      if(b.errors && b.errors.length != 0 ){
        throw new Error(JSON.stringify(b.errors.map((e: any) => e.message)))
      }
    })
    .catch((error) => {
      throw new Error(error + ' Visit: snap.anchainai.com')
    })
  let ret = [ text('BEI Risk Score for: **' + b.data.riskScore.address + '**'), text(''), text('Score'), text('') ]
  let scoreString = b.data.riskScore.risk.score + ' ' + b.data.riskScore.risk.emoji
  let scoreExplanation = ' ' + b.data.riskScore.risk.explanation
  ret.push(heading(scoreString))
  ret.push(text(scoreExplanation))

  if ( b.data.riskScore.category && b.data.riskScore.category.length != 1 && b.data.riskScore.category[0] != 'unaffiliated' ) {
    ret.push(text('**Reason:** ' + b.data.riskScore.category.join(', ')))
    ret.push(text('**Detail:** ' + b.data.riskScore.detail.join(', ')))
  }
  return {
    content: panel([...ret, divider(),text('Feel like this score is wrong?  Help make Web3 safer by reporting here:'), copyable('https://web3guard.io/'), divider(),text('Powered by AnChain.AI'), copyable('https://anchain.ai')]),
  }
}
