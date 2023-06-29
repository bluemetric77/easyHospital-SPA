const routes = [
  {
    path: '/auth',
    component: () => import('layouts/Login.vue'),
    children: [{ path: '', component: () => import('pages/auth/Index.vue') }]
  },
  {
    path: '/',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/access',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'user',
        name: 'user',
        component: () => import('pages/config/User.vue')
      },
      {
        path: 'useraccess',
        component: () => import('pages/config/Useraccess.vue')
      }
    ]
  },
  {
    path: '/setup',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'clinic',
        name: 'clinic',
        component: () => import('pages/setup/Clinic.vue')
      },
      {
        path: 'igd',
        name: 'igd',
        component: () => import('pages/setup/IGD.vue')
      },
      {
        path: 'diagnostic',
        name: 'diagnostic',
        component: () => import('pages/setup/Diagnostic.vue')
      },
      {
        path: 'pharmacy',
        name: 'pharmacy',
        component: () => import('pages/setup/Pharmacy.vue')
      },
      {
        path: 'medicalcheckup',
        name: 'mcu',
        component: () => import('pages/setup/MedicalCheckup.vue')
      },
      {
        path: 'inpatient',
        name: 'inpatient',
        component: () => import('pages/setup/Inpatient.vue')
      },
      {
        path: 'class',
        name: 'class',
        component: () => import('pages/setup/ServiceClass.vue')
      },
      {
        path: 'ward',
        name: 'ward',
        component: () => import('pages/setup/Ward.vue')
      },
      {
        path: 'rooms',
        name: 'rooms',
        component: () => import('pages/setup/WardRooms.vue')
      },
      {
        path: 'pricelevel',
        name: 'pricelevel',
        component: () => import('pages/setup/PriceLevel.vue')
      },
      {
        path: 'paramedic',
        name: 'paramedic',
        component: () => import('pages/setup/Paramedic.vue')
      },
      {
        path: 'paramedic-group',
        name: 'paramedic-group',
        component: () => import('pages/setup/ParamedicGroup.vue')
      },
      {
        path: 'specialist',
        name: 'specialist',
        component: () => import('pages/setup/ParamedicSpecialist.vue')
      },
      {
        path: 'application/standard-code',
        name: 'standardcode',
        component: () => import('pages/setup/application/StandardCode.vue')
      },
      {
        path: 'application/parameters',
        name: 'parameters',
        component: () => import('pages/setup/application/Parameters.vue')
      }
    ]
  },

  {
    path: '/master',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'inventory/warehouse',
        name: 'warehouse',
        component: () => import('pages/master/inventory/Warehouse.vue')
      },
      {
        path: 'inventory/mou',
        name: 'mou',
        component: () => import('pages/master/inventory/MOU.vue')
      },
      {
        path: 'inventory/inventory-group',
        name: 'items-groups',
        component: () => import('pages/master/inventory/InventoryGroups.vue')
      },
      {
        path: 'inventory/manufactur',
        name: 'manufactur',
        component: () => import('pages/master/inventory/Manufactur.vue')
      },
      {
        path: 'inventory/supplier',
        name: 'supplier',
        component: () => import('pages/master/inventory/Supplier.vue')
      },
      {
        path: 'inventory/items-medical',
        name: 'items-medical',
        component: () => import('pages/master/inventory/Items.vue')
      },
      {
        path: 'inventory/items-general',
        name: 'items-general',
        component: () => import('pages/master/inventory/ItemsNonMedical.vue')
      },
      {
        path: 'inventory/items-kitchen',
        name: 'items-kitchen',
        component: () => import('pages/master/inventory/ItemsKitchen.vue')
      }
    ]
  },

  {
    path: '/customer-service',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'customer-price',
        name: 'customer-price',
        component: () => import('pages/cs/CustomerPrice.vue')
      },
      {
        path: 'order',
        name: 'item_group',
        component: () => import('pages/cs/CustomerOrder.vue')
      }
    ]
  },
  {
    path: '/inventory',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'purchase/order',
        name: 'purchase_order',
        component: () => import('pages/inventory/PurchaseOrder.vue')
      },
      {
        path: 'purchase/receive',
        name: 'purchase_receive',
        component: () => import('pages/inventory/Purchase.vue')
      },
      {
        path: 'purchase/receive/credit',
        name: 'purchase_receive_credit',
        component: () => import('pages/inventory/PurchaseCN.vue')
      }
    ]
  },
  {
    path: '/operational',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'work-order',
        name: 'work-order',
        component: () => import('pages/operation/Operation.vue')
      },
      {
        path: 'monitoring-unit',
        name: 'monitoring-unit',
        component: () => import('pages/operation/MonitoringUnit.vue')
      },
      {
        path: 'map',
        name: 'maps',
        component: () => import('pages/operation/MapView.vue')
      },
      {
        path: 'work-order/lbo',
        name: 'lbo',
        component: () => import('pages/operation/OperationLBO.vue')
      },
      {
        path: 'work-order/closed-lbo',
        name: 'closed-lbo',
        component: () => import('pages/operation/OperationClosedLBO.vue')
      }
    ]
  },
  {
    path: '/accounting',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'general',
        name: 'journal',
        component: () => import('pages/accounting/Journal.vue')
      },
      //{ path: 'inquery', component: () => import('pages/accounting/Inquery.vue') },
      {
        path: 'gl',
        name: 'gl',
        component: () => import('pages/accounting/GeneralLedger.vue')
      }
      //{ path: 'mutation', component: () => import('pages/accounting/Mutation.vue') }
    ]
  },
  {
    path: '/finance',
    meta: { auth: true },
    component: () => import('layouts/Home.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'cash-bank',
        name: 'cash-bank',
        component: () => import('pages/finance/CashBank.vue')
      },
      {
        path: 'cash-bank/ujo',
        name: 'ujo',
        component: () => import('pages/finance/CashierUJO.vue')
      },
      {
        path: 'cash-bank/droping',
        name: 'droping',
        component: () => import('pages/finance/Droping.vue')
      },
      {
        path: 'cash-bank/receive-droping',
        name: 'receive-droping',
        component: () => import('pages/finance/Receiving.vue')
      },
      {
        path: 'cash-bank/transaction-out',
        name: 'cashbankout',
        component: () => import('pages/finance/CashBankOUT.vue')
      },
      {
        path: 'cash-bank/transaction-in',
        name: 'cashbankin',
        component: () => import('pages/finance/CashBankIN.vue')
      },
      {
        path: 'ujo',
        name: 'ujo-list',
        component: () => import('pages/finance/OperationUJO.vue')
      },
      {
        path: 'cash-bank/mutation',
        name: 'mutation',
        component: () => import('pages/finance/CashBankMutation.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/not-allowed',
    component: () => import('pages/Error401.vue')
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
