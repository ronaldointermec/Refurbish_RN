import { ShippingCourier } from './shippingCourier'
import { ShippingInvoice } from './shippingInvoice'

export class ShippingRequest {
    ShippingCourier: ShippingCourier
    Invoices: Array<ShippingInvoice>
}
