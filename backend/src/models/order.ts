import Type, { type Static } from "typebox"

// ------------------ Informações relacionadas aos status ------------------
const ApprovedData = Type.Object({
  approvedBy: Type.String(),
  approvedOn: Type.String({ format: 'date-time' })
})

const RejectedData = Type.Object({
  rejectedBy: Type.String(),
  rejectedOn: Type.String({ format: 'date-time' }),
  reason: Type.String(),
})

const PaymentData = Type.Intersect([
  ApprovedData,
  Type.Object({
    paymentConfirmedBy: Type.String(),
    paymentConfirmedOn: Type.String({ format: 'date-time' }),
  })
])

const LoadedData = Type.Intersect([
  PaymentData,
  Type.Object({
    loadedBy: Type.String(),
    loadedAt: Type.String({ format: 'date-time' }),
    routeId: Type.String(),
  })
])

const ArrivedData = Type.Intersect([
  LoadedData,
  Type.Object({
    arrivedOn: Type.String({ format: 'date-time' }),
  }),
])

const AccidentData = Type.Intersect([
  LoadedData,
  Type.Object({
    accidentOn: Type.String({ format: 'date-time' }),
    accidentDescription: Type.String(),
  }),
])

const ResolvedAccidentData = Type.Intersect([
  AccidentData,
  Type.Object({
    resolvedOn: Type.String({ format: 'date-time' }),
    resolvedBy: Type.String(),
    resolutionDescription: Type.String(),
  }),
])

const OrderStatusSchema = Type.Union([
  // Pedido recém criado precisa de aprovação de um operador.
  Type.Object({ status: Type.Literal('pendingApproval') }),

  // Pedido aprovado pelo operador, fica aguardando o pagamento pelo atendente.
  Type.Intersect([
    Type.Object({ status: Type.Literal('waitingPayment') }),
    ApprovedData,
  ]),

  // Pedido rejeitado por um operador.
  Type.Intersect([
    Type.Object({ status: Type.Literal('rejected') }),
    RejectedData,
  ]),

  // Pedido com pagamento confirmado, está esperando ser atribuído a um motorista
  // e um veículo pelo operador.
  Type.Intersect([
    Type.Object({ status: Type.Literal('inPreparation') }),
    PaymentData,
  ]),

  // Pedido atribuido a um motorista e um veículo, está esperando liberação para
  // envio por parte do operador.
  Type.Intersect([
    Type.Object({ status: Type.Literal('loaded') }),
    LoadedData,
  ]),

  // Pedido liberado para entrega pelo operador. Esperando o motorista começar o
  // envio.
  Type.Intersect([
    Type.Object({ status: Type.Literal('waitingDispatch') }),
    LoadedData,
  ]),

  // Pedido que teve sua entrega iniciada pelo motorista e está em rota de entrega.
  Type.Intersect([
    Type.Object({ status: Type.Literal('onRoute') }),
    LoadedData,
  ]),

  // Pedido entregue com sucesso.
  Type.Intersect([
    Type.Object({ status: Type.Literal('arrived') }),
    ArrivedData,
  ]),

  // Pedido que sofreu um acidente durante a entrega, esperando ter o problema
  // resolvido por um gerente.
  Type.Intersect([
    Type.Object({ status: Type.Literal('accident') }),
    AccidentData,
  ]),

  // Pedido que teve o seu acidente resolvido por um gerente.
  Type.Intersect([
    Type.Object({ status: Type.Literal('resolvedAccident') }),
    ResolvedAccidentData,
  ]),
])

const CancellableOrderStatusSchema = Type.Union([
  OrderStatusSchema,
  Type.Object({
    status: Type.Literal('cancelled'),
    previousStatus: OrderStatusSchema,
    cancelledBy: Type.String(),
    cancelledOn: Type.String({ format: 'date-time' }),
    cancellationReason: Type.String(),
  })
])

// --------------- Schema do pedido ---------------
export const OrderSchema = Type.Intersect([
  Type.Object({
    // Id do pedido é autoincrementado.
    id: Type.Integer({ minimum: 1 }),
    description: Type.String(),
    destination: Type.String(),

    createdOn: Type.String({ format: "date-time" }),
    createdBy: Type.String(),

    // Nome do cliente ou razão social.
    clientName: Type.String(),
    clientRegistration: Type.Union([
      Type.String({ minLength: 11, maxLength: 11 }), // CPF ou
      Type.String({ minLength: 14, maxLength: 14 }), // CNPJ
    ]),

    weight: Type.Number({ minimum: 0 }),
    volume: Type.Number({ minimum: 0 }),

    // Licenças necessárias para entregar o pedido.
    licenses: Type.Array(Type.String()),

    // Valor dos itens sendo enviados.
    value: Type.Number({ minimum: 0 }),

    // Preço pago pelo cliente para o envio.
    shipmentPrice: Type.Number({ minimum: 0 }),
  }),

  // Status do pedido, se for cancelado, ele armazena também o status anterior
  // ao cancelamento.
  CancellableOrderStatusSchema,
])

const OrderCreationSchema = Type.Omit(OrderSchema, Type.Union([
  Type.Literal('status'),
  Type.Literal('id'),
  Type.Literal('createdOn'),
  Type.Literal('createdBy'),
]))

export type Order = Static<typeof OrderSchema>
export type OrderCreationPayload = Static<typeof OrderCreationSchema>
export type CancellableOrderStatus = Static<typeof CancellableOrderStatusSchema>
export type OrderStatus = Static<typeof OrderStatusSchema>
