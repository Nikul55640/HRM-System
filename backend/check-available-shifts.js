/**
 * Check available shifts to suggest correct assignment for nikl@hrm.com
 */

import { Shift } from './src/models/index.js';

async function checkAvailableShifts() {
    try {
        console.log('🔍 Available Shifts in the System:\n');

        const shifts = await Shift.findAll({
            where: { isActive: true },
            attributes: ['id', 'shiftName', 'shiftCode', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes', 'isDefault'],
            order: [['shiftStartTime', 'ASC']]
        });

        console.log('📊 Shift Options:');
        console.log('─'.repeat(80));
        console.log('ID | Name              | Start    | End      | Grace | Default');
        console.log('─'.repeat(80));

        shifts.forEach(shift => {
            const defaultFlag = shift.isDefault ? '✅' : '  ';
            console.log(`${shift.id.toString().padStart(2)} | ${shift.shiftName.padEnd(17)} | ${shift.shiftStartTime} | ${shift.shiftEndTime} | ${shift.gracePeriodMinutes.toString().padStart(5)} | ${defaultFlag}`);
        });

        console.log('─'.repeat(80));

        // Analyze nikl's clock-in patterns
        console.log('\n🕐 Analysis for nikl@hrm.com:');
        console.log('Based on their clock-in times:');
        console.log('- 9:00 AM, 12:31 PM, 6:44 PM');
        console.log('- These are typical DAY SHIFT hours, not evening shift');
        console.log('');

        // Find the most appropriate shift
        const dayShifts = shifts.filter(s => {
            const startHour = parseInt(s.shiftStartTime.split(':')[0]);
            return startHour >= 6 && startHour <= 12; // Morning to noon start times
        });

        if (dayShifts.length > 0) {
            console.log('✅ Recommended Shifts for nikl@hrm.com:');
            dayShifts.forEach(shift => {
                console.log(`   • ${shift.shiftName} (${shift.shiftStartTime} - ${shift.shiftEndTime})`);
            });
        }

        console.log('\n🔧 To fix nikl\'s attendance:');
        console.log('1. Reassign them to a day shift (like Morning Shift)');
        console.log('2. This will automatically recalculate their late minutes correctly');
        console.log('3. Their 12:31 PM clock-in will show as on-time or slightly late, not 691 minutes');

    } catch (error) {
        console.error('❌ Error checking shifts:', error);
    }
}

checkAvailableShifts()
    .then(() => {
        console.log('\n✅ Shift analysis completed');
        process.exit(0);
    });