const { Gateway } = require("../../generic/models/gatewayModel")
async function addGateway(tx)
{
    const newGateway = new Gateway(tx);
    
    // Save the transaction
    const updated = await newGateway.save()
        .catch(error => {
            console.error('Error:', error);
        });
        return updated
}

module.exports={
    addGateway
}