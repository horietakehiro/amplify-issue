import { useEffect, useState } from "react";
import { IClient, Schema } from "./data";

function App(props: {client: IClient}) {
  const [tenant, setTenant] = useState<Schema["Tenant"]["type"] | undefined>(undefined)
  useEffect(() => {
    const f = async () => {
      // const tenants = await client.models.Tenant.list()
      const res = await props.client.getTenant({
        id: ""
      })
      setTenant(res.data!)
    }
    f()
  }, []);

  return (
    <main>
      <h1>My Tenants</h1>
      <div>
        {tenant?.name}
      </div>
    </main>
  );
}

export default App;
