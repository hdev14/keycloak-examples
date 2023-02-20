
require('dotenv').config();

import Server from './Server';

(async function main() {
  const server = new Server();

  server.application.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on ${process.env.SERVER_URL}`);
  })
})();
