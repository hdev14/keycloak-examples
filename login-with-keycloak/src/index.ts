

import Server from './Server';

require('dotenv').config();

(async function main() {
  const server = new Server();

  server.application.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on ${process.env.SERVER_URL}`);
  })
})();
