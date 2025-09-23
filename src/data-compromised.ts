import { generateClient } from "aws-amplify/api";
import { type ClientSchema, a } from "@aws-amplify/backend";
import type {
  ListReturnValue,
  SingularReturnValue,
} from "@aws-amplify/data-schema/runtime";
/**
 * Compromised custom SingularFn
 * **must exclude `selectionSet` option because it may caus some tsc errors and take very heavy load on tsc in some(complex) data models**
 */
type SingularFn<
  Fn extends (props: any, options?: { selectionSet?: any }) => any,
  Type,
  Props = Parameters<Fn>[0],
  Options = Parameters<Fn>[1],
> = (
  props: Props,
  options?: Options extends undefined
    ? undefined
    : Omit<Options, "selectionSet"> //& { selectionSet?: readonly never[] }
) => SingularReturnValue<Type>;
/**
 * Compromised LitFn
 * **must exclude `selectionSet` option because it may caus some tsc errors and take very heavy load on tsc in some(complex) data models**
 */
type ListFn<
  Fn extends (options?: { selectionSet?: any }) => any,
  Type,
  Options = Parameters<Fn>[0],
> = (
  options?: Options extends undefined
    ? undefined
    : Omit<Options, "selectionSet">
) => ListReturnValue<Type>;

const schema = a
  .schema({
    Tenant: a.model({
      name: a.string().required(),
      users: a.hasMany("User", "TenantId")
    }),
    User: a.model({
      name: a.string(),
      tenantId: a.id().required(),
      tenant: a.belongsTo("Tenant", "tenantId")
    })
  })
  .authorization((allow) => allow.publicApiKey());

export type Schema = ClientSchema<typeof schema>;
type Client = ReturnType<typeof generateClient<Schema>>;
// define an interface of amplify data client
export interface IClient {
  getTenant: SingularFn<Client["models"]["Tenant"]["get"], Schema["Tenant"]["type"]>;
  listTenants: ListFn<Client["models"]["Tenant"]["list"], Schema["Tenant"]["type"]>
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
/**
 * this works (pass tsc)
 */
export const productionRepository = new Repository({
  getTenant: client.models.Tenant.get,
  listTenants: client.models.Tenant.list,
})
/**
 * this no longer cause errors (pass tsc)
 */
export const dummyRepository = new Repository({
  listTenants: async (...args) => ({
    data: []
  }),
  getTenant: async (...args) => ({
    data: {
      id: args[0].id,
      name: "test-name",
      createdAt: "", updatedAt: "",
      users: () => {throw Error()}
    }
  })
})

const res = await dummyRepository.getTenant("")
res.name