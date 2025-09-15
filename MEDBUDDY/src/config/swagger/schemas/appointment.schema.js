const appointmentSchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            description: 'Title of the appointment'
        },
        hospital: {
            type: 'string',
            description: 'Hospital name'
        },
        location: {
            type: 'string',
            description: 'Location of the appointment'
        },
        date: {
            type: 'string',
            format: 'date',
            description: 'Date of the appointment'
        },
        time: {
            type: 'string',
            description: 'Time of the appointment'
        },
        notes: {
            type: 'string',
            description: 'Additional notes for the appointment'
        },
        userId: {
            type: 'string',
            description: 'ID of the user who created the appointment'
        }
    },
    required: ['title', 'hospital', 'date', 'time', 'userId']
};

module.exports = appointmentSchema;
