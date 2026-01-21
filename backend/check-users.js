import { User } from './src/models/index.js';

async function checkUsers() {
    try {
        const users = await User.findAll({ 
            attributes: ['id', 'email', 'role'], 
            limit: 10 
        });
        
        console.log('Available users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();