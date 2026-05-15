export const PRODUCT_CATALOG = [
  // ── TALLYPRIME ──────────────────────────────────────────────────────────────
  { id: 'tp-silver-perp', name: 'TallyPrime Silver', brand: 'Tally', category: 'Accounting', variant: 'Perpetual', eu_price: 22500, cost_price: 19350, renewal_price: 4500, renewal_cost: 3870, is_active: true },
  { id: 'tp-gold-perp',   name: 'TallyPrime Gold',   brand: 'Tally', category: 'Accounting', variant: 'Perpetual', eu_price: 67500, cost_price: 58050, renewal_price: 13500, renewal_cost: 11610, is_active: true },
  { id: 'tp-silver-ar',   name: 'TallyPrime Silver',  brand: 'Tally', category: 'Accounting', variant: 'Annual Rental', eu_price: 8100, cost_price: 6966, renewal_price: 8100, renewal_cost: 6966, is_active: true },
  { id: 'tp-gold-ar',     name: 'TallyPrime Gold',    brand: 'Tally', category: 'Accounting', variant: 'Annual Rental', eu_price: 24300, cost_price: 20898, renewal_price: 24300, renewal_cost: 20898, is_active: true },
  { id: 'tp-silver-mo',   name: 'TallyPrime Silver',  brand: 'Tally', category: 'Accounting', variant: 'Monthly', eu_price: 750, cost_price: 645, renewal_price: 750, renewal_cost: 645, is_active: true },
  { id: 'tp-gold-mo',     name: 'TallyPrime Gold',    brand: 'Tally', category: 'Accounting', variant: 'Monthly', eu_price: 2250, cost_price: 1935, renewal_price: 2250, renewal_cost: 1935, is_active: true },

  // ── BUSY ACCOUNTING ─────────────────────────────────────────────────────────
  { id: 'busy-blue-sub',  name: 'BUSY Blue',     brand: 'BUSY', category: 'Accounting', variant: 'Annual Subscription', eu_price: 4999, cost_price: 3249, renewal_price: 4999, renewal_cost: 3249, is_active: true },
  { id: 'busy-saff-sub',  name: 'BUSY Saffron',  brand: 'BUSY', category: 'Accounting', variant: 'Annual Subscription', eu_price: 6999, cost_price: 4549, renewal_price: 6999, renewal_cost: 4549, is_active: true },
  { id: 'busy-emer-sub',  name: 'BUSY Emerald',  brand: 'BUSY', category: 'Accounting', variant: 'Annual Subscription', eu_price: 9999, cost_price: 6499, renewal_price: 9999, renewal_cost: 6499, is_active: true },
  { id: 'busy-blue-perp', name: 'BUSY Blue',     brand: 'BUSY', category: 'Accounting', variant: 'Perpetual', eu_price: 9999, cost_price: 6499, renewal_price: 3499, renewal_cost: 2624, is_active: true },
  { id: 'busy-std-perp',  name: 'BUSY Standard', brand: 'BUSY', category: 'Accounting', variant: 'Perpetual', eu_price: 14999, cost_price: 9749, renewal_price: 4999, renewal_cost: 3249, is_active: true },
  { id: 'busy-ent-perp',  name: 'BUSY Enterprise', brand: 'BUSY', category: 'Accounting', variant: 'Perpetual', eu_price: 19999, cost_price: 12999, renewal_price: 6999, renewal_cost: 4549, is_active: true },

  // ── DOLLAR ERP ──────────────────────────────────────────────────────────────
  { id: 'dollar-basic-s',   name: 'Dollar ERP Basic',    brand: 'Dollar', category: 'ERP', variant: 'Single User', eu_price: 9000, cost_price: 4680, renewal_price: 3600, renewal_cost: 1872, is_active: true },
  { id: 'dollar-basic-m',   name: 'Dollar ERP Basic',    brand: 'Dollar', category: 'ERP', variant: 'Multi User',  eu_price: 18000, cost_price: 9360, renewal_price: 7200, renewal_cost: 3744, is_active: true },
  { id: 'dollar-std-s',     name: 'Dollar ERP Standard', brand: 'Dollar', category: 'ERP', variant: 'Single User', eu_price: 13500, cost_price: 7020, renewal_price: 5400, renewal_cost: 2808, is_active: true },
  { id: 'dollar-std-m',     name: 'Dollar ERP Standard', brand: 'Dollar', category: 'ERP', variant: 'Multi User',  eu_price: 27000, cost_price: 14040, renewal_price: 10800, renewal_cost: 5616, is_active: true },
  { id: 'dollar-prem-s',    name: 'Dollar ERP Premium',  brand: 'Dollar', category: 'ERP', variant: 'Single User', eu_price: 18000, cost_price: 9360, renewal_price: 7200, renewal_cost: 3744, is_active: true },
  { id: 'dollar-prem-m',    name: 'Dollar ERP Premium',  brand: 'Dollar', category: 'ERP', variant: 'Multi User',  eu_price: 36000, cost_price: 18720, renewal_price: 14400, renewal_cost: 7488, is_active: true },
  { id: 'dollar-erp-srv',   name: 'Dollar ERP Edition',  brand: 'Dollar', category: 'ERP', variant: 'Server',      eu_price: 45000, cost_price: 23400, renewal_price: 18000, renewal_cost: 9360, is_active: true },
  { id: 'dollar-bsub-s',    name: 'Dollar ERP Basic',    brand: 'Dollar', category: 'ERP', variant: 'Subscription Single', eu_price: 3600, cost_price: 1872, renewal_price: 3600, renewal_cost: 1872, is_active: true },
  { id: 'dollar-bsub-m',    name: 'Dollar ERP Basic',    brand: 'Dollar', category: 'ERP', variant: 'Subscription Multi',  eu_price: 7200, cost_price: 3744, renewal_price: 7200, renewal_cost: 3744, is_active: true },

  // ── MARG ERP ────────────────────────────────────────────────────────────────
  { id: 'marg-nano',   name: 'Marg ERP Nano',   brand: 'Marg', category: 'ERP', variant: 'Perpetual', eu_price: 5400, cost_price: 3780, renewal_price: 2340, renewal_cost: 1638, is_active: true },
  { id: 'marg-basic',  name: 'Marg ERP Basic',  brand: 'Marg', category: 'ERP', variant: 'Perpetual', eu_price: 9999, cost_price: 6999, renewal_price: 3870, renewal_cost: 2709, is_active: true },
  { id: 'marg-silver', name: 'Marg ERP Silver', brand: 'Marg', category: 'ERP', variant: 'Perpetual', eu_price: 13500, cost_price: 9450, renewal_price: 4640, renewal_cost: 3248, is_active: true },
  { id: 'marg-gold',   name: 'Marg ERP Gold',   brand: 'Marg', category: 'ERP', variant: 'Perpetual', eu_price: 25200, cost_price: 17640, renewal_price: 9270, renewal_cost: 6489, is_active: true },

  // ── CLOUD HOSTING ───────────────────────────────────────────────────────────
  { id: 'cloud-tally-mo',   name: 'Tally on Cloud',   brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Monthly/User',  eu_price: 473, cost_price: 315, renewal_price: 473, renewal_cost: 315, is_active: true, unit: 'per user/month' },
  { id: 'cloud-tally-yr',   name: 'Tally on Cloud',   brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Yearly/User',   eu_price: 5670, cost_price: 3402, renewal_price: 5670, renewal_cost: 3402, is_active: true, unit: 'per user/year' },
  { id: 'cloud-marg-mo',    name: 'Marg on Cloud',    brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Monthly/User',  eu_price: 473, cost_price: 315, renewal_price: 473, renewal_cost: 315, is_active: true, unit: 'per user/month' },
  { id: 'cloud-marg-yr',    name: 'Marg on Cloud',    brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Yearly/User',   eu_price: 5670, cost_price: 3402, renewal_price: 5670, renewal_cost: 3402, is_active: true, unit: 'per user/year' },
  { id: 'cloud-app-sql-mo', name: 'App Hosting SQL',  brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Monthly/User',  eu_price: 683, cost_price: 473, renewal_price: 683, renewal_cost: 473, is_active: true, unit: 'per user/month' },
  { id: 'cloud-app-sql-yr', name: 'App Hosting SQL',  brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Yearly/User',   eu_price: 8190, cost_price: 5103, renewal_price: 8190, renewal_cost: 5103, is_active: true, unit: 'per user/year' },
  { id: 'cloud-app-nosql-mo', name: 'App Hosting no-SQL', brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Monthly/User', eu_price: 578, cost_price: 368, renewal_price: 578, renewal_cost: 368, is_active: true, unit: 'per user/month' },
  { id: 'cloud-app-nosql-yr', name: 'App Hosting no-SQL', brand: 'Cloudmitra', category: 'Cloud Hosting', variant: 'Yearly/User',  eu_price: 6930, cost_price: 3969, renewal_price: 6930, renewal_cost: 3969, is_active: true, unit: 'per user/year' },

  // ── VPS SERVERS ─────────────────────────────────────────────────────────────
  { id: 'vps-ssd-2g-mo',  name: 'VPS SSD-2G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 1438, cost_price: 943, renewal_price: 1438, renewal_cost: 943, specs: '1vCPU 2GB 40GB SSD 750GB BW', is_active: true },
  { id: 'vps-ssd-2g-yr',  name: 'VPS SSD-2G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 17250, cost_price: 10100, renewal_price: 17250, renewal_cost: 10100, specs: '1vCPU 2GB 40GB SSD 750GB BW', is_active: true },
  { id: 'vps-ssd-4g-mo',  name: 'VPS SSD-4G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 1944, cost_price: 1530, renewal_price: 1944, renewal_cost: 1530, specs: '2vCPU 4GB 60GB SSD 1000GB BW', is_active: true },
  { id: 'vps-ssd-4g-yr',  name: 'VPS SSD-4G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 23250, cost_price: 15242, renewal_price: 23250, renewal_cost: 15242, specs: '2vCPU 4GB 60GB SSD 1000GB BW', is_active: true },
  { id: 'vps-ssd-6g-mo',  name: 'VPS SSD-6G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 2703, cost_price: 2703, renewal_price: 2703, renewal_cost: 2703, specs: '2vCPU 6GB 80GB SSD 1000GB BW', is_active: true },
  { id: 'vps-ssd-6g-yr',  name: 'VPS SSD-6G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 30600, cost_price: 19523, renewal_price: 30600, renewal_cost: 19523, specs: '2vCPU 6GB 80GB SSD 1000GB BW', is_active: true },
  { id: 'vps-ssd-8g-mo',  name: 'VPS SSD-8G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 3462, cost_price: 3462, renewal_price: 3462, renewal_cost: 3462, specs: '4vCPU 8GB 100GB SSD 1250GB BW', is_active: true },
  { id: 'vps-ssd-8g-yr',  name: 'VPS SSD-8G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 41400, cost_price: 26662, renewal_price: 41400, renewal_cost: 26662, specs: '4vCPU 8GB 100GB SSD 1250GB BW', is_active: true },
  { id: 'vps-ssd-12g-mo', name: 'VPS SSD-12G', brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 4600, cost_price: 4600, renewal_price: 4600, renewal_cost: 4600, specs: '4vCPU 12GB 120GB SSD 1500GB BW', is_active: true },
  { id: 'vps-ssd-12g-yr', name: 'VPS SSD-12G', brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 55200, cost_price: 36553, renewal_price: 55200, renewal_cost: 36553, specs: '4vCPU 12GB 120GB SSD 1500GB BW', is_active: true },
  { id: 'vps-ssd-16g-mo', name: 'VPS SSD-16G', brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 6325, cost_price: 6325, renewal_price: 6325, renewal_cost: 6325, specs: '6vCPU 16GB 180GB SSD 2000GB BW', is_active: true },
  { id: 'vps-ssd-16g-yr', name: 'VPS SSD-16G', brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 75900, cost_price: 49669, renewal_price: 75900, renewal_cost: 49669, specs: '6vCPU 16GB 180GB SSD 2000GB BW', is_active: true },
  { id: 'hp-vps-4g-mo',   name: 'HP VPS 4G',   brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 5003, cost_price: 3220, renewal_price: 5003, renewal_cost: 3220, specs: '4vCPU 4GB 150GB SSD 1000GB BW', is_active: true },
  { id: 'hp-vps-4g-yr',   name: 'HP VPS 4G',   brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 60030, cost_price: 34003, renewal_price: 60030, renewal_cost: 34003, specs: '4vCPU 4GB 150GB SSD 1000GB BW', is_active: true },
  { id: 'hp-vps-8g-mo',   name: 'HP VPS 8G',   brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 10868, cost_price: 6728, renewal_price: 10868, renewal_cost: 6728, specs: '8vCPU 8GB 400GB SSD 1500GB BW', is_active: true },
  { id: 'hp-vps-8g-yr',   name: 'HP VPS 8G',   brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 130410, cost_price: 71042, renewal_price: 130410, renewal_cost: 71042, specs: '8vCPU 8GB 400GB SSD 1500GB BW', is_active: true },
  { id: 'hp-vps-16g-mo',  name: 'HP VPS 16G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Monthly', eu_price: 19033, cost_price: 11500, renewal_price: 19033, renewal_cost: 11500, specs: '12vCPU 16GB 750GB SSD 2500GB BW', is_active: true },
  { id: 'hp-vps-16g-yr',  name: 'HP VPS 16G',  brand: 'Cloudmitra', category: 'VPS', variant: 'Yearly',  eu_price: 228390, cost_price: 121440, renewal_price: 228390, renewal_cost: 121440, specs: '12vCPU 16GB 750GB SSD 2500GB BW', is_active: true },
  { id: 'ded-ds-16g-mo',  name: 'Dedicated DS-16G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Monthly', eu_price: 12075, cost_price: 9775, renewal_price: 12075, renewal_cost: 9775, specs: '8 Core 16GB 240GB SSD 2TB BW', is_active: true },
  { id: 'ded-ds-16g-yr',  name: 'Dedicated DS-16G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Yearly',  eu_price: 144900, cost_price: 103224, renewal_price: 144900, renewal_cost: 103224, specs: '8 Core 16GB 240GB SSD 2TB BW', is_active: true },
  { id: 'ded-ds-32g-mo',  name: 'Dedicated DS-32G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Monthly', eu_price: 17825, cost_price: 14375, renewal_price: 17825, renewal_cost: 14375, specs: '12 Core 32GB 480GB SSD 4TB BW', is_active: true },
  { id: 'ded-ds-32g-yr',  name: 'Dedicated DS-32G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Yearly',  eu_price: 213900, cost_price: 151800, renewal_price: 213900, renewal_cost: 151800, specs: '12 Core 32GB 480GB SSD 4TB BW', is_active: true },
  { id: 'ded-ds-64g-mo',  name: 'Dedicated DS-64G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Monthly', eu_price: 27025, cost_price: 21275, renewal_price: 27025, renewal_cost: 21275, specs: '16 Core 64GB 1TB SSD 6TB BW', is_active: true },
  { id: 'ded-ds-64g-yr',  name: 'Dedicated DS-64G', brand: 'Cloudmitra', category: 'Dedicated Server', variant: 'Yearly',  eu_price: 331200, cost_price: 224664, renewal_price: 331200, renewal_cost: 224664, specs: '16 Core 64GB 1TB SSD 6TB BW', is_active: true },

  // ── BUSINESS TOOLS ──────────────────────────────────────────────────────────
  { id: 'lc-remote-static',  name: 'Leadchain Remote Static IP',  brand: 'Leadchain', category: 'Business Tools', variant: 'Annual', eu_price: 1500, cost_price: 1050, renewal_price: 1500, renewal_cost: 1050, is_active: true },
  { id: 'lc-remote-dynamic', name: 'Leadchain Remote Dynamic IP', brand: 'Leadchain', category: 'Business Tools', variant: 'Annual', eu_price: 2000, cost_price: 1400, renewal_price: 2000, renewal_cost: 1400, is_active: true },
  { id: 'lc-image365',       name: 'Leadchain Image365',          brand: 'Leadchain', category: 'Business Tools', variant: 'Annual', eu_price: 2500, cost_price: 1750, renewal_price: 2500, renewal_cost: 1750, is_active: true },
  { id: 'ta-remote',         name: 'Team Assist Remote Support',  brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 2500, cost_price: 1750, renewal_price: 2500, renewal_cost: 1750, is_active: true },
  { id: 'ta-workspace',      name: 'Team Assist Workspace',       brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 2500, cost_price: 1750, renewal_price: 2500, renewal_cost: 1750, is_active: true },
  { id: 'tp-standard',       name: 'Team Page Standard',          brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 3600, cost_price: 2520, renewal_price: 3600, renewal_cost: 2520, is_active: true },
  { id: 'tp-professional',   name: 'Team Page Professional',      brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 6000, cost_price: 4200, renewal_price: 6000, renewal_cost: 4200, is_active: true },
  { id: 'hrm-basic-std',     name: 'HRMTree Basic Standard',      brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 8640, cost_price: 6048, renewal_price: 8640, renewal_cost: 6048, is_active: true },
  { id: 'hrm-basic-prem',    name: 'HRMTree Basic Premium',       brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 14400, cost_price: 10080, renewal_price: 14400, renewal_cost: 10080, is_active: true },
  { id: 'hrm-std-std',       name: 'HRMTree Standard Standard',   brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 21600, cost_price: 15120, renewal_price: 21600, renewal_cost: 15120, is_active: true },
  { id: 'hrm-std-prem',      name: 'HRMTree Standard Premium',    brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 36000, cost_price: 25200, renewal_price: 36000, renewal_cost: 25200, is_active: true },
  { id: 'hrm-pro-std',       name: 'HRMTree Professional Standard', brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 36000, cost_price: 25200, renewal_price: 36000, renewal_cost: 25200, is_active: true },
  { id: 'hrm-pro-prem',      name: 'HRMTree Professional Premium',  brand: 'Block Edge', category: 'HRM', variant: 'Annual', eu_price: 60000, cost_price: 42000, renewal_price: 60000, renewal_cost: 42000, is_active: true },
  { id: 'taxlin-ultralite',  name: 'Taxlin Ultra-lite',  brand: 'Block Edge', category: 'Tax', variant: 'Annual', eu_price: 3000, cost_price: 2100, renewal_price: 3000, renewal_cost: 2100, is_active: true },
  { id: 'taxlin-lite',       name: 'Taxlin Lite',        brand: 'Block Edge', category: 'Tax', variant: 'Annual', eu_price: 4000, cost_price: 2800, renewal_price: 4000, renewal_cost: 2800, is_active: true },
  { id: 'taxlin-pro',        name: 'Taxlin Professional', brand: 'Block Edge', category: 'Tax', variant: 'Annual', eu_price: 6000, cost_price: 4200, renewal_price: 6000, renewal_cost: 4200, is_active: true },
  { id: 'stayerly-starter',  name: 'Stayerly Starter',   brand: 'Block Edge', category: 'Hospitality', variant: 'Annual', eu_price: 12000, cost_price: 8400, renewal_price: 12000, renewal_cost: 8400, is_active: true },
  { id: 'stayerly-growth',   name: 'Stayerly Growth',    brand: 'Block Edge', category: 'Hospitality', variant: 'Annual', eu_price: 25000, cost_price: 17500, renewal_price: 25000, renewal_cost: 17500, is_active: true },
  { id: 'stayerly-scale',    name: 'Stayerly Scale',     brand: 'Block Edge', category: 'Hospitality', variant: 'Annual', eu_price: 45000, cost_price: 31500, renewal_price: 45000, renewal_cost: 31500, is_active: true },
  { id: 'pitchnxt-basic',    name: 'PitchNxt Basic',     brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 8400, cost_price: 5880, renewal_price: 8400, renewal_cost: 5880, is_active: true },
  { id: 'pitchnxt-std',      name: 'PitchNxt Standard',  brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 14400, cost_price: 10080, renewal_price: 14400, renewal_cost: 10080, is_active: true },
  { id: 'pitchnxt-prem',     name: 'PitchNxt Premium',   brand: 'Block Edge', category: 'Business Tools', variant: 'Annual', eu_price: 30000, cost_price: 21000, renewal_price: 30000, renewal_cost: 21000, is_active: true },

  // ── ADD-ONS ──────────────────────────────────────────────────────────────────
  { id: 'addon-peddle-mob',  name: 'Leadchain Peddle Mobile',   brand: 'Leadchain', category: 'Add-on', variant: 'Annual', eu_price: 1800, cost_price: 1260, renewal_price: 1800, renewal_cost: 1260, is_active: true },
  { id: 'addon-peddle-desk', name: 'Leadchain Peddle Desktop',  brand: 'Leadchain', category: 'Add-on', variant: 'Annual', eu_price: 3750, cost_price: 2625, renewal_price: 3750, renewal_cost: 2625, is_active: true },
  { id: 'addon-alert',       name: 'Leadchain Alert',            brand: 'Leadchain', category: 'Add-on', variant: 'Annual', eu_price: 3500, cost_price: 2450, renewal_price: 3500, renewal_cost: 2450, is_active: true },
  { id: 'addon-docsigner',   name: 'Doc Signer',                 brand: 'Block Edge', category: 'Add-on', variant: 'Annual', eu_price: 2500, cost_price: 1750, renewal_price: 2500, renewal_cost: 1750, is_active: true },
  { id: 'addon-twa-10k',     name: 'Tally WhatsApp 10K',         brand: 'Tally', category: 'Add-on', variant: 'Annual', eu_price: 3000, cost_price: 2100, renewal_price: 3000, renewal_cost: 2100, is_active: true },
  { id: 'addon-twa-unl',     name: 'Tally WhatsApp Unlimited',   brand: 'Tally', category: 'Add-on', variant: 'Annual', eu_price: 5500, cost_price: 3850, renewal_price: 5500, renewal_cost: 3850, is_active: true },
  { id: 'addon-mr-desk-unl', name: 'Message Rider Desktop Unlimited', brand: 'Block Edge', category: 'Add-on', variant: 'Annual', eu_price: 4500, cost_price: 3150, renewal_price: 4500, renewal_cost: 3150, is_active: true },
  { id: 'addon-mr-desk-10k', name: 'Message Rider Desktop 10K',  brand: 'Block Edge', category: 'Add-on', variant: 'Annual', eu_price: 2000, cost_price: 1400, renewal_price: 2000, renewal_cost: 1400, is_active: true },
  { id: 'addon-mr-web-10k',  name: 'Message Rider Web 10K',      brand: 'Block Edge', category: 'Add-on', variant: 'Annual', eu_price: 2500, cost_price: 1750, renewal_price: 2500, renewal_cost: 1750, is_active: true },
]

export const RECOMMENDATIONS = {
  Retail:          ['busy-saff-sub', 'cloud-tally-yr', 'vps-ssd-4g-yr'],
  Distribution:    ['cloud-marg-yr', 'dollar-std-m', 'vps-ssd-6g-yr'],
  Manufacturing:   ['dollar-prem-m', 'vps-ssd-8g-yr'],
  Pharma:          ['busy-emer-sub', 'cloud-marg-yr'],
  'Hotel/Restaurant': ['stayerly-growth', 'tp-standard'],
  Trading:         ['tp-silver-ar', 'cloud-app-nosql-yr'],
  Services:        ['busy-blue-sub', 'cloud-app-nosql-yr'],
}

export const BUSINESS_TYPES = ['Retail', 'Distribution', 'Manufacturing', 'Trading', 'Services', 'Pharma', 'Hotel/Restaurant']

export const CLOUD_HOSTING_IDS = ['cloud-tally-mo', 'cloud-tally-yr', 'cloud-marg-mo', 'cloud-marg-yr', 'cloud-app-sql-mo', 'cloud-app-sql-yr', 'cloud-app-nosql-mo', 'cloud-app-nosql-yr']

export const LICENSE_CATEGORIES = ['Accounting', 'ERP']

export function getProductById(id) {
  return PRODUCT_CATALOG.find(p => p.id === id)
}

export function formatINR(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
