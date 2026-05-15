-- ============================================================
-- ACS Business Suite — Product Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

insert into public.products (name, category, brand, variant, eu_price, cost_price, renewal_price, renewal_cost, is_active) values

-- TallyPrime
('TallyPrime Silver',  'Accounting', 'Tally', 'Perpetual',       22500, 19350, 4500,  3870,  true),
('TallyPrime Gold',    'Accounting', 'Tally', 'Perpetual',       67500, 58050, 13500, 11610, true),
('TallyPrime Silver',  'Accounting', 'Tally', 'Annual Rental',   8100,  6966,  8100,  6966,  true),
('TallyPrime Gold',    'Accounting', 'Tally', 'Annual Rental',   24300, 20898, 24300, 20898, true),
('TallyPrime Silver',  'Accounting', 'Tally', 'Monthly',         750,   645,   750,   645,   true),
('TallyPrime Gold',    'Accounting', 'Tally', 'Monthly',         2250,  1935,  2250,  1935,  true),

-- BUSY Accounting
('BUSY Blue',      'Accounting', 'BUSY', 'Annual Subscription', 4999,  3249, 4999, 3249, true),
('BUSY Saffron',   'Accounting', 'BUSY', 'Annual Subscription', 6999,  4549, 6999, 4549, true),
('BUSY Emerald',   'Accounting', 'BUSY', 'Annual Subscription', 9999,  6499, 9999, 6499, true),
('BUSY Blue',      'Accounting', 'BUSY', 'Perpetual',           9999,  6499, 3499, 2624, true),
('BUSY Standard',  'Accounting', 'BUSY', 'Perpetual',           14999, 9749, 4999, 3249, true),
('BUSY Enterprise','Accounting', 'BUSY', 'Perpetual',           19999,12999, 6999, 4549, true),

-- Dollar ERP
('Dollar ERP Basic',    'ERP', 'Dollar', 'Single User',          9000, 4680,  3600,  1872,  true),
('Dollar ERP Basic',    'ERP', 'Dollar', 'Multi User',           18000, 9360,  7200,  3744,  true),
('Dollar ERP Standard', 'ERP', 'Dollar', 'Single User',          13500, 7020,  5400,  2808,  true),
('Dollar ERP Standard', 'ERP', 'Dollar', 'Multi User',           27000, 14040, 10800, 5616,  true),
('Dollar ERP Premium',  'ERP', 'Dollar', 'Single User',          18000, 9360,  7200,  3744,  true),
('Dollar ERP Premium',  'ERP', 'Dollar', 'Multi User',           36000, 18720, 14400, 7488,  true),
('Dollar ERP Edition',  'ERP', 'Dollar', 'Server',               45000, 23400, 18000, 9360,  true),
('Dollar ERP Basic',    'ERP', 'Dollar', 'Subscription Single',  3600,  1872,  3600,  1872,  true),
('Dollar ERP Basic',    'ERP', 'Dollar', 'Subscription Multi',   7200,  3744,  7200,  3744,  true),

-- Marg ERP
('Marg ERP Nano',   'ERP', 'Marg', 'Perpetual', 5400,  3780, 2340, 1638, true),
('Marg ERP Basic',  'ERP', 'Marg', 'Perpetual', 9999,  6999, 3870, 2709, true),
('Marg ERP Silver', 'ERP', 'Marg', 'Perpetual', 13500, 9450, 4640, 3248, true),
('Marg ERP Gold',   'ERP', 'Marg', 'Perpetual', 25200, 17640, 9270, 6489, true),

