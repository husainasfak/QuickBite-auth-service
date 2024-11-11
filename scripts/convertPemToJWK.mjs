import fs from 'fs'

import rsaPemToJWK from 'rsa-pem-to-jwk'

const privateKey = fs.readFileSync('./certs/private.pem')

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const jwk = rsaPemToJWK(privateKey, { use: 'sig' }, 'public')

return jwk
// console.log(JSON.stringify(jwk))
