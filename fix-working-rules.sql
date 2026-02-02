-- Check current working rules
SELECT id, ruleName, workingDays, weekendDays, effectiveFrom, effectiveTo, isActive, isDefault 
FROM working_rules 
WHERE isActive = 1 
ORDER BY effectiveFrom DESC;

-- If no working rules exist, create a default one
INSERT INTO working_rules (
    ruleName, 
    workingDays, 
    weekendDays, 
    effectiveFrom, 
    isActive, 
    isDefault, 
    createdBy
) VALUES (
    'Default Working Rule',
    JSON_ARRAY(1, 2, 3, 4, 5),  -- Monday to Friday
    JSON_ARRAY(0, 6),            -- Sunday and Saturday
    '2026-01-01',
    1,
    1,
    1
) ON DUPLICATE KEY UPDATE ruleName = ruleName;

-- Check if January 30, 2026 should be a working day
SELECT 
    '2026-01-30' as date,
    DAYOFWEEK('2026-01-30') - 1 as day_index,  -- MySQL DAYOFWEEK returns 1-7, convert to 0-6
    CASE 
        WHEN DAYOFWEEK('2026-01-30') - 1 IN (1,2,3,4,5) THEN 'Working Day'
        WHEN DAYOFWEEK('2026-01-30') - 1 IN (0,6) THEN 'Weekend'
        ELSE 'Unknown'
    END as day_type;