-- Cloud Hosting
('Tally on Cloud',    'Cloud Hosting', 'Cloudmitra', 'Monthly/User',  473,   315,   473,   315,  true),
('Tally on Cloud',    'Cloud Hosting', 'Cloudmitra', 'Yearly/User',   5670,  3402,  5670,  3402, true),
('Marg on Cloud',     'Cloud Hosting', 'Cloudmitra', 'Monthly/User',  473,   315,   473,   315,  true),
('Marg on Cloud',     'Cloud Hosting', 'Cloudmitra', 'Yearly/User',   5670,  3402,  5670,  3402, true),
('App Hosting SQL',   'Cloud Hosting', 'Cloudmitra', 'Monthly/User',  683,   473,   683,   473,  true),
('App Hosting SQL',   'Cloud Hosting', 'Cloudmitra', 'Yearly/User',   8190,  5103,  8190,  5103, true),
('App Hosting no-SQL','Cloud Hosting', 'Cloudmitra', 'Monthly/User',  578,   368,   578,   368,  true),
('App Hosting no-SQL','Cloud Hosting', 'Cloudmitra', 'Yearly/User',   6930,  3969,  6930,  3969, true),

-- VPS Servers
('VPS SSD-2G',  'VPS', 'Cloudmitra', 'Monthly', 1438,  943,  1438,  943,  true),
('VPS SSD-2G',  'VPS', 'Cloudmitra', 'Yearly',  17250, 10100, 17250, 10100, true),
('VPS SSD-4G',  'VPS', 'Cloudmitra', 'Monthly', 1944,  1530, 1944,  1530, true),
('VPS SSD-4G',  'VPS', 'Cloudmitra', 'Yearly',  23250, 15242, 23250, 15242, true),
('VPS SSD-6G',  'VPS', 'Cloudmitra', 'Monthly', 2703,  2703, 2703,  2703, true),
('VPS SSD-6G',  'VPS', 'Cloudmitra', 'Yearly',  30600, 19523, 30600, 19523, true),
('VPS SSD-8G',  'VPS', 'Cloudmitra', 'Monthly', 3462,  3462, 3462,  3462, true),
('VPS SSD-8G',  'VPS', 'Cloudmitra', 'Yearly',  41400, 26662, 41400, 26662, true),
('VPS SSD-12G', 'VPS', 'Cloudmitra', 'Monthly', 4600,  4600, 4600,  4600, true),
('VPS SSD-12G', 'VPS', 'Cloudmitra', 'Yearly',  55200, 36553, 55200, 36553, true),
('VPS SSD-16G', 'VPS', 'Cloudmitra', 'Monthly', 6325,  6325, 6325,  6325, true),
('VPS SSD-16G', 'VPS', 'Cloudmitra', 'Yearly',  75900, 49669, 75900, 49669, true),
('HP VPS 4G',   'VPS', 'Cloudmitra', 'Monthly', 5003,  3220, 5003,  3220, true),
('HP VPS 4G',   'VPS', 'Cloudmitra', 'Yearly',  60030, 34003, 60030, 34003, true),
('HP VPS 8G',   'VPS', 'Cloudmitra', 'Monthly', 10868, 6728, 10868, 6728, true),
('HP VPS 8G',   'VPS', 'Cloudmitra', 'Yearly',  130410, 71042, 130410, 71042, true),
('HP VPS 16G',  'VPS', 'Cloudmitra', 'Monthly', 19033, 11500, 19033, 11500, true),
('HP VPS 16G',  'VPS', 'Cloudmitra', 'Yearly',  228390, 121440, 228390, 121440, true),
('Dedicated DS-16G','Dedicated Server','Cloudmitra','Monthly',12075, 9775, 12075, 9775, true),
('Dedicated DS-16G','Dedicated Server','Cloudmitra','Yearly', 144900,103224,144900,103224,true),
('Dedicated DS-32G','Dedicated Server','Cloudmitra','Monthly',17825,14375,17825,14375,true),
('Dedicated DS-32G','Dedicated Server','Cloudmitra','Yearly', 213900,151800,213900,151800,true),
('Dedicated DS-64G','Dedicated Server','Cloudmitra','Monthly',27025,21275,27025,21275,true),
('Dedicated DS-64G','Dedicated Server','Cloudmitra','Yearly', 331200,224664,331200,224664,true),

