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
/**
 * this works (pass tsc)
 */
export const productionRepository = new Repository({
  getTenant: client.models.Tenant.get,
})
/**
 * this cause `TS2322` error (tsc failed)
 * ```
 * src/data.ts:62:33 - error TS2322: Type 'Promise<{ data: { id: string; name: string; }; }>' is not assignable to type 'SingularReturnValue<Prettify<ReturnValue<ClientModel<{ Tenant: ClientModel<..., SchemaMetadata<ModelSchema<SetTypeSubArg<{ types: { Tenant: ModelType<{ fields: { name: ModelField<string, "required", undefined>; }; identifier: ModelDefaultIdentifier; secondaryIndexes: []; authorization: []; disabledOperations: []; },...'.
  Type '{ data: { id: string; name: string; }; }' is not assignable to type '{ data: Prettify<ReturnValue<ClientModel<{ Tenant: ClientModel<..., SchemaMetadata<ModelSchema<SetTypeSubArg<{ types: { Tenant: ModelType<{ fields: { name: ModelField<string, "required", undefined>; }; identifier: ModelDefaultIdentifier; secondaryIndexes: []; authorization: []; disabledOperations: []; }, never>; }; ...'.
    Types of property 'data' are incompatible.
      Type '{ id: string; name: string; }' is not assignable to type 'Prettify<ReturnValue<ClientModel<{ Tenant: ClientModel<..., SchemaMetadata<ModelSchema<SetTypeSubArg<{ types: { Tenant: ModelType<{ fields: { name: ModelField<string, "required", undefined>; }; identifier: ModelDefaultIdentifier; secondaryIndexes: []; authorization: []; disabledOperations: []; }, never>; }; authoriz...'.

 62   getTenant: async (...args) => ({
                                    ~~
 63     data: {
    ~~~~~~~~~~~
... 
 70     },
    ~~~~~~
 71   }),
    ~~~~

  node_modules/@aws-amplify/data-schema/dist/esm/runtime/client/index.d.ts:318:5
    318     get<SelectionSet extends ReadonlyArray<ModelPath<FlatModel>> = never[]>(identifier: Model['identifier'], options?: {
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    319         selectionSet?: SelectionSet;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ... 
    322         headers?: CustomHeaders;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    323     }): SingularReturnValue<Prettify<ReturnValue<Model, FlatModel, SelectionSet>>>;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from the return type of this signature.
  Found 1 error in src/data.ts:62
 * ```
 * 
 */
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
