const {
  RequestManager,
  HTTPTransport,
  Client,
} = require("@open-rpc/client-js");
const CasperSDK = require("casper-js-sdk");
const { CasperServiceByJsonRPC } = CasperSDK;

class ExtendedCasperService extends CasperServiceByJsonRPC {
  constructor(provider) {
    super(provider);
    let transport;
    if (typeof provider === "string") {
      transport = new HTTPTransport(provider);
    } else {
      transport = new ProviderTransport(provider);
    }

    const requestManager = new RequestManager([transport]);
    this.client = new Client(requestManager);
  }

  async getBlockInfo(blockHashBase16, timeout) {
    return await this.client
      .request(
        {
          method: "chain_get_block",
          params: {
            block_identifier: {
              Hash: blockHashBase16,
            },
          },
        },
        timeout
      )
      .then((res) => {
        if (
          res.block !== null &&
          res.block.hash.toLowerCase() !== blockHashBase16.toLowerCase()
        ) {
          throw new Error("Returned block does not have a matching hash.");
        }
        return res;
      });
  }

  async getBlockInfoByHeight(height, timeout) {
    return await this.client
      .request(
        {
          method: "chain_get_block",
          params: {
            block_identifier: {
              Height: height,
            },
          },
        },
        timeout
      )
      .then((res) => {
        if (res.block !== null && res.block.header.height !== height) {
          throw new Error("Returned block does not have a matching height.");
        }
        return res;
      });
  }

  async getLatestBlockInfo(timeout) {
    return await this.client.request(
      {
        method: "chain_get_block",
      },
      timeout
    );
  }

  async getDeployInfo(deployHashBase16, timeout) {
    return await this.client.request(
      {
        method: "info_get_deploy",
        params: {
          deploy_hash: deployHashBase16,
        },
      },
      timeout
    );
  }
}

module.exports = { ExtendedCasperService };