-- Business Tools
('Leadchain Remote Static IP',  'Business Tools', 'Leadchain',  'Annual', 1500,  1050, 1500,  1050, true),
('Leadchain Remote Dynamic IP', 'Business Tools', 'Leadchain',  'Annual', 2000,  1400, 2000,  1400, true),
('Leadchain Image365',          'Business Tools', 'Leadchain',  'Annual', 2500,  1750, 2500,  1750, true),
('Team Assist Remote Support',  'Business Tools', 'Block Edge', 'Annual', 2500,  1750, 2500,  1750, true),
('Team Assist Workspace',       'Business Tools', 'Block Edge', 'Annual', 2500,  1750, 2500,  1750, true),
('Team Page Standard',          'Business Tools', 'Block Edge', 'Annual', 3600,  2520, 3600,  2520, true),
('Team Page Professional',      'Business Tools', 'Block Edge', 'Annual', 6000,  4200, 6000,  4200, true),
('HRMTree Basic Standard',      'HRM',            'Block Edge', 'Annual', 8640,  6048, 8640,  6048, true),
('HRMTree Basic Premium',       'HRM',            'Block Edge', 'Annual', 14400, 10080,14400, 10080,true),
('HRMTree Standard Standard',   'HRM',            'Block Edge', 'Annual', 21600, 15120,21600, 15120,true),
('HRMTree Standard Premium',    'HRM',            'Block Edge', 'Annual', 36000, 25200,36000, 25200,true),
('HRMTree Professional Standard','HRM',           'Block Edge', 'Annual', 36000, 25200,36000, 25200,true),
('HRMTree Professional Premium','HRM',            'Block Edge', 'Annual', 60000, 42000,60000, 42000,true),
('Taxlin Ultra-lite',            'Tax',            'Block Edge', 'Annual', 3000,  2100, 3000,  2100, true),
('Taxlin Lite',                  'Tax',            'Block Edge', 'Annual', 4000,  2800, 4000,  2800, true),
('Taxlin Professional',          'Tax',            'Block Edge', 'Annual', 6000,  4200, 6000,  4200, true),
('Stayerly Starter',             'Hospitality',    'Block Edge', 'Annual', 12000, 8400, 12000, 8400, true),
('Stayerly Growth',              'Hospitality',    'Block Edge', 'Annual', 25000, 17500,25000, 17500,true),
('Stayerly Scale',               'Hospitality',    'Block Edge', 'Annual', 45000, 31500,45000, 31500,true),
('PitchNxt Basic',               'Business Tools', 'Block Edge', 'Annual', 8400,  5880, 8400,  5880, true),
('PitchNxt Standard',            'Business Tools', 'Block Edge', 'Annual', 14400, 10080,14400, 10080,true),
('PitchNxt Premium',             'Business Tools', 'Block Edge', 'Annual', 30000, 21000,30000, 21000,true),

-- Add-ons
('Leadchain Peddle Mobile',      'Add-on', 'Leadchain',  'Annual', 1800, 1260, 1800, 1260, true),
('Leadchain Peddle Desktop',     'Add-on', 'Leadchain',  'Annual', 3750, 2625, 3750, 2625, true),
('Leadchain Alert',              'Add-on', 'Leadchain',  'Annual', 3500, 2450, 3500, 2450, true),
('Doc Signer',                   'Add-on', 'Block Edge', 'Annual', 2500, 1750, 2500, 1750, true),
('Tally WhatsApp 10K',           'Add-on', 'Tally',      'Annual', 3000, 2100, 3000, 2100, true),
('Tally WhatsApp Unlimited',     'Add-on', 'Tally',      'Annual', 5500, 3850, 5500, 3850, true),
('Message Rider Desktop Unlimited','Add-on','Block Edge','Annual', 4500, 3150, 4500, 3150, true),
('Message Rider Desktop 10K',   'Add-on', 'Block Edge', 'Annual', 2000, 1400, 2000, 1400, true),
('Message Rider Web 10K',       'Add-on', 'Block Edge', 'Annual', 2500, 1750, 2500, 1750, true)

on conflict do nothing;
