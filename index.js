const express = require('express')
const axios = require('axios')
//axios.defaults.timeout = 3000

axios.interceptors.response.use(undefined, (err) => {
  const { config, message } = err
  if (!config || !config.retry) {
    return Promise.reject(err)
  }
  // retry while Network timeout or Network Error
  if (!(message.includes('timeout') || message.includes('Network Error'))) {
    return Promise.reject(err)
  }
  config.retry -= 1
  const delayRetryRequest = new Promise((resolve) => {
    setTimeout(() => {
      console.log('retry the request')
      resolve()
    }, config.retryDelay || 1000)
  })
  return delayRetryRequest.then(() => axios(config))
})

const app = express()
const port = 8081

app.get('/', async (req, res) => {
  const response = await axios.get(
    `https://webhook.site/3f0747a2-379e-426a-808f-5d9b42592524`,
    { retry: 3, retryDelay: 1000 }
  )
  if (response.status) {
    console.log('success')
    res.send(response)
  } else {
    console.log('Failed to get response from getTokenInfoByContractAddress()')
    res.send(response)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
