const { Payment } = require('mercadopago');
const FridayEventNames = require('../models/FridayEventNames');
const SaturdayEventNames = require('../models/SaturdayEventNames');

const client = new Payment({ 
    accessToken: 'APP_USR-989532226432155-062714-375897960b82a7720c062e7bace7217c-207739849'
});

const handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('Webhook recebido:', JSON.stringify(event, null, 2)); // Log detalhado do webhook recebido

        if (event.type === 'payment' && event.action === 'payment.created') {
            const paymentId = event.data.id;
            const paymentInfo = await client.get(paymentId);
            
            const status = paymentInfo.body.status;
            const metadata = paymentInfo.body.metadata;
            const names = metadata.names;
            const day = metadata.day;
            
            // Atualizar o status do pagamento e adicionar nomes ao evento correspondente
            if (status === 'approved') {
                await addNamesToEvent(day, names);
                console.log(`Pagamento aprovado: ${paymentId}, Nomes adicionados: ${names}`);
            } else {
                console.log(`Pagamento não aprovado: ${paymentId}, Status: ${status}`);
            }

            res.sendStatus(200);
        } else {
            console.log('Tipo de evento não tratado:', event.type, event.action);
            res.sendStatus(400);
        }
    } catch (error) {
        console.error('Erro ao processar a notificação do webhook:', error);
        res.sendStatus(500);
    }
};

// Função para adicionar nomes ao evento no banco de dados
async function addNamesToEvent(day, names) {
    let eventNames;
    if (day === 'friday') {
        eventNames = await FridayEventNames.findOne();
        if (!eventNames) {
            eventNames = new FridayEventNames({ names: [] });
        }
    } else if (day === 'saturday') {
        eventNames = await SaturdayEventNames.findOne();
        if (!eventNames) {
            eventNames = new SaturdayEventNames({ names: [] });
        }
    }

    if (eventNames) {
        eventNames.names.push(...names);
        await eventNames.save();
    }
}

module.exports = {
    handleWebhook
};
