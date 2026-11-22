import type { Route, User, Order } from "@/generated/prisma/client.ts"

// Extensão de tipo para que o Request guarde o contexto da autenticação.
declare global {
  namespace Express {
    interface Request {
      user?: User;
      order?: Order;
      route?: Route;
    }
  }
}
