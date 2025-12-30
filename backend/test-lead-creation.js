import { Lead } from './src/models/sequelize/index.js';

async function testLeadCreation() {
    try {
        console.log('Testing lead creation...');
        
        const testData = {
            firstName: 'Test',
            lastName: 'Lead',
            email: 'test@example.com',
            phone: '1234567890',
            company: 'Test Company',
            position: 'Manager',
            source: 'website',
            status: 'new',
            priority: 'medium',
            description: 'Test lead description',
            tags: ['hot lead', 'enterprise'],
            estimatedValue: 5000.00,
            expectedCloseDate: '2025-01-15',
            assignedTo: null,
            createdBy: null // This should be allowed now
        };

        const lead = await Lead.create(testData);
        console.log('✅ Lead created successfully:', lead.toJSON());
        
    } catch (error) {
        console.error('❌ Error creating lead:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
    }
}

testLeadCreation();