import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../../utils/stripe'

import { saveSubscription } from '../../utils/manageSubscription'

class WebHooksController {
    async handle(request: Request, response: Response){
        let event:Stripe.Event = request.body;

        const signature = request.headers['stripe-signature']
        let endpointSecret = 'whsec_94fb092ddd95b3a84f9f96961ae1c04656a46169a09dde7408659f6657e731f4';
            
            try{
                event = stripe.webhooks.constructEvent( request.body, signature, endpointSecret )
            }catch(err){
                return response.status(400).send(`Webhook error: ${err.message} ` )
            }
        

        switch(event.type){
            case 'customer.subscription.deleted':
                // Caso ele cancele a sua assinatura, iremos deletar a assinatura dele
                const payment = event.data.object as Stripe.Subscription;

                await saveSubscription(
                    payment.id,
                    payment.customer.toString(),
                    false,
                    true
                )

                break;
                case 'customer.subscription.updated':
                    // Caso tenha alguma atualizacao na assinatura
                    const paymentIntent = event.data.object as Stripe.Subscription;

                    await saveSubscription(
                        paymentIntent.id,
                        paymentIntent.customer.toString(),
                        false
                    )

                    break;
                    case 'checkout.session.completed':
                        // Criar a assinatura por que foi pago com sucesso
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;

                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true,

                        )
                        break;
                        default:
                            console.log(`Evento desconhecido ${event.type}`)
        }

        response.send();


    }
}

export { WebHooksController }