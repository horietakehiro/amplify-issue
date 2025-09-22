import { generateClient } from "aws-amplify/api";
import { type ClientSchema, a } from "@aws-amplify/backend";

const schema = a
  .schema({
    Tenant: a.model({
      name: a.string().required(),
    }),
  })
  .authorization((allow) => allow.publicApiKey());

export type Schema = ClientSchema<typeof schema>;
type Client = ReturnType<typeof generateClient<Schema>>;
// define an interface of amplify data client
export interface IClient {
  getTenant: Client["models"]["Tenant"]["get"];
}
export class Repository {
  client: IClient;
  constructor(client: IClient) {
    this.client = client;
  }
  getTenant = async (id: string): Promise<Schema["Tenant"]["type"]> => {
    const res = await this.client.getTenant({ id });
    if (res.data === null) {
      throw Error("failed");
    }
    return res.data;
  };
}
const client = generateClient<Schema>();
// repository for production 
export const productionRepository = new Repository({
  getTenant: client.models.Tenant.get,
})
// repository for tests
export const dummyRepository = new Repository({
  getTenant: async (...args) => ({
    data: {
      id: args[0].id,
      name: "test-name",
      // createdAt: new Date().toString(),
      // updatedAt: new Date().toString(),
      // status: "active",
      // users: async () => ({ data: [] }),
    },
  }),
})
