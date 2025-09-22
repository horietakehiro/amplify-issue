import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { generateClient } from "aws-amplify/api";
import { Schema } from "./data.ts";

Amplify.configure(outputs);
const client = generateClient<Schema>();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App
      client={{
        getTenant: client.models.Tenant.get,
        // createUser: client.models.User.create,
        // createTodo: client.models.Todo.create,
      }}
    />
  </React.StrictMode>
);
